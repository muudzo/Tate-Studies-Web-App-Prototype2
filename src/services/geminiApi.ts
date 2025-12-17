// src/services/geminiApi.ts
// Google Gemini API for text summarization and study material generation

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export interface SummaryData {
    keyNames: Array<{ term: string; description: string }>;
    keyDefinitions: Array<{ term: string; description: string }>;
    importantPoints: Array<{ term: string; description: string }>;
    studyTips: Array<{ term: string; description: string }>;
    isFallback?: boolean;
    error?: string;
}

interface GeminiResponse {
    candidates: Array<{
        content: {
            parts: Array<{
                text: string;
            }>;
        };
    }>;
}

class GeminiService {
    private async callGemini(prompt: string): Promise<string> {
        if (!GEMINI_API_KEY) {
            throw new Error('Gemini API key is missing. Please add VITE_GEMINI_API_KEY to your .env file.');
        }

        try {
            const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // Disable caching to ensure fresh results
                cache: 'no-store',
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 8192,
                        responseMimeType: "application/json",
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`Gemini API error: ${response.status} - ${JSON.stringify(errorData)}`);
            }

            const result: GeminiResponse = await response.json();
            const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!text) {
                throw new Error('No content returned from Gemini API');
            }

            return text;
        } catch (error) {
            console.error('Gemini API call failed:', error);
            throw error;
        }
    }

    private getAnalysisPrompt(text: string, subject: string): string {
        return `
    Analyze the following text about "${subject}" and generate a structured study guide.
    
    The output MUST be a valid JSON object with the following structure:
    {
      "keyNames": [{"term": "Term Name", "description": "Brief description"}], (Extract 5 key terms)
      "keyDefinitions": [{"term": "Concept", "description": "Clear definition"}], (Define 5 distinct core concepts found in the text)
      "importantPoints": [{"term": "Key Point Title", "description": "Detailed explanation"}], (Extract 5 crucial takeaways/points)
      "studyTips": [{"term": "Tip Title", "description": "Actionable study advice based on this content"}] (Providing 3 specific study tips)
    }

    Ensure the content is educational, accurate, and directly derived from the input text.
    
    Input Text:
    ${text.substring(0, 30000)} // Truncate to avoid token limits if necessary, though Flash has a large context window.
    `;
    }

    // Fallback methodology (same as before, keeps the app working if API fails)
    private extractiveSummary(text: string): SummaryData {
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
        const keyTerms = text.split(/\s+/).filter(w => w.length > 6).slice(0, 5); // Naive term extraction

        return {
            keyNames: keyTerms.map(t => ({ term: t, description: 'Key term from text' })),
            keyDefinitions: sentences.slice(0, 5).map((s, i) => ({ term: `Concept ${i + 1}`, description: s.trim() })),
            importantPoints: sentences.slice(5, 10).map((s, i) => ({ term: `Point ${i + 1}`, description: s.trim() })),
            studyTips: [
                { term: "Review", description: "Read the text multiple times." },
                { term: "Practice", description: "Test your recall of these concepts." },
                { term: "Notes", description: "Write down these key points." }
            ],
            isFallback: true,
            error: 'Triggered local fallback'
        };
    }

    async processText(text: string, subject: string): Promise<SummaryData> {
        try {
            console.log('Processing text with Gemini API...');
            const prompt = this.getAnalysisPrompt(text, subject);
            const jsonResponse = await this.callGemini(prompt);

            const data: SummaryData = JSON.parse(jsonResponse);

            // Validate structure roughly
            if (!data.keyNames || !data.keyDefinitions) {
                throw new Error('Invalid JSON structure returned from API');
            }

            return {
                ...data,
                isFallback: false
            };

        } catch (error) {
            console.error('Gemini processing error:', error);
            return {
                ...this.extractiveSummary(text),
                isFallback: true,
                error: error instanceof Error ? error.message : 'Unknown Gemini error'
            };
        }
    }
}

export const geminiService = new GeminiService();
export default geminiService;
