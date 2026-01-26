import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { ApiResponse } from '@/lib/types';

/**
 * Get invitations for the authenticated user
 */
export async function GET(request: NextRequest) {
  const user = await requireAuth(request);
  if (user instanceof NextResponse) return user;

  try {
    const authUserId = user.id;

    // Get invitations for this user
    const { data: invitations, error } = await supabase
      .from('team_invitations')
      .select(`
        *,
        team:teams(team_id, team_name, team_url, description)
      `)
      .eq('auth_user_id', authUserId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Get inviter info separately to avoid FK hint issues
    const inviterIds = [...new Set(invitations?.map((inv: any) => inv.inviter_id) || [])];
    let invitersMap: Record<string, any> = {};

    if (inviterIds.length > 0) {
      const { data: inviters } = await supabase
        .from('users')
        .select('auth_user_id, first_name, last_name, profile_image')
        .in('auth_user_id', inviterIds);

      inviters?.forEach((inv: any) => {
        invitersMap[inv.auth_user_id] = inv;
      });
    }

    // Combine data
    const invitationsWithInviter = invitations?.map((inv: any) => ({
      ...inv,
      inviter: invitersMap[inv.inviter_id] || null
    })) || [];

    return NextResponse.json<ApiResponse>({
      success: true,
      data: invitationsWithInviter,
    });
  } catch (error) {
    console.error('Get invitations error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
