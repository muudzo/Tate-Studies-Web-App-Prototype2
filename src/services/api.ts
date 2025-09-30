import { ENV } from '../config/environment';

class ApiService {
  private baseUrl: string;
  private headers: Record<string, string>;
  private debug: boolean;

  constructor() {
    this.baseUrl = ENV.API_BASE_URL;
    this.headers = {
      'Authorization': `Bearer ${ENV.SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json'
    };
    this.debug = ENV.ENABLE_DEBUG;
  }

  private log(...args: any[]) {
    if (this.debug) {
      console.log('[API]', ...args);
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      this.log(`Request: ${options.method || 'GET'} ${endpoint}`);
      
      const config: RequestInit = {
        ...options,
        headers: {
          ...this.headers,
          ...options.headers
        }
      };

      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `API request failed: ${response.status}`);
      }
      
      this.log(`Response:`, data);
      return data;
    } catch (error) {
      console.error(`API Error for ${endpoint}:`, error);
      throw error;
    }
  }

  // Health check
  async checkHealth() {
    return this.request('/health');
  }

  // Upload file
  async uploadFile(file: File, userId: string = ENV.DEFAULT_USER_ID) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);

    this.log(`Uploading file: ${file.name}`);

    const response = await fetch(`${this.baseUrl}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ENV.SUPABASE_ANON_KEY}`
      },
      body: formData
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `Upload failed: ${response.status}`);
    }

    this.log('Upload response:', data);
    return data;
  }

  // Process text with AI
  async processText(text: string, subject: string, fileId?: string) {
    return this.request('/process', {
      method: 'POST',
      body: JSON.stringify({
        text,
        subject,
        fileId
      })
    });
  }

  // Get user summaries
  async getUserSummaries(userId: string = ENV.DEFAULT_USER_ID) {
    return this.request(`/summaries/${userId}`);
  }

  // Get individual summary
  async getSummary(summaryId: string) {
    return this.request(`/summary/${summaryId}`);
  }

  // Update summary
  async updateSummary(summaryId: string, updates: any) {
    return this.request(`/summary/${summaryId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  // Delete summary
  async deleteSummary(summaryId: string) {
    return this.request(`/summary/${summaryId}`, {
      method: 'DELETE'
    });
  }

  // Get user progress
  async getUserProgress(userId: string = ENV.DEFAULT_USER_ID) {
    return this.request(`/progress/${userId}`);
  }

  // Generate multiple choice questions
  async generateMultipleChoice(summaryId: string, numQuestions: number = 5) {
    return this.request('/multiple-choice', {
      method: 'POST',
      body: JSON.stringify({
        summaryId,
        numQuestions
      })
    });
  }

  // Helper to read file content
  async readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      
      // Handle different file types
      if (file.type === 'application/pdf') {
        // For PDF files, we'll send a placeholder since we can't read them client-side
        resolve(`PDF Document: ${file.name}\n[PDF content requires server-side processing]`);
      } else if (file.type.includes('word') || file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
        // For Word docs, send placeholder
        resolve(`Word Document: ${file.name}\n[Word document content requires server-side processing]`);
      } else if (file.type.includes('presentation') || file.name.endsWith('.ppt') || file.name.endsWith('.pptx')) {
        // For PowerPoint, send placeholder
        resolve(`PowerPoint Presentation: ${file.name}\n[PowerPoint content requires server-side processing]`);
      } else {
        // For text files, read directly
        reader.readAsText(file);
      }
    });
  }

  // Complete file processing (upload + process)
  async processFile(file: File, subject: string, userId: string = ENV.DEFAULT_USER_ID) {
    try {
      // Step 1: Upload file
      this.log('Step 1: Uploading file...');
      const uploadResult = await this.uploadFile(file, userId);
      
      if (!uploadResult.success) {
        throw new Error('File upload failed');
      }

      // Step 2: Read file content
      this.log('Step 2: Reading file content...');
      const text = await this.readFileContent(file);

      // Step 3: Process with AI
      this.log('Step 3: Processing with AI...');
      const processResult = await this.processText(text, subject, uploadResult.fileId);
      
      return {
        ...processResult,
        fileId: uploadResult.fileId
      };
    } catch (error) {
      console.error('Process file error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
