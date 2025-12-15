import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Cliente Supabase com service role para operações administrativas
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function POST(req: NextRequest) {
  try {
    // Verificar se as variáveis de ambiente estão configuradas
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripeSecretKey) {
      console.error('STRIPE_SECRET_KEY não configurada');
      return NextResponse.json(
        { error: 'Configuração do Stripe ausente' },
        { status: 500 }
      );
    }

    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET não configurada');
      return NextResponse.json(
        { error: 'Configuração do webhook ausente' },
        { status: 500 }
      );
    }

    // Inicializar o cliente Stripe apenas quando necessário
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-12-18.acacia',
    });

    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Assinatura do webhook ausente' },
        { status: 400 }
      );
    }

    // Verificar a assinatura do webhook
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Erro ao verificar webhook:', err);
      return NextResponse.json(
        { error: 'Assinatura inválida' },
        { status: 400 }
      );
    }

    // Processar eventos do webhook
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Checkout concluído:', session.id);

        // Extrair informações do pagamento
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;
        const customerEmail = session.customer_details?.email;

        if (customerEmail && subscriptionId) {
          // Buscar detalhes da assinatura
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);

          // Salvar assinatura no Supabase
          const { error: subError } = await supabaseAdmin
            .from('subscriptions')
            .upsert({
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              stripe_payment_intent_id: session.payment_intent as string,
              status: subscription.status,
              price_id: subscription.items.data[0].price.id,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            }, {
              onConflict: 'stripe_customer_id'
            });

          if (subError) {
            console.error('Erro ao salvar assinatura:', subError);
          } else {
            console.log('Assinatura salva com sucesso para:', customerEmail);
          }
        }

        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Pagamento bem-sucedido:', paymentIntent.id);

        // Atualizar status da assinatura se existir
        if (paymentIntent.customer) {
          const { error: updateError } = await supabaseAdmin
            .from('subscriptions')
            .update({
              stripe_payment_intent_id: paymentIntent.id,
              status: 'active',
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_customer_id', paymentIntent.customer as string);

          if (updateError) {
            console.error('Erro ao atualizar assinatura:', updateError);
          }
        }

        break;
      }

      case 'payment_intent.payment_failed': {
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        console.log('Pagamento falhou:', failedPayment.id);

        // Atualizar status para past_due
        if (failedPayment.customer) {
          await supabaseAdmin
            .from('subscriptions')
            .update({
              status: 'past_due',
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_customer_id', failedPayment.customer as string);
        }

        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('Assinatura criada:', subscription.id);

        // Salvar nova assinatura
        await supabaseAdmin
          .from('subscriptions')
          .insert({
            stripe_customer_id: subscription.customer as string,
            stripe_subscription_id: subscription.id,
            status: subscription.status,
            price_id: subscription.items.data[0].price.id,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          });

        break;
      }

      case 'customer.subscription.updated': {
        const updatedSubscription = event.data.object as Stripe.Subscription;
        console.log('Assinatura atualizada:', updatedSubscription.id);

        // Atualizar assinatura existente
        await supabaseAdmin
          .from('subscriptions')
          .update({
            status: updatedSubscription.status,
            price_id: updatedSubscription.items.data[0].price.id,
            current_period_start: new Date(updatedSubscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(updatedSubscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', updatedSubscription.id);

        break;
      }

      case 'customer.subscription.deleted': {
        const deletedSubscription = event.data.object as Stripe.Subscription;
        console.log('Assinatura cancelada:', deletedSubscription.id);

        // Atualizar status para canceled
        await supabaseAdmin
          .from('subscriptions')
          .update({
            status: 'canceled',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', deletedSubscription.id);

        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('Pagamento de fatura bem-sucedido:', invoice.id);

        // Atualizar status da assinatura para active
        if (invoice.subscription) {
          await supabaseAdmin
            .from('subscriptions')
            .update({
              status: 'active',
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', invoice.subscription as string);
        }

        break;
      }

      default:
        console.log(`Evento não tratado: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
