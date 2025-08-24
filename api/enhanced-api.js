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
  console.log('Enhanced API called:', { method: req.method, url: req.url });

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
    const { action, data } = req.body;

    if (!action) {
      return res.status(400).json({
        success: false,
        error: 'Action is required',
        timestamp: new Date().toISOString()
      });
    }

    console.log('Enhanced API action:', { action, data });

    // Handle different enhanced API actions
    switch (action) {
      case 'advanced_code_generation':
        return await handleAdvancedCodeGeneration(req, res, data);
      
      case 'code_optimization':
        return await handleCodeOptimization(req, res, data);
      
      case 'component_analysis':
        return await handleComponentAnalysis(req, res, data);
      
      default:
        return res.status(400).json({ error: 'Invalid enhanced API action' });
    }

  } catch (error) {
    console.error('Enhanced API error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
}

// Enhanced API helper functions
async function handleAdvancedCodeGeneration(req, res, data) {
  try {
    const { description, platform, framework } = data || {};
    
    const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Generate advanced ${framework} code for: ${description}. Platform: ${platform}`;
    const result = await model.generateContent(prompt);
    const advancedCode = result.response.text();

    res.json({
      success: true,
      advancedCode,
      description,
      platform: platform || 'web',
      framework: framework || 'React',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    throw error;
  }
}

async function handleCodeOptimization(req, res, data) {
  try {
    const { code, framework } = data || {};
    
    const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Optimize this ${framework} code for performance and best practices: ${code}`;
    const result = await model.generateContent(prompt);
    const optimizedCode = result.response.text();

    res.json({
      success: true,
      optimizedCode,
      framework: framework || 'React',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    throw error;
  }
}

async function handleComponentAnalysis(req, res, data) {
  try {
    const { code, framework } = data || {};
    
    const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Analyze this ${framework} component and provide detailed insights: ${code}`;
    const result = await model.generateContent(prompt);
    const analysis = result.response.text();

    res.json({
      success: true,
      analysis,
      framework: framework || 'React',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    throw error;
  }
} 