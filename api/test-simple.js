import cors from 'cors';

// CORS configuration
const corsMiddleware = cors({
  origin: true, // Allow all origins for testing
  credentials: true
});

export default async function handler(req, res) {
  console.log('Test API called:', {
    method: req.method,
    url: req.url,
    contentType: req.headers['content-type'],
    body: req.body
  });

  // Handle CORS
  await new Promise((resolve) => corsMiddleware(req, res, resolve));

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    // Simple test response
    res.json({
      success: true,
      message: 'Test API is working!',
      timestamp: new Date().toISOString(),
      requestBody: req.body,
      contentType: req.headers['content-type']
    });
  } catch (error) {
    console.error('Test API Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
} 