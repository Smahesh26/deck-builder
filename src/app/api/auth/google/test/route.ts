import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'Google auth test route working',
    env: {
      hasClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasAppUrl: !!process.env.NEXT_PUBLIC_APP_URL,
      clientIdLength: process.env.GOOGLE_CLIENT_ID?.length || 0,
      appUrl: process.env.NEXT_PUBLIC_APP_URL
    }
  });
}