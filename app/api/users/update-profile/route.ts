import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { ApiResponse } from '@/lib/types';
import bcrypt from 'bcryptjs';

/**
 * Update user profile - uses authenticated user's ID from session
 */
export async function PUT(request: NextRequest) {
  const user = await requireAuth(request);
  if (user instanceof NextResponse) return user;

  try {
    const body = await request.json();
    const { first_name, last_name, password, study_level, department, faculty, bio, skills, is_available } = body;

    if (!first_name || !last_name) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'first_name and last_name are required' },
        { status: 400 }
      );
    }

    // Build update object
    const updates: Record<string, any> = {
      first_name,
      last_name
    };

    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.password = hashedPassword;
    }
    
    if (study_level !== undefined) {
      updates.study_level = study_level;
    }
    
    if (department !== undefined) {
      updates.department = department;
    }

    if (faculty !== undefined) {
      updates.faculty = faculty;
    }

    if (bio !== undefined) {
      updates.bio = bio;
    }

    if (skills !== undefined) {
      updates.skills = skills;
    }

    if (is_available !== undefined) {
      updates.is_available = is_available;
    }

    // Execute update using auth_user_id from session
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(updates)
      .eq('auth_user_id', user.id)
      .select('auth_user_id, first_name, last_name, email, profile_image, study_level, department, faculty, bio, skills, is_available, created_at')
      .single();

    if (updateError) throw updateError;

    // Create notification for profile update
    const changedFields = [];
    if (first_name || last_name) changedFields.push('name');
    if (password && password.trim() !== '') changedFields.push('password');
    if (study_level !== undefined) changedFields.push('study level');
    if (department !== undefined) changedFields.push('department');
    if (faculty !== undefined) changedFields.push('faculty');

    try {
      await supabase.from('notifications').insert({
        auth_user_id: user.id,
        title: '👤 Profile Updated',
        message: `Your profile has been updated successfully. Changes: ${changedFields.join(', ')}`,
        type: 'profile_update',
        is_read: false
      });
    } catch (e) {
      // Notification creation is optional
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: 'Profile updated successfully',
        data: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
