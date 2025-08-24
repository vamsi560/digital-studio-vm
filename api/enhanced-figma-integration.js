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
  console.log('Enhanced Figma Integration API called:', { method: req.method, url: req.url });

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
    const { figmaUrl, platform, framework, styling, architecture } = req.body;

    if (!figmaUrl) {
      return res.status(400).json({
        success: false,
        error: 'Figma URL is required',
        timestamp: new Date().toISOString()
      });
    }

    console.log('Enhanced Figma integration:', { figmaUrl, platform, framework });

    // Enhanced Figma integration logic
    const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Analyze this Figma design and provide enhanced integration insights: ${figmaUrl}`;
    const result = await model.generateContent(prompt);
    const analysis = result.response.text();

    res.json({
      success: true,
      analysis,
      figmaUrl,
      platform: platform || 'web',
      framework: framework || 'React',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Enhanced Figma integration error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
} 