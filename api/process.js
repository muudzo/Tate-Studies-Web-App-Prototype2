// Vercel API route for processing files
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fileId, text, subject } = req.body;
    
    console.log('Using free local processing - no API costs!');
    
    // Enhanced free processing with smart text analysis
    const words = text.toLowerCase().split(/\s+/);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    
    // Extract key terms using frequency analysis
    const wordFreq = {};
    words.forEach(word => {
      if (word.length > 4) { // Only meaningful words
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });
    
    const keyTerms = Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([term, freq]) => ({ term, description: `Important concept mentioned ${freq} times` }));
    
    // Smart content analysis
    const keyNames = keyTerms.slice(0, 3).map(({term}) => ({
      term: term.charAt(0).toUpperCase() + term.slice(1),
      description: `Key concept from your notes`
    }));
    
    const keyDefinitions = sentences.slice(0, 3).map((sentence, i) => ({
      term: `Definition ${i + 1}`,
      description: sentence.trim()
    }));
    
    const importantPoints = sentences.slice(3, 6).map((sentence, i) => ({
      term: `Key Point ${i + 1}`,
      description: sentence.trim()
    }));
    
    const studyTips = [
      { term: "Review Strategy", description: "Read through your notes and identify the main themes" },
      { term: "Practice Recall", description: "Try to explain the concepts without looking at your notes" },
      { term: "Connect Ideas", description: "Look for relationships between different concepts in your material" }
    ];
    
    const fallbackContent = {
      keyNames,
      keyDefinitions,
      importantPoints,
      studyTips
    };
    
    // Store summary in database (simplified for now)
    const summaryId = `summary_${Date.now()}`;
    const summaryData = {
      id: summaryId,
      fileId,
      subject: subject || 'General Studies',
      processedAt: new Date().toISOString(),
      ...fallbackContent
    };
    
    // For now, we'll just return the processed content
    // In a real implementation, you'd store this in a database
    
    return res.status(200).json({
      success: true,
      summaryId,
      summary: fallbackContent,
      note: 'Processed with free local analysis - no API costs!'
    });

  } catch (error) {
    console.log('Process endpoint error:', error);
    return res.status(500).json({ error: 'Server error during content processing' });
  }
}
