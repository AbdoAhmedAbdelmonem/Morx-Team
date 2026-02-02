import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const DAILY_LIMIT = 10

// Helper to get today's date key
function getTodayKey(): string {
  return new Date().toISOString().split('T')[0] // YYYY-MM-DD
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: true,
        data: {
          used: 0,
          limit: DAILY_LIMIT,
          remaining: DAILY_LIMIT,
          date: getTodayKey()
        }
      })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    const today = getTodayKey()

    // Get current usage
    const { data: usage, error } = await supabase
      .from('ai_usage')
      .select('request_count')
      .eq('user_id', userId)
      .eq('date', today)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching usage:', error)
    }

    const used = usage?.request_count || 0
    const remaining = Math.max(0, DAILY_LIMIT - used)

    return NextResponse.json({
      success: true,
      data: {
        used,
        limit: DAILY_LIMIT,
        remaining,
        date: today
      }
    })

  } catch (error) {
    console.error('AI usage error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
