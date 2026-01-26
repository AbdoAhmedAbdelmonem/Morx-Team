import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabaseAdmin as supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email - MUST use auth_user_id
    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !userData) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (!userData.password) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user has auth_user_id (required for new auth system)
    if (!userData.auth_user_id) {
       return NextResponse.json(
        { error: 'Account needs migration. Please use Google Sign-In or contact support.' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, userData.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Return user data with auth_user_id (UUID) - REMOVED numeric user_id
    const sessionData = {
      auth_user_id: userData.auth_user_id,  // UUID - the only PK
      first_name: userData.first_name,
      last_name: userData.last_name,
      email: userData.email,
      profile_image: userData.profile_image,
      created_at: userData.created_at,
      isLoggedIn: true,
    };


    const response = NextResponse.json({ user: sessionData });
    
    // Set a persistent cookie for the session
    response.cookies.set('morx_session', JSON.stringify(sessionData), {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      httpOnly: false, // Accessible by client-side sync
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
