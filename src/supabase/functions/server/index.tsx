import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Hono } from "npm:hono"
import { cors } from "npm:hono/cors"
import { logger } from "npm:hono/logger"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import * as kv from './kv_store.tsx'

const app = new Hono()

// Enable CORS and logging
app.use('*', cors({
  origin: '*',
  allowHeaders: ['*'],
  allowMethods: ['POST', 'GET', 'OPTIONS', 'PUT', 'DELETE'],
}))

app.use('*', logger(console.log))

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

// Create storage bucket for uploaded files
async function initializeBuckets() {
  const bucketName = 'make-4e8803b0-study-files'
  const { data: buckets } = await supabase.storage.listBuckets()
  const bucketExists = buckets?.some(bucket => bucket.name === bucketName)
  
  if (!bucketExists) {
    const { error } = await supabase.storage.createBucket(bucketName, { public: false })
    if (error) {
      console.log('Error creating bucket:', error)
    } else {
      console.log('Study files bucket created successfully')
    }
  }
}

// Initialize buckets on startup
initializeBuckets()

// Upload file endpoint
app.post('/make-server-4e8803b0/upload', async (c) => {
  try {
    const formData = await c.req.formData()
    const file = formData.get('file') as File
    const userId = formData.get('userId') as string
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400)
    }

    // Generate unique filename
    const timestamp = Date.now()
    const filename = `${userId}/${timestamp}-${file.name}`
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('make-4e8803b0-study-files')
      .upload(filename, file)

    if (error) {
      console.log('Upload error:', error)
      return c.json({ error: 'Failed to upload file' }, 500)
    }

    // Get signed URL for the uploaded file
    const { data: signedUrl } = await supabase.storage
      .from('make-4e8803b0-study-files')
      .createSignedUrl(filename, 60 * 60 * 24 * 7) // 7 days

    // Store file metadata
    const fileMetadata = {
      userId,
      filename: file.name,
      storagePath: filename,
      uploadedAt: new Date().toISOString(),
      fileType: file.type,
      fileSize: file.size
    }

    await kv.set(`file:${timestamp}`, fileMetadata)

    return c.json({
      success: true,
      fileId: timestamp,
      filename: file.name,
      downloadUrl: signedUrl?.signedUrl
    })

  } catch (error) {
    console.log('Upload endpoint error:', error)
    return c.json({ error: 'Server error during file upload' }, 500)
  }
})

// Process file with OpenAI
app.post('/make-server-4e8803b0/process', async (c) => {
  try {
    const { fileId, text, subject } = await c.req.json()
    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    
    if (!openaiKey) {
      return c.json({ error: 'OpenAI API key not configured' }, 500)
    }

    if (!text) {
      return c.json({ error: 'No text content provided' }, 400)
    }

    // Create AI prompt based on subject
    const getPrompt = (subject: string, content: string) => {
      const basePrompt = `You are an expert study assistant for ${subject}. Extract and summarize the following notes:

Content: ${content}

Please provide:
1. Key Names/People: List important figures, leaders, theorists, or companies mentioned
2. Key Definitions: Define important terms and concepts
3. Important Points: Summarize the main ideas and takeaways
4. Study Tips: Provide 2-3 practical study suggestions for this content

Format your response as JSON with these exact keys: keyNames, keyDefinitions, importantPoints, studyTips. Each should be an array of objects with 'term' and 'description' properties.`

      return basePrompt
    }

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: getPrompt(subject || 'General Studies', text)
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.log('OpenAI API error:', errorData)
      return c.json({ error: 'Failed to process content with AI' }, 500)
    }

    const aiResponse = await response.json()
    const content = aiResponse.choices[0]?.message?.content

    if (!content) {
      return c.json({ error: 'No content returned from AI' }, 500)
    }

    // Parse AI response
    let parsedContent
    try {
      parsedContent = JSON.parse(content)
    } catch (parseError) {
      console.log('Failed to parse AI response as JSON:', content)
      // Fallback: create structured response from text
      parsedContent = {
        keyNames: [{ term: "AI Processing", description: "Content processed successfully but needs manual review" }],
        keyDefinitions: [{ term: "Summary", description: content.substring(0, 500) + "..." }],
        importantPoints: [{ term: "Main Content", description: "Please review the processed content manually" }],
        studyTips: [{ term: "Review", description: "Go through the content and create your own summary" }]
      }
    }

    // Store summary in database
    const summaryId = `summary_${Date.now()}`
    const summaryData = {
      id: summaryId,
      fileId,
      subject: subject || 'General Studies',
      processedAt: new Date().toISOString(),
      ...parsedContent
    }

    await kv.set(summaryId, summaryData)

    return c.json({
      success: true,
      summaryId,
      summary: parsedContent
    })

  } catch (error) {
    console.log('Process endpoint error:', error)
    return c.json({ error: 'Server error during content processing' }, 500)
  }
})

