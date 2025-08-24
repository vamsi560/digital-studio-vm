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
  console.log('Enhanced Code Generator API called:', { method: req.method, url: req.url });

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
    const { description, platform, framework, styling, architecture } = req.body;

    if (!description) {
      return res.status(400).json({
        success: false,
        error: 'Description is required',
        timestamp: new Date().toISOString()
      });
    }

    console.log('Enhanced code generation:', { description, platform, framework });

    // Enhanced code generation logic
    const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Generate enhanced ${framework} code for: ${description}. Platform: ${platform}, Styling: ${styling}, Architecture: ${architecture}`;
    const result = await model.generateContent(prompt);
    const generatedCode = result.response.text();

    res.json({
      success: true,
      code: generatedCode,
      description,
      platform: platform || 'web',
      framework: framework || 'React',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Enhanced code generator error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
} 