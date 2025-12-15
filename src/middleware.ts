import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  // Middleware simplificado sem Supabase para evitar erros no Edge Runtime
  // A proteção de rotas será feita no lado do cliente
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/weight/:path*', '/medication/:path*', '/habits/:path*'],
};
