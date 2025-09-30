// Vercel API route for getting user progress
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
    
    // Return default progress data
    return res.status(200).json({ 
      success: true, 
      progress: {
        xp: 0,
        level: 1,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.log('Get progress error:', error);
    return res.status(500).json({ error: 'Failed to retrieve progress' });
  }
}
