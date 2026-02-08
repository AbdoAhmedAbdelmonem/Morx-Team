import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { createClient } from '@supabase/supabase-js'
import { requireAuth } from '@/lib/middleware/auth'

// Plan-based daily limits (must match generate/route.ts)
const PLAN_LIMITS: { [key: string]: number } = {
  free: 5,
  starter: 10,
  professional: 20,
  enterprise: -1, // Unlimited
}

// Helper to get today's date key
function getTodayKey(): string {
  return new Date().toISOString().split('T')[0] // YYYY-MM-DD
}

// Helper to get user's plan limit
function getPlanLimit(plan: string | null): number {
  if (!plan) return PLAN_LIMITS.free
  return PLAN_LIMITS[plan.toLowerCase()] ?? PLAN_LIMITS.free
}

export async function GET(request: NextRequest) {
  // Require authentication
  const user = await requireAuth(request);
  
  if (user instanceof NextResponse) {
    return user; // Return 401 error
  }

  try {
    // Use authenticated user ID
    const userId = user.id;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: true,
        data: {
          used: 0,
          limit: PLAN_LIMITS.free,
          remaining: PLAN_LIMITS.free,
          date: getTodayKey(),
          plan: 'free',
          unlimited: false
        }
      })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    const today = getTodayKey()

    // Get user's plan
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('plan')
      .eq('auth_user_id', userId)
      .single()

    if (userError && userError.code !== 'PGRST116') {
      console.error('Error fetching user plan:', userError)
    }

    const userPlan = userData?.plan || 'free'
    const dailyLimit = getPlanLimit(userPlan)
    const isUnlimited = dailyLimit === -1

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
    const remaining = isUnlimited ? -1 : Math.max(0, dailyLimit - used)

    return NextResponse.json({
      success: true,
      data: {
        used,
        limit: isUnlimited ? -1 : dailyLimit,
        remaining,
        date: today,
        plan: userPlan,
        unlimited: isUnlimited
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
