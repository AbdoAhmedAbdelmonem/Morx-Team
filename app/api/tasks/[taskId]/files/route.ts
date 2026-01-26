import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { ApiResponse } from '@/lib/types';

/**
 * Handle bulk files for a specific task
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  const user = await requireAuth(request);
  if (user instanceof NextResponse) return user;

  try {
    const { taskId } = params;
    
    // Get task files
    const { data: files, error } = await supabase
      .from('task_files')
      .select('*')
      .eq('task_id', taskId);

    if (error) throw error;

    return NextResponse.json<ApiResponse>({
      success: true,
      data: files || [],
    });
  } catch (error) {
    console.error('Get files error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
