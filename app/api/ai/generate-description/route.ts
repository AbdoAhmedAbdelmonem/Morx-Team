import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAuth } from '@/lib/middleware/auth'

// AI Description Generator using Google Gemini API
// Supports both English and Arabic (Egyptian dialect + Modern Standard Arabic)
// Rate limited to 10 requests per user per day
// Protected - requires authentication

const DAILY_LIMIT = 10

// Helper to get today's date key
function getTodayKey(): string {
  return new Date().toISOString().split('T')[0] // YYYY-MM-DD
}

// Check rate limit and increment usage
async function checkAndIncrementUsage(userId: string): Promise<{ allowed: boolean; remaining: number; error?: string }> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    // If no Supabase configured, allow the request
    return { allowed: true, remaining: DAILY_LIMIT }
  }

  const supabase = createClient(supabaseUrl, supabaseKey)
  const today = getTodayKey()

  // Check current usage
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

  if (currentCount >= DAILY_LIMIT) {
    return { 
      allowed: false, 
      remaining: 0,
      error: `Daily limit reached (${DAILY_LIMIT} requests). Try again tomorrow!`
    }
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

  return { allowed: true, remaining: DAILY_LIMIT - currentCount - 1 }
}

// Check if text contains Arabic characters
function isArabic(text: string): boolean {
  const arabicPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/
  return arabicPattern.test(text)
}

