import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { supabaseAdmin as supabase } from '@/lib/supabase';

/**
 * Debug: Get a single user by auth_user_id or email
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const authUserId = searchParams.get('auth_user_id');
    const email = searchParams.get('email');

    if (!authUserId && !email) {
      return NextResponse.json(
        { error: 'auth_user_id or email is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('users')
      .select('auth_user_id, first_name, email, profile_image, created_at');

    if (authUserId) {
      query = query.eq('auth_user_id', authUserId);
    } else if (email) {
      query = query.ilike('email', email);
    }

    const { data: user, error } = await query.single();

    if (error || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user
    });
  } catch (error) {
    // console.error('Debug user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
