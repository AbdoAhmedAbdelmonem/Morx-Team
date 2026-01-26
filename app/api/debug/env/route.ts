import { NextResponse } from 'next/server';

// Debug endpoint - DELETE THIS IN PRODUCTION
export async function GET() {
  return NextResponse.json({
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'SET (length: ' + process.env.GOOGLE_CLIENT_ID.length + ')' : 'NOT SET',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'NOT SET',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NOT SET',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET',
    NODE_ENV: process.env.NODE_ENV,
  });
}
