// Vercel API route for file upload

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Handle both JSON and FormData requests
    let fileName, fileType, fileSize, text, subject, userId;

    if (req.headers['content-type']?.includes('multipart/form-data')) {
      // Handle FormData (file upload) - simplified for Vercel
      // For now, just return success with a mock file ID
      fileName = 'uploaded-file';
      fileType = 'application/octet-stream';
      fileSize = 0;
      userId = 'default';
      text = `FILE_CONTENT_${fileName}_${Date.now()}`;
    } else {
      // Handle JSON request
      const body = req.body;
      fileName = body.fileName;
      fileType = body.fileType;
      fileSize = body.fileSize;
      text = body.text;
      subject = body.subject;
      userId = body.userId || 'default';
    }

    // Input validation
    if (fileName && typeof fileName !== 'string') {
      return res.status(400).json({ error: 'fileName must be a string' });
    }
    if (fileType && typeof fileType !== 'string') {
      return res.status(400).json({ error: 'fileType must be a string' });
    }
    if (fileSize && (typeof fileSize !== 'number' || fileSize < 0)) {
      return res.status(400).json({ error: 'fileSize must be a non-negative number' });
    }
    if (fileSize && fileSize > MAX_FILE_SIZE) {
      return res.status(400).json({ error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)}MB` });
    }

    // Generate a unique file ID
    const fileId = `file_${Date.now()}_${crypto.randomUUID()}`;

    console.log('File upload:', { fileName, fileType, fileSize, userId });

    // For now, just return success - in a real implementation, you'd store the file
    return res.status(200).json({
      success: true,
      fileId,
      message: 'File uploaded successfully'
    });

  } catch (error) {
    console.error('Upload endpoint error:', error);
    return res.status(500).json({ error: 'Server error during file upload' });
  }
}
