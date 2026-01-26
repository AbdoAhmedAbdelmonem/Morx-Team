import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { ApiResponse } from '@/lib/types';

/**
 * Get team join requests (owner/admin only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { teamUrl: string } }
) {
  const user = await requireAuth(request);
  if (user instanceof NextResponse) return user;

  try {
    const authUserId = user.id;
    const { teamUrl } = params;

    // Get team
    const { data: team } = await supabase
      .from('teams')
      .select('team_id')
      .eq('team_url', teamUrl)
      .single();

    if (!team) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Team not found' },
        { status: 404 }
      );
    }

    // Check permissions
    const { data: membership } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', team.team_id)
      .eq('auth_user_id', authUserId)
      .single();

    if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Only owners and admins can view join requests' },
        { status: 403 }
      );
    }

    // Get pending requests
    const { data: requests, error } = await supabase
      .from('team_join_requests')
      .select('request_id, auth_user_id, status, created_at')
      .eq('team_id', team.team_id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Get user info for requesters
    const requesterIds = requests?.map((r: any) => r.auth_user_id) || [];
    let usersMap: Record<string, any> = {};

    if (requesterIds.length > 0) {
      const { data: users } = await supabase
        .from('users')
        .select('auth_user_id, first_name, last_name, email, profile_image')
        .in('auth_user_id', requesterIds);

      users?.forEach((u: any) => {
        usersMap[u.auth_user_id] = u;
      });
    }

    const requestsWithUsers = requests?.map((r: any) => ({
      ...r,
      user: usersMap[r.auth_user_id] || null,
    })) || [];

    return NextResponse.json<ApiResponse>({
      success: true,
      data: requestsWithUsers,
    });
  } catch (error) {
    console.error('Get join requests error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Handle join request (approve/reject)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { teamUrl: string } }
) {
  const user = await requireAuth(request);
  if (user instanceof NextResponse) return user;

  try {
    const body = await request.json();
    const { request_id, action } = body;
    const authUserId = user.id;
    const { teamUrl } = params;

    if (!request_id || !action) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'request_id and action are required' },
        { status: 400 }
      );
    }

    // Get team
    const { data: team } = await supabase
      .from('teams')
      .select('team_id, team_name')
      .eq('team_url', teamUrl)
      .single();

    if (!team) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Team not found' },
        { status: 404 }
      );
    }

    // Check permissions
    const { data: membership } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', team.team_id)
      .eq('auth_user_id', authUserId)
      .single();

    if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Only owners and admins can handle join requests' },
        { status: 403 }
      );
    }

    // Get the join request
    const { data: joinRequest } = await supabase
      .from('team_join_requests')
      .select('request_id, auth_user_id, status')
      .eq('request_id', request_id)
      .eq('team_id', team.team_id)
      .single();

    if (!joinRequest || joinRequest.status !== 'pending') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Request not found or already processed' },
        { status: 404 }
      );
    }

    if (action === 'approve') {
      // Add user as member
      await supabase.from('team_members').insert({
        auth_user_id: joinRequest.auth_user_id,
        team_id: team.team_id,
        role: 'member'
      });

      // Update request status
      await supabase
        .from('team_join_requests')
        .update({ status: 'approved' })
        .eq('request_id', request_id);

      // Send notification
      await supabase.from('notifications').insert({
        auth_user_id: joinRequest.auth_user_id,
        title: '🎉 Request Approved',
        message: `Your request to join ${team.team_name} has been approved!`,
        type: 'team_added',
        is_read: false
      });

      return NextResponse.json<ApiResponse>({
        success: true,
        message: 'Request approved',
      });
    } else {
      // Reject request
      await supabase
        .from('team_join_requests')
        .update({ status: 'rejected' })
        .eq('request_id', request_id);

      // Send notification
      await supabase.from('notifications').insert({
        auth_user_id: joinRequest.auth_user_id,
        title: '❌ Request Declined',
        message: `Your request to join ${team.team_name} was declined.`,
        type: 'team_request_declined',
        is_read: false
      });

      return NextResponse.json<ApiResponse>({
        success: true,
        message: 'Request rejected',
      });
    }
  } catch (error) {
    console.error('Handle join request error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
