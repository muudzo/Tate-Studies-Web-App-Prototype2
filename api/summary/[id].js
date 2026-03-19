// Vercel API route for getting individual summary

const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
};

export default async function handler(req, res) {
  // Set CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => res.setHeader(key, value));

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    try {
      const { id } = req.query;

      // For now, return a mock summary - in a real implementation, you'd fetch from database
      return res.status(200).json({
        success: true,
        summary: {
          id: id,
          keyNames: [],
          keyDefinitions: [],
          importantPoints: [],
          studyTips: [],
          processedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Get summary error:', error);
      return res.status(500).json({ error: 'Failed to retrieve summary' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { id } = req.query;
      const updates = req.body;

      // For now, just return success - in a real implementation, you'd update the database
      return res.status(200).json({
        success: true,
        summary: {
          id: id,
          ...updates,
          updatedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Update summary error:', error);
      return res.status(500).json({ error: 'Failed to update summary' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;

      // For now, just return success - in a real implementation, you'd delete from database
      return res.status(200).json({
        success: true,
        message: 'Summary deleted successfully'
      });

    } catch (error) {
      console.error('Delete summary error:', error);
      return res.status(500).json({ error: 'Failed to delete summary' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
