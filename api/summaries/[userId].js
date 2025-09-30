// Vercel API route for getting user summaries
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;
    
    // For now, return empty array - in a real implementation, you'd fetch from database
    return res.status(200).json({ 
      success: true, 
      summaries: []
    });

  } catch (error) {
    console.log('Get user summaries error:', error);
    return res.status(500).json({ error: 'Failed to retrieve summaries' });
  }
}
