// Vercel API route for file upload
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
    // Handle both JSON and FormData requests
    let fileName, fileType, fileSize, text, subject, userId;
    
    if (req.headers['content-type']?.includes('multipart/form-data')) {
      // Handle FormData (file upload)
      const formData = await req.formData();
      const file = formData.get('file');
      userId = formData.get('userId') || 'default';
      
      if (file) {
        fileName = file.name;
        fileType = file.type;
        fileSize = file.size;
        // For now, we'll extract text on the client side
        text = `FILE_CONTENT_${fileName}_${Date.now()}`;
      } else {
        return res.status(400).json({ error: 'No file provided' });
      }
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
    
    // Generate a unique file ID
    const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('File upload:', { fileName, fileType, fileSize, userId });
    
    // For now, just return success - in a real implementation, you'd store the file
    return res.status(200).json({
      success: true,
      fileId,
      message: 'File uploaded successfully'
    });

  } catch (error) {
    console.log('Upload endpoint error:', error);
    return res.status(500).json({ error: 'Server error during file upload' });
  }
}
