import { GoogleGenerativeAI } from '@google/generative-ai';
import cors from 'cors';

// CORS configuration
const corsMiddleware = cors({
  origin: true,
  credentials: true
});

// Initialize Gemini AI model
const gemini = new GoogleGenerativeAI("AIzaSyBcR6rMwP9v8e2cN56gdnkWMhJtOWyP_uU");

export default async function handler(req, res) {
  console.log('Enhanced Live Preview API called:', { method: req.method, url: req.url });

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
    const { code, framework, platform } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Code is required',
        timestamp: new Date().toISOString()
      });
    }

    console.log('Enhanced live preview generation:', { framework, platform });

    // Enhanced live preview logic
    const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Generate enhanced live preview for ${framework} code: ${code}`;
    const result = await model.generateContent(prompt);
    const enhancedPreview = result.response.text();

    res.json({
      success: true,
      enhancedPreview,
      framework: framework || 'React',
      platform: platform || 'web',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Enhanced live preview error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
} 