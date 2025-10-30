// src/services/summarizationApi.ts
// Free text summarization using Hugging Face Inference API

const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models/facebook/bart-large-cnn';
// Get your token from environment variables (set in .env file)
const HUGGINGFACE_TOKEN = import.meta.env.VITE_HUGGINGFACE_TOKEN || '';

interface SummaryData {
  keyNames: Array<{ term: string; description: string }>;
  keyDefinitions: Array<{ term: string; description: string }>;
  importantPoints: Array<{ term: string; description: string }>;
  studyTips: Array<{ term: string; description: string }>;
}

class SummarizationService {
  private async summarizeText(text: string): Promise<string> {
    try {
      // Use Hugging Face's free inference API
      const response = await fetch(HUGGINGFACE_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HUGGINGFACE_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: text.substring(0, 1024), // Limit text length for free API
          parameters: {
            max_length: 150,
            min_length: 40,
            do_sample: false
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Summarization failed: ${response.status}`);
      }

      const result = await response.json();
      return result[0]?.summary_text || text;
    } catch (error) {
      console.error('Summarization error:', error);
      // Fallback to extractive summarization
      return this.extractiveSummary(text);
    }
  }

  private extractiveSummary(text: string): string {
    // Simple extractive summary - take first few sentences
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    return sentences.slice(0, 3).join('. ') + '.';
  }

  private extractKeyTerms(text: string): string[] {
    // Extract potential key terms (capitalized words, repeated terms)
    const words = text.split(/\s+/);
    const termFreq: Record<string, number> = {};
    
    words.forEach(word => {
      const cleaned = word.replace(/[^\w]/g, '').toLowerCase();
      if (cleaned.length > 4 && !this.isCommonWord(cleaned)) {
        termFreq[cleaned] = (termFreq[cleaned] || 0) + 1;
      }
    });

    return Object.entries(termFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([term]) => term);
  }

  private isCommonWord(word: string): boolean {
    const common = ['that', 'this', 'with', 'from', 'have', 'been', 'were', 'their', 'there', 'would', 'could', 'should'];
    return common.includes(word.toLowerCase());
  }

  async processText(text: string, subject: string): Promise<SummaryData> {
    try {
      console.log('Processing text with free summarization API...');

      // Get AI summary
      const summary = await this.summarizeText(text);
      
      // Extract key terms
      const keyTerms = this.extractKeyTerms(text);
      
      // Split text into sentences for analysis
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);

      // Build structured summary data
      const keyNames = keyTerms.slice(0, 5).map(term => ({
        term: term.charAt(0).toUpperCase() + term.slice(1),
        description: `Key concept related to ${subject}`
      }));

      const keyDefinitions = sentences.slice(0, 3).map((sentence, i) => ({
        term: keyTerms[i] || `Concept ${i + 1}`,
        description: sentence.trim()
      }));

      const importantPoints = [
        {
          term: "Main Summary",
          description: summary
        },
        ...sentences.slice(3, 5).map((sentence, i) => ({
          term: `Key Point ${i + 2}`,
          description: sentence.trim()
        }))
      ];

      const studyTips = [
        {
          term: "Review Strategy",
          description: `Focus on understanding the main concepts of ${subject}`
        },
        {
          term: "Practice Recall",
          description: "Test yourself by explaining key terms without looking"
        },
        {
          term: "Connect Ideas",
          description: "Look for relationships between different concepts"
        }
      ];

      return {
        keyNames,
        keyDefinitions,
        importantPoints,
        studyTips
      };
    } catch (error) {
      console.error('Text processing error:', error);
      throw error;
    }
  }
}

export const summarizationService = new SummarizationService();
export default summarizationService;