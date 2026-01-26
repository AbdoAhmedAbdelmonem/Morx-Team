import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';

/**
 * Debug: Get all users with their auth_user_id
 */
export async function GET(request: NextRequest) {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('auth_user_id, first_name, email, profile_image, created_at, password');

    if (error) throw error;

    return NextResponse.json({
      success: true,
      count: users?.length || 0,
      users
    });
  } catch (error) {
    console.error('Debug users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