// Get summary by ID
app.get('/make-server-4e8803b0/summary/:id', async (c) => {
  try {
    const summaryId = c.req.param('id')
    const summary = await kv.get(summaryId)
    
    if (!summary) {
      return c.json({ error: 'Summary not found' }, 404)
    }

    return c.json({ success: true, summary })
  } catch (error) {
    console.log('Get summary error:', error)
    return c.json({ error: 'Failed to retrieve summary' }, 500)
  }
})

// Get user summaries
app.get('/make-server-4e8803b0/summaries/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    const summaries = await kv.getByPrefix('summary_')
    
    // Filter summaries for this user (if you want user-specific filtering)
    const userSummaries = summaries.filter(summary => 
      summary.value && summary.value.fileId
    )

    return c.json({ success: true, summaries: userSummaries })
  } catch (error) {
    console.log('Get user summaries error:', error)
    return c.json({ error: 'Failed to retrieve summaries' }, 500)
  }
})

// Generate flashcards from summary
app.post('/make-server-4e8803b0/flashcards', async (c) => {
  try {
    const { summaryId } = await c.req.json()
    const summary = await kv.get(summaryId)
    
    if (!summary) {
      return c.json({ error: 'Summary not found' }, 404)
    }

    // Generate flashcards from summary data
    const flashcards = []

    // Add key definitions as flashcards
    if (summary.keyDefinitions) {
      summary.keyDefinitions.forEach((def, index) => {
        flashcards.push({
          id: `fc_${summaryId}_def_${index}`,
          question: `What is ${def.term}?`,
          answer: def.description,
          category: 'Definition',
          difficulty: 'medium'
        })
      })
    }

    // Add key names as flashcards
    if (summary.keyNames) {
      summary.keyNames.forEach((name, index) => {
        flashcards.push({
          id: `fc_${summaryId}_name_${index}`,
          question: `Who/What is ${name.term}?`,
          answer: name.description,
          category: 'Key Figure',
          difficulty: 'easy'
        })
      })
    }

    // Store flashcards
    const flashcardSetId = `flashcards_${summaryId}`
    await kv.set(flashcardSetId, {
      id: flashcardSetId,
      summaryId,
      createdAt: new Date().toISOString(),
      cards: flashcards
    })

    return c.json({
      success: true,
      flashcardSetId,
      flashcards
    })

  } catch (error) {
    console.log('Generate flashcards error:', error)
    return c.json({ error: 'Failed to generate flashcards' }, 500)
  }
})

// Get flashcards
app.get('/make-server-4e8803b0/flashcards/:setId', async (c) => {
  try {
    const setId = c.req.param('setId')
    const flashcardSet = await kv.get(setId)
    
    if (!flashcardSet) {
      return c.json({ error: 'Flashcard set not found' }, 404)
    }

    return c.json({ success: true, flashcards: flashcardSet.cards })
  } catch (error) {
    console.log('Get flashcards error:', error)
    return c.json({ error: 'Failed to retrieve flashcards' }, 500)
  }
})

// Save user progress
app.post('/make-server-4e8803b0/progress', async (c) => {
  try {
    const { userId, xp, streak, achievements } = await c.req.json()
    
    const progressData = {
      userId,
      xp: xp || 0,
      streak: streak || 0,
      achievements: achievements || [],
      lastUpdated: new Date().toISOString()
    }

    await kv.set(`progress_${userId}`, progressData)

    return c.json({ success: true, progress: progressData })
  } catch (error) {
    console.log('Save progress error:', error)
    return c.json({ error: 'Failed to save progress' }, 500)
  }
})

// Get user progress
app.get('/make-server-4e8803b0/progress/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    const progress = await kv.get(`progress_${userId}`)
    
    if (!progress) {
      // Return default progress for new users
      return c.json({
        success: true,
        progress: {
          userId,
          xp: 0,
          streak: 0,
          achievements: [],
          lastUpdated: new Date().toISOString()
        }
      })
    }

    return c.json({ success: true, progress })
  } catch (error) {
    console.log('Get progress error:', error)
    return c.json({ error: 'Failed to retrieve progress' }, 500)
  }
})

// Health check
app.get('/make-server-4e8803b0/health', (c) => {
  return c.json({ status: 'healthy', timestamp: new Date().toISOString() })
})

console.log('Tate Studies server starting up...')
serve(app.fetch)