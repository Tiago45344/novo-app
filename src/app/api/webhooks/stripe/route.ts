import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

// Esta rota será chamada pela Stripe quando houver eventos de pagamento
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = headers().get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    // Aqui você processaria o webhook da Stripe
    // Por enquanto, apenas retornamos sucesso
    // Em produção, você verificaria:
    // 1. Assinatura do webhook
    // 2. Tipo de evento (checkout.session.completed, customer.subscription.created, etc.)
    // 3. Atualizaria o status da assinatura no Supabase

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 });
  }
}
