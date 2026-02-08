import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAuth } from '@/lib/middleware/auth'

// General-purpose AI generation endpoint
// Uses OpenRouter or Gemini API
// Rate limited based on user plan
// Protected - requires authentication

// Plan-based daily limits
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

export async function POST(request: NextRequest) {
  // Require authentication
  const user = await requireAuth(request);
  
  if (user instanceof NextResponse) {
    return user; // Return 401 error
  }

  try {
    const body = await request.json()
    const { prompt, max_tokens = 500 } = body

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      )
    }

    // Use authenticated user ID instead of request body
    const userId = user.id;

    // Check rate limit using Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (supabaseUrl && supabaseKey) {
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

      // Check current usage (skip for enterprise/unlimited)
      if (dailyLimit !== -1) {
        const { data: usage, error: usageError } = await supabase
          .from('ai_usage')
          .select('request_count')
          .eq('user_id', userId)
          .eq('date', today)
          .single()

        if (usageError && usageError.code !== 'PGRST116') {
          console.error('Error checking usage:', usageError)
        }

        const currentCount = usage?.request_count || 0

        if (currentCount >= dailyLimit) {
          const planName = userPlan.charAt(0).toUpperCase() + userPlan.slice(1)
          return NextResponse.json(
            { 
              success: false, 
              error: `Daily limit reached (${dailyLimit} requests for ${planName} plan). Upgrade your plan for more requests!`,
              limitReached: true,
              remaining: 0,
              plan: userPlan,
              limit: dailyLimit
            },
            { status: 429 }
          )
        }

        // Update usage count
        if (usage) {
          await supabase
            .from('ai_usage')
            .update({ request_count: currentCount + 1 })
            .eq('user_id', userId)
            .eq('date', today)
        } else {
          await supabase
            .from('ai_usage')
            .insert({ user_id: userId, date: today, request_count: 1 })
        }
      }
    }

    const openRouterKey = process.env.OPENROUTER_API_KEY
    const geminiKey = process.env.GEMINI_API_KEY

    if (!openRouterKey && !geminiKey) {
      return NextResponse.json(
        { success: false, error: 'No AI API key configured' },
        { status: 500 }
      )
    }

    let generatedText: string | null = null

    // Try OpenRouter first
    if (openRouterKey) {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openRouterKey}`,
          },
          body: JSON.stringify({
            model: 'openrouter/auto',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: max_tokens,
            temperature: 0.7,
          })
        })

        if (response.ok) {
          const data = await response.json()
          generatedText = data.choices?.[0]?.message?.content?.trim()
        } else {
          console.error('OpenRouter error:', await response.text())
        }
      } catch (error) {
        console.error('OpenRouter request failed:', error)
      }
    }

    // Fallback to Gemini if OpenRouter failed
    if (!generatedText && geminiKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                parts: [{ text: prompt }]
              }],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: max_tokens,
              }
            })
          }
        )

        if (response.ok) {
          const data = await response.json()
          generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
        } else {
          console.error('Gemini error:', await response.text())
        }
      } catch (error) {
        console.error('Gemini request failed:', error)
      }
    }

    if (generatedText) {
      return NextResponse.json({
        success: true,
        data: generatedText
      })
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to generate response from AI' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('AI generate error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
