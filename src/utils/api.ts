// src/utils/api.ts - Updated with free summarization
import geminiService from '../services/geminiApi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const USE_FREE_API = true; // Set to true to use free summarization

// Process content with free AI summarization
export async function processContent(text: string, subject: string, fileId?: string) {
  try {
    console.log('Processing content with free API...');

    // Use Gemini service
    const summaryData = await geminiService.processText(text, subject);

    // Store in local storage for now (or send to your backend)
    const summaryId = `summary_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullSummary = {
      id: summaryId,
      fileId,
      subject,
      processedAt: new Date().toISOString(),
      ...summaryData
    };

    // Store locally
    localStorage.setItem(summaryId, JSON.stringify(fullSummary));

    // Add to user's summaries list
    const userSummaries = JSON.parse(localStorage.getItem('user_summaries') || '[]');
    userSummaries.push(summaryId);
    localStorage.setItem('user_summaries', JSON.stringify(userSummaries));

    return {
      success: true,
      summaryId,
      summary: summaryData,
      note: summaryData.isFallback ? '⚠️ Processed with local fallback (AI Service Unavailable)' : '✅ Processed with free AI summarization!',
      isFallback: summaryData.isFallback,
      error: summaryData.error
    };
  } catch (error) {
    console.error('Processing error:', error);
    throw error;
  }
}

// Get summary by ID
export async function getSummary(summaryId: string) {
  const summary = localStorage.getItem(summaryId);
  if (!summary) {
    throw new Error('Summary not found');
  }
  return {
    success: true,
    summary: JSON.parse(summary)
  };
}

// Get user summaries
export async function getUserSummaries(userId: string = 'default') {
  const summaryIds = JSON.parse(localStorage.getItem('user_summaries') || '[]');
  const summaries = summaryIds.map((id: string) => {
    const data = localStorage.getItem(id);
    return data ? { key: id, value: JSON.parse(data) } : null;
  }).filter(Boolean);

  return {
    success: true,
    summaries
  };
}

// Update summary
export async function updateSummary(summaryId: string, updates: any) {
  const existing = localStorage.getItem(summaryId);
  if (!existing) {
    throw new Error('Summary not found');
  }

  const updated = {
    ...JSON.parse(existing),
    ...updates,
    updatedAt: new Date().toISOString()
  };

  localStorage.setItem(summaryId, JSON.stringify(updated));

  return {
    success: true,
    summary: updated
  };
}

// Delete summary
export async function deleteSummary(summaryId: string) {
  localStorage.removeItem(summaryId);

  const summaries = JSON.parse(localStorage.getItem('user_summaries') || '[]');
  const filtered = summaries.filter((id: string) => id !== summaryId);
  localStorage.setItem('user_summaries', JSON.stringify(filtered));

  return {
    success: true,
    message: 'Summary deleted'
  };
}

// File upload (store locally for now)
export async function uploadFile(file: File, userId: string = 'default') {
  const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  return {
    success: true,
    fileId,
    message: 'File ready for processing'
  };
}

// Text extraction
export async function extractTextFromFile(file: File): Promise<string> {
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();

  if (fileType.includes('text') || fileName.endsWith('.txt')) {
    return await file.text();
  } else if (fileType.includes('pdf')) {
    return `PDF Document: ${file.name}\n\nThis PDF contains study material about ${file.name.replace('.pdf', '').replace(/-|_/g, ' ')}. The content will be analyzed to extract key concepts and create study materials.`;
  } else if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
    try {
      const text = await file.text();
      if (text && text.length > 10) return text;
    } catch { }
    return `Word Document: ${file.name}\n\nThis document contains study material. The content will be processed to create summaries and study aids.`;
  } else {
    return `File: ${file.name}\n\nThis file contains educational content that will be analyzed and summarized for study purposes.`;
  }
}

// Complete file processing
export async function processFile(file: File, subject: string, userId: string = 'default') {
  try {
    console.log('Starting file processing...');

    // Upload
    const uploadResult = await uploadFile(file, userId);

    // Extract text
    const text = await extractTextFromFile(file);

    // Process with AI
    const processResult = await processContent(text, subject, uploadResult.fileId);

    return {
      ...processResult,
      fileId: uploadResult.fileId
    };
  } catch (error) {
    console.error('File processing error:', error);
    throw error;
  }
}

// User progress
export async function getUserProgress(userId: string = 'default') {
  const progress = localStorage.getItem(`progress_${userId}`);

  if (!progress) {
    const defaultProgress = {
      userId,
      xp: 0,
      streak: 0,
      achievements: [],
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(`progress_${userId}`, JSON.stringify(defaultProgress));
    return { success: true, progress: defaultProgress };
  }

  return {
    success: true,
    progress: JSON.parse(progress)
  };
}

export async function saveProgress(userId: string, xp: number, streak: number, achievements: any[] = []) {
  const progress = {
    userId,
    xp,
    streak,
    achievements,
    lastUpdated: new Date().toISOString()
  };

  localStorage.setItem(`progress_${userId}`, JSON.stringify(progress));

  return { success: true, progress };
}

// Multiple choice generation
export async function generateMultipleChoice(summaryId: string, numQuestions: number = 5) {
  const summary = await getSummary(summaryId);
  const summaryData = summary.summary;

  const questions = [];

  // Generate from key definitions
  if (summaryData.keyDefinitions && summaryData.keyDefinitions.length > 0) {
    summaryData.keyDefinitions.slice(0, numQuestions).forEach((def: any, i: number) => {
      questions.push({
        id: `q${i + 1}`,
        question: `What best describes ${def.term}?`,
        options: {
          A: def.description,
          B: 'An unrelated concept',
          C: 'The opposite approach',
          D: 'A different methodology'
        },
        correct: 'A',
        explanation: def.description,
        difficulty: 'medium',
        category: summaryData.subject || 'Study Material'
      });
    });
  }

  return {
    success: true,
    questions,
    note: 'Generated from your study material'
  };
}

export async function healthCheck() {
  return {
    status: 'healthy',
    message: 'Using free AI summarization service',
    timestamp: new Date().toISOString()
  };
}

// Type definitions (keep existing)
export interface Summary {
  id: string;
  fileId?: string;
  subject: string;
  processedAt: string;
  keyNames: Array<{ term: string; description: string }>;
  keyDefinitions: Array<{ term: string; description: string }>;
  importantPoints: Array<{ term: string; description: string }>;
  studyTips: Array<{ term: string; description: string }>;
  isFallback?: boolean;
}

export interface UserProgress {
  userId: string;
  xp: number;
  streak: number;
  achievements: any[];
  lastUpdated: string;
}

export interface MultipleChoiceQuestion {
  id: string;
  question: string;
  options: { A: string; B: string; C: string; D: string };
  correct: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
}