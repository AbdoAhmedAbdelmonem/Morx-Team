import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { supabaseAdmin as supabase } from '@/lib/supabase';

/**
 * Get all users (for search/browse functionality)
 * This is a public endpoint for user discovery
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');
    const skills = searchParams.get('skills');

    let query = supabase
      .from('users')
      .select('auth_user_id, first_name, last_name, email, profile_image, department, skills');

    if (department) {
      query = query.eq('department', department);
    }

    if (skills) {
      // Assuming skills is a comma-separated string or stored as an array in DB
      const skillList = skills.split(',');
      query = query.contains('skills', skillList);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[API Users] Database error:', error);
      return NextResponse.json({ success: false, error: "Database error", details: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('[API Users] Server error:', error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
