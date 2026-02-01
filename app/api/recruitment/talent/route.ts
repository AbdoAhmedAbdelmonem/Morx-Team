import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { ApiResponse } from '@/lib/types';

/**
 * Get all available users (Talent Pool)
 */
export async function GET(request: NextRequest) {
  // Optional auth: some public profile info might be visible, but we prefer auth
  const user = await requireAuth(request);
  if (user instanceof NextResponse) return user;

  try {
    const { searchParams } = new URL(request.url);
    const skill = searchParams.get('skill');
    const department = searchParams.get('department');

    let query = supabase
      .from('users')
      .select('auth_user_id, first_name, last_name, email, profile_image, bio, skills, department, study_level, plan')
      .eq('is_available', true);

    if (department) {
      query = query.eq('department', department);
    }

    const { data: users, error } = await query;

    if (error) throw error;

    // Filter by skill manually
    let filteredUsers = users || [];
    if (skill) {
      filteredUsers = filteredUsers.filter((u: any) => 
        u.skills && Array.isArray(u.skills) && u.skills.some((s: string) => s.toLowerCase().includes(skill.toLowerCase()))
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: filteredUsers,
    });
  } catch (error) {
    console.error('Get talent error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
