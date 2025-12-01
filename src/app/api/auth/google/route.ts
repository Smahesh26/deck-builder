import { NextRequest, NextResponse } from 'next/server';
import { generateGoogleAuthUrl } from '../../../../lib/auth';

export async function GET() {
  try {
    console.log('Google auth route called');
    console.log('Environment check:', {
      hasClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasAppUrl: !!process.env.NEXT_PUBLIC_APP_URL,
      clientId: process.env.GOOGLE_CLIENT_ID?.substring(0, 10) + '...',
      appUrl: process.env.NEXT_PUBLIC_APP_URL
    });

    if (!process.env.GOOGLE_CLIENT_ID) {
      return NextResponse.json(
        { error: 'Google Client ID not configured' },
        { status: 500 }
      );
    }

    const authUrl = generateGoogleAuthUrl();
    console.log('Generated auth URL:', authUrl);
    
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Google auth error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize Google authentication', details: error },
      { status: 500 }
    );
  }
}