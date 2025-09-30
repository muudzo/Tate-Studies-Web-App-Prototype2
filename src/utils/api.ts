import { projectId, publicAnonKey } from './supabase/info'

const API_BASE_URL = '/api'

// Generic API call function
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(url, defaultOptions)
    const data = await response.json()
    
    if (!response.ok) {
      console.error(`API Error (${response.status}):`, data)
      throw new Error(data.error || `HTTP ${response.status}`)
    }
    
    return data
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error)
    throw error
  }
}

// File upload
export async function uploadFile(file: File, userId: string = 'default') {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('userId', userId)

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
    },
    body: formData,
  })

  const data = await response.json()
  
  if (!response.ok) {
    console.error('Upload error:', data)
    throw new Error(data.error || 'Upload failed')
  }
  
  return data
}

// Process content with AI
export async function processContent(text: string, subject: string, fileId?: string) {
  return apiCall('/process', {
    method: 'POST',
    body: JSON.stringify({
      text,
      subject,
      fileId,
    }),
  })
}

// Get summary by ID
export async function getSummary(summaryId: string) {
  return apiCall(`/summary/${summaryId}`)
}

// Update summary
export async function updateSummary(summaryId: string, updates: {
  keyNames?: Array<{ term: string; description: string }>
  keyDefinitions?: Array<{ term: string; description: string }>
  importantPoints?: Array<{ term: string; description: string }>
  studyTips?: Array<{ term: string; description: string }>
}) {
  return apiCall(`/summary/${summaryId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  })
}

// Delete summary
export async function deleteSummary(summaryId: string) {
  return apiCall(`/summary/${summaryId}`, {
    method: 'DELETE',
  })
}

// Generate multiple choice questions
export async function generateMultipleChoice(summaryId: string, numQuestions: number = 5) {
  return apiCall('/multiple-choice', {
    method: 'POST',
    body: JSON.stringify({
      summaryId,
      numQuestions,
    }),
  })
}

// Get multiple choice questions
export async function getMultipleChoiceQuestions(setId: string) {
  return apiCall(`/multiple-choice/${setId}`)
}

// Get user summaries
export async function getUserSummaries(userId: string = 'default') {
  return apiCall(`/summaries/${userId}`)
}

// Generate flashcards from summary
export async function generateFlashcards(summaryId: string) {
  return apiCall('/flashcards', {
    method: 'POST',
    body: JSON.stringify({ summaryId }),
  })
}

// Get flashcards by set ID
export async function getFlashcards(setId: string) {
  return apiCall(`/flashcards/${setId}`)
}

// Save user progress
export async function saveProgress(userId: string, xp: number, streak: number, achievements: any[] = []) {
  return apiCall('/progress', {
    method: 'POST',
    body: JSON.stringify({
      userId,
      xp,
      streak,
      achievements,
    }),
  })
}

// Get user progress
export async function getUserProgress(userId: string = 'default') {
  return apiCall(`/progress/${userId}`)
}

// Health check
export async function healthCheck() {
  return apiCall('/health')
}

// Text extraction helpers for different file types
export async function extractTextFromFile(file: File): Promise<string> {
  const fileType = file.type.toLowerCase()
  const fileName = file.name.toLowerCase()
  
  if (fileType.includes('text')) {
    // Plain text files
    return await file.text()
  } else if (fileType.includes('pdf')) {
    // For PDF files, we'll need to handle this on the server side
    // Return a unique identifier so the server knows to process this file
    return `PDF_CONTENT_${file.name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  } else if (fileType.includes('image')) {
    // For images, we'll need OCR processing on the server side
    return `IMAGE_CONTENT_${file.name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  } else if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
    // Word documents - try to read as text first
    try {
      return await file.text()
    } catch {
      return `WORD_CONTENT_${file.name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
  } else if (fileName.endsWith('.ppt') || fileName.endsWith('.pptx')) {
    // PowerPoint presentations - try to read as text first
    try {
      return await file.text()
    } catch {
      return `PPT_CONTENT_${file.name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
  } else {
    throw new Error(`Unsupported file type: ${fileType}`)
  }
}

// Type definitions
export interface Summary {
  id: string
  fileId?: string
  subject: string
  processedAt: string
  keyNames: Array<{ term: string; description: string }>
  keyDefinitions: Array<{ term: string; description: string }>
  importantPoints: Array<{ term: string; description: string }>
  studyTips: Array<{ term: string; description: string }>
}

export interface Flashcard {
  id: string
  question: string
  answer: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface UserProgress {
  userId: string
  xp: number
  streak: number
  achievements: any[]
  lastUpdated: string
}

export interface MultipleChoiceQuestion {
  id: string
  question: string
  options: {
    A: string
    B: string
    C: string
    D: string
  }
  correct: 'A' | 'B' | 'C' | 'D'
  explanation: string
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
}

export interface QuestionSet {
  id: string
  summaryId: string
  questions: MultipleChoiceQuestion[]
  createdAt: string
}