// Generate description using Gemini AI
async function generateWithGemini(context: {
  type: 'team' | 'project' | 'task'
  name: string
  userName?: string
  teamName?: string
  purpose?: string
  subject?: string
  additionalContext?: string
}): Promise<string> {
  const { type, name, userName, teamName, purpose, subject } = context
  const useArabic = isArabic(name)
  
  // Build the prompt with tech context
  let prompt = ''
  
  // Common tech terms context for AI understanding
  const techContext = `
IMPORTANT: Understand the meaning behind names. Common tech terms:
- HTML, CSS, JS/JavaScript = Web Development, Frontend
- React, Vue, Angular, Next.js = Frontend Frameworks
- Node, Express, Django, Flask = Backend Development  
- Python, Java, C++, Rust = Programming Languages
- SQL, MongoDB, PostgreSQL = Database
- AI, ML, Deep Learning = Artificial Intelligence/Machine Learning
- DevOps, Docker, Kubernetes = Infrastructure/Deployment
- UI/UX = User Interface/Experience Design
- API = Application Programming Interface
- Git, GitHub = Version Control
- AWS, Azure, GCP = Cloud Computing
- iOS, Android, Flutter, React Native = Mobile Development
- Cyber, Security, Hacking = Cybersecurity
- Data Science, Analytics = Data Analysis
- Blockchain, Web3, Crypto = Blockchain Technology
- Game Dev, Unity, Unreal = Game Development
`

  if (useArabic) {
    prompt = `انت مساعد ذكي بتفهم التكنولوجيا والبرمجة كويس جداً.

${techContext}

اكتب وصف قصير (جملتين أو 3 بالكتير) لـ ${type === 'team' ? 'فريق' : type === 'project' ? 'مشروع' : 'مهمة'} اسمه "${name}".

مهم جداً: افهم معنى الاسم! لو الاسم فيه كلمات تقنية زي HTML أو Python أو AI، اكتب وصف يعكس المجال ده.

${purpose ? `نوع الفريق: ${purpose}` : ''}
${subject ? `المادة/المجال: ${subject}` : ''}
${userName ? `المؤسس: ${userName}` : ''}
${teamName ? `اسم الفريق: ${teamName}` : ''}

اكتب الوصف بالعربي المصري العامي بشكل ودود ومحترف. خليه قصير ومباشر.
لا تكتب أي مقدمات أو شرح، اكتب الوصف مباشرة.`
  } else {
    prompt = `You are a helpful assistant that understands technology and programming very well.

${techContext}

Write a short description (2-3 sentences max) for a ${type} named "${name}".

IMPORTANT: Understand the meaning of the name! If it contains tech terms like HTML, Python, AI, React, etc., write a description that reflects that field appropriately.

${purpose ? `Type/Purpose: ${purpose}` : ''}
${subject ? `Subject/Field: ${subject}` : ''}
${userName ? `Creator: ${userName}` : ''}
${teamName ? `Team: ${teamName}` : ''}

Write a professional, friendly description. Keep it concise and direct.
Do not include any preamble or explanation, just write the description directly.`
  }

  const geminiKey = process.env.GEMINI_API_KEY
  const openRouterKey = process.env.OPENROUTER_API_KEY
  
  if (!geminiKey && !openRouterKey) {
    // Fallback to template-based generation if no API key
    return generateFallbackDescription(context)
  }

  try {
    let response: Response
    
    // Try OpenRouter first (more reliable), then Gemini
    if (openRouterKey) {
      response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openRouterKey}`,
        },
        body: JSON.stringify({
          model: 'openrouter/auto',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 150,
          temperature: 0.7,
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        const text = data.choices?.[0]?.message?.content
        if (text) return text.trim()
      }
    }
    
    // Fallback to Gemini direct API
    if (geminiKey) {
      response = await fetch(
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
              maxOutputTokens: 150,
            }
          })
        }
      )

      if (response.ok) {
        const data = await response.json()
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text
        if (text) return text.trim()
      }
    }
    
    return generateFallbackDescription(context)
  } catch (error) {
    console.error('Error calling AI API:', error)
    return generateFallbackDescription(context)
  }
}

// Fallback template-based generation (when API is not available)
function generateFallbackDescription(context: {
  type: 'team' | 'project' | 'task'
  name: string
  userName?: string
  purpose?: string
  subject?: string
}): string {
  const { type, name, userName, purpose } = context
  const useArabic = isArabic(name)
  
  if (useArabic) {
    const templates: Record<string, string[]> = {
      team: [
        `فريق ${name} - بنشتغل مع بعض عشان نحقق أهدافنا ونطور من نفسنا.`,
        `تيم ${name}، بنجمع خبراتنا ومهاراتنا عشان ننجح سوا.`,
      ],
      project: [
        `مشروع ${name} - بنشتغل على تقديم حلول مميزة ونتائج فعالة.`,
        `${name} - مبادرة لتطوير أفكار مبتكرة وتحقيق أهداف المشروع.`,
      ],
      task: [
        `إتمام ${name} مع الاهتمام بالتفاصيل والجودة.`,
        `الشغل على ${name} للمساهمة في تقدم المشروع.`,
      ]
    }
    const typeTemplates = templates[type] || templates.team
    return typeTemplates[Math.floor(Math.random() * typeTemplates.length)]
  } else {
    const templates: Record<string, string[]> = {
      team: [
        `${name} - A collaborative team working together to achieve shared goals and grow together.`,
        `Team ${name}, combining our skills and expertise to succeed together.`,
      ],
      project: [
        `${name} project - Working on delivering innovative solutions and effective results.`,
        `${name} - An initiative to develop creative ideas and achieve project objectives.`,
      ],
      task: [
        `Complete ${name} with attention to detail and quality standards.`,
        `Work on ${name} to contribute to project progress.`,
      ]
    }
    const typeTemplates = templates[type] || templates.team
    return typeTemplates[Math.floor(Math.random() * typeTemplates.length)]
  }
}

export async function POST(request: NextRequest) {
  // Require authentication
  const user = await requireAuth(request);
  
  if (user instanceof NextResponse) {
    return user; // Return 401 error
  }

  try {
    const body = await request.json()
    
    const { type, name, userName, teamName, purpose, subject, additionalContext } = body
    
    if (!type || !name) {
      return NextResponse.json({
        success: false,
        error: 'Type and name are required'
      }, { status: 400 })
    }

    // Use authenticated user ID for rate limiting
    const userId = user.id;
    
    const rateLimit = await checkAndIncrementUsage(userId)
    if (!rateLimit.allowed) {
      return NextResponse.json({
        success: false,
        error: rateLimit.error,
        limitReached: true,
        remaining: 0
      }, { status: 429 })
    }
    
    // Use Gemini AI for generation
    const description = await generateWithGemini({
      type,
      name: name.trim(),
      userName,
      teamName,
      purpose,
      subject,
      additionalContext
    })
    
    return NextResponse.json({
      success: true,
      data: { description }
    })
    
  } catch (error) {
    console.error('Error generating description:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to generate description'
    }, { status: 500 })
  }
}
