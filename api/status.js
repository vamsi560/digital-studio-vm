import cors from 'cors';

// CORS configuration
const corsMiddleware = cors({
  origin: true,
  credentials: true
});

export default async function handler(req, res) {
  console.log('Status API called:', { method: req.method, url: req.url });

  // Handle CORS
  await new Promise((resolve) => corsMiddleware(req, res, resolve));

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    // Return system status
    res.json({
      success: true,
      status: 'operational',
      services: {
        api: 'operational',
        database: 'operational',
        ai: 'operational',
        figma: 'operational'
      },
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });

  } catch (error) {
    console.error('Status API error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
} 