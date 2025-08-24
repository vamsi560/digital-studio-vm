import cors from 'cors';

// CORS configuration
const corsMiddleware = cors({
  origin: true,
  credentials: true
});

export default async function handler(req, res) {
  console.log('Preview Config API called:', { method: req.method, url: req.url });

  // Handle CORS
  await new Promise((resolve) => corsMiddleware(req, res, resolve));

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    if (req.method === 'GET') {
      // Return preview configuration
      res.json({
        success: true,
        config: {
          theme: 'dark',
          fontSize: '14px',
          showLineNumbers: true,
          enableSyntaxHighlighting: true,
          autoFormat: true,
          livePreview: true
        },
        timestamp: new Date().toISOString()
      });
    } else {
      // Update preview configuration
      const { config } = req.body;
      
      res.json({
        success: true,
        message: 'Preview configuration updated',
        config: config || {},
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('Preview config error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
} 