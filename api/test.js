import cors from 'cors';

// CORS configuration
const corsMiddleware = cors({
  origin: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:5173',
  credentials: true
});

export default async function handler(req, res) {
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
    res.json({
      success: true,
      message: 'API is working!',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      geminiConfigured: true // Hardcoded for testing
    });
  } catch (error) {
    console.error('Test error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
} 