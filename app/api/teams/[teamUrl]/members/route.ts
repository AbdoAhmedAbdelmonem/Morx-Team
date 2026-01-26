import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { ApiResponse } from '@/lib/types';

/**
 * Get team members
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

    // Verify user is team member
    const { data: membership } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', team.team_id)
      .eq('auth_user_id', authUserId)
      .single();

    if (!membership) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    // Get all members
    const { data: members, error } = await supabase
      .from('team_members')
      .select('auth_user_id, role, joined_at')
      .eq('team_id', team.team_id);

    if (error) throw error;

    // Get user info for all members
    const memberIds = members?.map((m: any) => m.auth_user_id) || [];
    const { data: users } = await supabase
      .from('users')
      .select('auth_user_id, first_name, last_name, email, profile_image')
      .in('auth_user_id', memberIds);

    const userMap: Record<string, any> = {};
    users?.forEach((u: any) => {
      userMap[u.auth_user_id] = u;
    });

    const membersWithInfo = members?.map((m: any) => ({
      ...m,
      ...userMap[m.auth_user_id],
    })) || [];

    return NextResponse.json<ApiResponse>({
      success: true,
      data: membersWithInfo,
    });
  } catch (error) {
    console.error('Get team members error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Add member to team (owner/admin only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { teamUrl: string } }
) {
  const user = await requireAuth(request);
  if (user instanceof NextResponse) return user;

  try {
    const body = await request.json();
    const { email, role } = body;
    const authUserId = user.id;
    const { teamUrl } = params;

    if (!email) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'email is required' },
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

    // Check requester permissions
    const { data: membership } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', team.team_id)
      .eq('auth_user_id', authUserId)
      .single();

    if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Only owners and admins can add members' },
        { status: 403 }
      );
    }

    // Find user by email
    const { data: userToAdd } = await supabase
      .from('users')
      .select('auth_user_id, first_name')
      .eq('email', email)
      .single();

    if (!userToAdd) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'User not found with that email' },
        { status: 404 }
      );
    }

    // Check if already a member
    const { data: existingMember } = await supabase
      .from('team_members')
      .select('auth_user_id')
      .eq('team_id', team.team_id)
      .eq('auth_user_id', userToAdd.auth_user_id)
      .single();

    if (existingMember) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'User is already a team member' },
        { status: 400 }
      );
    }

    // Add member
    await supabase.from('team_members').insert({
      auth_user_id: userToAdd.auth_user_id,
      team_id: team.team_id,
      role: role || 'member'
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: `${userToAdd.first_name} added to team`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Add team member error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Remove member from team
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { teamUrl: string } }
) {
  const user = await requireAuth(request);
  if (user instanceof NextResponse) return user;

  try {
    const { searchParams } = new URL(request.url);
    const targetAuthUserId = searchParams.get('target_auth_user_id');
    const authUserId = user.id;
    const { teamUrl } = params;

    if (!targetAuthUserId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'target_auth_user_id is required' },
        { status: 400 }
      );
    }

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

    // Check requester permissions
    const { data: membership } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', team.team_id)
      .eq('auth_user_id', authUserId)
      .single();

    if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Only owners and admins can remove members' },
        { status: 403 }
      );
    }

    // Remove member
    await supabase
      .from('team_members')
      .delete()
      .eq('team_id', team.team_id)
      .eq('auth_user_id', targetAuthUserId);

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Member removed from team',
    });
  } catch (error) {
    console.error('Remove team member error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
