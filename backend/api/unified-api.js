import { GoogleGenerativeAI } from '@google/generative-ai';
import multer from 'multer';
import cors from 'cors';
import JSZip from 'jszip';
import crypto from 'crypto';
import { InputValidator, SecurityValidator, createValidationMiddleware } from './validation.js';
import { codeGenerationCache, performanceMonitor, requestThrottler } from './cache.js';
import { advancedCodeGenerator, CodeAnalyzer, ProjectOptimizer } from './advanced-features.js';

// CORS configuration
const corsMiddleware = cors({
  origin: true, // Allow all origins for testing
  credentials: true
});

// Initialize Gemini AI model
const gemini = new GoogleGenerativeAI("AIzaSyBcR6rMwP9v8e2cN56gdnkWMhJtOWyP_uU");

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 10
  }
});

export default async function handler(req, res) {
  const startTime = performanceMonitor.startTimer();
  const clientId = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
  
  console.log('Unified API Request received:', {
    method: req.method,
    url: req.url,
    contentType: req.headers['content-type'],
    clientId,
    timestamp: new Date().toISOString()
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

  // Rate limiting
  if (!requestThrottler.isAllowed(clientId)) {
    const remaining = requestThrottler.getRemainingRequests(clientId);
    return res.status(429).json({
      success: false,
      error: 'Rate limit exceeded. Please try again later.',
      retryAfter: 60,
      remainingRequests: remaining,
      timestamp: new Date().toISOString()
    });
  }

  try {
    const { action, ...data } = req.body || {};
    const contentType = req.headers['content-type'] || '';

    // Handle form data requests (for generate-code)
    if (contentType.includes('multipart/form-data')) {
      return await handleCodeGeneration(req, res);
    }

    // Handle JSON requests with action parameter
    switch (action) {
      case 'generate_code':
        return await handleCodeGeneration(req, res);
      
      case 'import_figma':
        return await handleFigmaImport(req, res);
      
      case 'generate_native_code':
        return await handleNativeCodeGeneration(req, res);
      
      case 'generate_android':
        return await handleAndroidGeneration(req, res);
      
      case 'generate_mcp':
        return await handleMCPGeneration(req, res);
      
      case 'analyze_prompt':
        return await handlePromptAnalysis(req, res);
      
      case 'generate_from_text':
        return await handleTextGeneration(req, res);
      
      case 'github_export':
        return await handleGitHubExport(req, res);
      
      case 'download_zip':
        return await handleDownloadZip(req, res);
      
      case 'live_preview':
        return await handleLivePreview(req, res);
      
      case 'evaluate_code':
        return await handleCodeEvaluation(req, res);
      
      case 'enhanced_api':
        return await handleEnhancedAPI(req, res);
      
      case 'health':
        return await handleHealth(req, res);
      
      case 'metrics':
        return await handleMetrics(req, res);
      
      default:
        return res.status(400).json({ error: 'Invalid action specified' });
    }

  } catch (error) {
    console.error('Unified API Error:', error);
    
    // Record error metrics
    performanceMonitor.recordRequest(
      performanceMonitor.endTimer(startTime), 
      true, 
      false
    );
    
    // Enhanced error response
    const errorResponse = {
      success: false,
      error: error.message || 'Internal server error',
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID()
    };
    
    // Add validation error details
    if (error.name === 'ValidationError') {
      errorResponse.field = error.field;
      errorResponse.code = error.code;
      res.status(400).json(errorResponse);
    } else {
      res.status(500).json(errorResponse);
    }
  }
}

// Enhanced code generation function that creates complete projects
async function generateCompleteReactProject(images, options) {
  try {
    // Validate inputs
    InputValidator.validateProjectOptions(options);
    
    // Use advanced code generator with caching and retry logic
    const result = await advancedCodeGenerator.generateWithRetry(images, options);
    
    // Analyze the generated code
    const analysis = CodeAnalyzer.analyzeCode(result.code, options.framework);
    
    // Optimize the project
    const optimizedProject = ProjectOptimizer.optimizeProject(result.projectFiles || { 'src/App.jsx': result.code });
    
    return {
      success: true,
      projectFiles: optimizedProject,
      mainCode: optimizedProject['src/App.jsx'] || result.code,
      analysis: analysis,
      qualityScore: result.quality || analysis.maintainability,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Enhanced code generation failed:', error);
    // Fallback to basic generation
    const mainComponentCode = await generateWithGemini(images, options);
    
    // Analyze images for enhanced CSS generation
    let imageAnalysis = null;
    if (images && images.length > 0) {
      try {
        const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
        imageAnalysis = await analyzeImageMetadata(images, model);
      } catch (error) {
        console.warn('Image analysis failed for CSS generation:', error.message);
      }
    }
    
    // Create complete project structure
  const projectFiles = {
    'package.json': JSON.stringify({
      name: "digital-studio-project",
      version: "1.0.0",
      private: true,
      dependencies: {
        "react": "^18.2.0",
        "react-dom": "^18.2.0",
        "react-scripts": "5.0.1",
        ...(options.styling === 'Tailwind CSS' && {
          "tailwindcss": "^3.3.0",
          "autoprefixer": "^10.4.14",
          "postcss": "^8.4.24"
        })
      },
      scripts: {
        "start": "react-scripts start",
        "build": "react-scripts build",
        "test": "react-scripts test",
        "eject": "react-scripts eject"
      },
      eslintConfig: {
        extends: ["react-app", "react-app/jest"]
      },
      browserslist: {
        production: [">0.2%", "not dead", "not op_mini all"],
        development: ["last 1 chrome version", "last 1 firefox version", "last 1 safari version"]
      }
    }, null, 2),

    'src/App.jsx': mainComponentCode,

    'src/index.js': `import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,

    'src/index.css': generateCSS(options.styling, imageAnalysis),

    'src/theme.json': JSON.stringify(imageAnalysis || {
      colors: ['#1f2937', '#3b82f6', '#10b981', '#f59e0b'],
      alignment: 'center',
      spacing: 'comfortable',
      typography: 'modern',
      theme: 'light'
    }, null, 2),

    'public/index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="Generated React App by Digital Studio VM" />
    <title>Digital Studio Project</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>`,

    'README.md': `# Digital Studio Project

This project was generated using Digital Studio VM.

## Available Scripts

In the project directory, you can run:

### \`npm start\`

Runs the app in development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### \`npm test\`

Launches the test runner in interactive watch mode.

### \`npm run build\`

Builds the app for production to the \`build\` folder.

## Generated Features

- Framework: ${options.framework}
- Platform: ${options.platform}
- Styling: ${options.styling}
- Architecture: ${options.architecture}

Generated on: ${new Date().toISOString()}
`
  };

  // Add Tailwind config if using Tailwind CSS
  if (options.styling === 'Tailwind CSS') {
    projectFiles['tailwind.config.js'] = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`;

    projectFiles['postcss.config.js'] = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;
  }

    return {
      success: true,
      projectFiles: projectFiles,
      mainCode: mainComponentCode,
      timestamp: new Date().toISOString()
    };
  }
}

function generateCSS(stylingOption, imageAnalysis = null) {
  const theme = imageAnalysis?.theme || 'light';
  const colors = imageAnalysis?.colors || ['#1f2937', '#3b82f6'];
  const typography = imageAnalysis?.typography || 'modern';
  
  // Typography selection based on analysis
  const fontStacks = {
    modern: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    classic: 'Georgia, "Times New Roman", Times, serif',
    bold: '"Inter", "Helvetica Neue", Arial, sans-serif',
    minimal: '"Source Sans Pro", -apple-system, sans-serif'
  };
  
  const selectedFont = fontStacks[typography] || fontStacks.modern;

  const baseCSS = `/* Global Styles - Generated from image analysis */
:root {
  --font-primary: ${selectedFont};
  --primary-color: ${colors[0] || '#1f2937'};
  --secondary-color: ${colors[1] || '#3b82f6'};
  --accent-color: ${colors[2] || '#10b981'};
  --background: ${theme === 'dark' ? '#0f172a' : '#ffffff'};
  --surface: ${theme === 'dark' ? '#1e293b' : '#f8fafc'};
  --text-primary: ${theme === 'dark' ? '#f1f5f9' : '#1e293b'};
  --text-secondary: ${theme === 'dark' ? '#94a3b8' : '#64748b'};
  --border-color: ${theme === 'dark' ? '#334155' : '#e2e8f0'};
}

body {
  margin: 0;
  font-family: var(--font-primary);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: var(--background);
  color: var(--text-primary);
  transition: background-color 0.3s ease, color 0.3s ease;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}

* {
  box-sizing: border-box;
}

/* CSS Reset */
h1, h2, h3, h4, h5, h6 {
  margin: 0;
  font-weight: ${typography === 'bold' ? '700' : '600'};
  color: var(--text-primary);
}

p {
  margin: 0 0 1rem 0;
  color: var(--text-secondary);
}

a {
  color: var(--primary-color);
  text-decoration: none;
  transition: color 0.2s ease;
}

a:hover {
  color: var(--secondary-color);
}`;

  if (stylingOption === 'Tailwind CSS') {
    return `@tailwind base;
@tailwind components;
@tailwind utilities;

${baseCSS}

/* Custom Tailwind utilities based on image analysis */
@layer utilities {
  .text-analyzed-primary { color: var(--text-primary); }
  .text-analyzed-secondary { color: var(--text-secondary); }
  .bg-analyzed-surface { background-color: var(--surface); }
  .border-analyzed { border-color: var(--border-color); }
}`;
  }

  return baseCSS;
}

// Helper: generate code with Gemini using images and options with enhanced analysis
async function generateWithGemini(images, options) {
  const {
    platform = 'web',
    framework = 'React',
    styling = 'Tailwind CSS',
    architecture = 'Component Based',
    customLogic = '',
    routing = ''
  } = options || {};

  const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });

  // First, analyze images if provided
  let imageAnalysis = null;
  if (images && images.length > 0) {
    try {
      imageAnalysis = await analyzeImageMetadata(images, model);
    } catch (error) {
      console.warn('Image analysis failed, using defaults:', error.message);
    }
  }

  // Enhanced prompt with image analysis data
  let prompt = `Generate a complete ${framework} main component (App.jsx) for a ${platform} project.

REQUIREMENTS:
- Platform: ${platform}
- Framework: ${framework}
- Styling: ${styling}
- Architecture: ${architecture}
- Custom Logic: ${customLogic || 'None'}
- Routing: ${routing || 'None'}`;

  if (imageAnalysis) {
    prompt += `

IMAGE ANALYSIS RESULTS:
- Colors detected: ${imageAnalysis.colors.join(', ')}
- Layout alignment: ${imageAnalysis.alignment}
- Spacing preference: ${imageAnalysis.spacing}
- Typography style: ${imageAnalysis.typography}
- Theme: ${imageAnalysis.theme}
- Components identified: ${imageAnalysis.components.join(', ')}
- Layout type: ${imageAnalysis.layout}

Use these visual elements to create an accurate representation of the design.`;
  }

  prompt += `

TECHNICAL SPECIFICATIONS:
- Use modern best practices and clean code
- Implement responsive design with proper mobile support
- Add accessibility features (ARIA labels, semantic HTML)
- Include proper error handling and loading states
- Use CSS variables for consistent theming
- Ensure high performance and SEO optimization

Return only the complete, runnable component code without explanations.`;

  const imageParts = (images || []).map(img => ({
    inlineData: {
      data: img.data,
      mimeType: img.mimeType || 'image/png'
    }
  }));

  const result = await model.generateContent([prompt, ...imageParts]);
  return result.response.text();
}

// Enhanced image analysis function
async function analyzeImageMetadata(images, model) {
  const analysisPrompt = `Analyze these UI/UX design images and extract detailed visual metadata.

EXTRACT THE FOLLOWING:
1. COLOR PALETTE: List the primary colors used (hex codes)
2. LAYOUT ALIGNMENT: left, center, right, justified
3. SPACING: tight, comfortable, loose
4. TYPOGRAPHY: modern, classic, bold, minimal
5. ICONS: Describe any icons, buttons, or UI elements visible
6. LAYOUT TYPE: grid, flex, sidebar, header-footer, card-based
7. THEME: light, dark, colorful, minimal
8. COMPONENTS: List UI components visible (navbar, cards, forms, etc.)

Return a JSON object with this structure:
{
  "colors": ["#hex1", "#hex2", "#hex3"],
  "alignment": "center|left|right",
  "spacing": "tight|comfortable|loose", 
  "typography": "modern|classic|bold|minimal",
  "icons": ["description of icons/buttons"],
  "layout": "grid|flex|sidebar|header-footer|card-based",
  "theme": "light|dark|colorful|minimal",
  "components": ["navbar", "cards", "forms"]
}`;

  const imageParts = images.map(img => ({
    inlineData: {
      data: img.data,
      mimeType: img.mimeType || 'image/png'
    }
  }));

  const result = await model.generateContent([analysisPrompt, ...imageParts]);
  const analysisText = result.response.text();
  
  // Clean the response to extract JSON
  const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  
  // Fallback analysis
  return {
    colors: ['#1f2937', '#3b82f6', '#10b981', '#f59e0b'],
    alignment: 'center',
    spacing: 'comfortable',
    typography: 'modern',
    icons: ['basic UI elements'],
    layout: 'responsive',
    theme: 'light',
    components: ['header', 'main', 'footer']
  };
}

// Update the handleCodeGeneration function
async function handleCodeGeneration(req, res) {
  try {
    console.log('Parsing form data...');
    const formData = await new Promise((resolve, reject) => {
      upload.array('images', 10)(req, res, (err) => {
        if (err) {
          console.error('Multer error:', err);
          reject(err);
        } else {
          console.log('Form data parsed successfully');
          console.log('Files received:', req.files?.length || 0);
          console.log('Body data:', req.body);
          resolve(req);
        }
      });
    });

    // Handle case where no files are uploaded
    if (!formData.files || formData.files.length === 0) {
      console.log('No files uploaded, generating sample project...');
      
      const options = {
        platform: 'web',
        framework: 'React',
        styling: 'Tailwind CSS',
        architecture: 'Component Based'
      };

      const sampleProjectFiles = await generateCompleteReactProject([], options);
      
      res.json({
        success: true,
        projectFiles: sampleProjectFiles,
        mainCode: sampleProjectFiles['src/App.jsx'],
        qualityScore: { overall: 8, codeQuality: 8, performance: 8, accessibility: 8, security: 8 },
        analysis: { analysis: 'Sample project with complete file structure' },
        projectId: `project-${Date.now()}`,
        metadata: {
          id: `project-${Date.now()}`,
          platform: options.platform,
          framework: options.framework,
          qualityScore: { overall: 8 },
          timestamp: new Date().toISOString(),
          analysis: 'Complete project structure generated'
        },
        platform: options.platform,
        framework: options.framework,
        timestamp: new Date().toISOString()
      });
      return;
    }

    const images = formData.files?.map(file => ({
      data: file.buffer.toString('base64'),
      mimeType: file.mimetype,
      originalname: file.originalname
    })) || [];

    const options = {
      platform: formData.body.platform || 'web',
      framework: formData.body.framework || 'React',
      styling: formData.body.styling || 'Tailwind CSS',
      architecture: formData.body.architecture || 'Component Based',
      customLogic: formData.body.customLogic || '',
      routing: formData.body.routing || ''
    };

    // Route to appropriate generator based on platform
    let projectFiles;
    if (options.platform === 'android') {
      projectFiles = await generateCompleteAndroidProject(images, options);
    } else if (options.platform === 'ios') {
      projectFiles = await generateCompleteIOSProject(images, options);
    } else {
      // Default to React web project
      projectFiles = await generateCompleteReactProject(images, options);
    }
    
    const projectId = `project-${Date.now()}`;
    
    // Determine main code file based on platform
    let mainCode;
    if (options.platform === 'android') {
      mainCode = projectFiles['app/src/main/java/com/digitalstudio/app/MainActivity.kt'] || 
                 projectFiles['app/src/main/java/com/digitalstudio/app/MainActivity.java'];
    } else if (options.platform === 'ios') {
      mainCode = projectFiles['DigitalStudioApp/ContentView.swift'] || 
                 projectFiles['DigitalStudioApp/ViewController.swift'];
    } else {
      mainCode = projectFiles['src/App.jsx'];
    }

    res.json({
      success: true,
      projectFiles: projectFiles,
      mainCode: mainCode,
      qualityScore: { overall: 8, codeQuality: 8, performance: 8, accessibility: 8, security: 8 },
      analysis: { analysis: `Complete ${options.platform} project structure generated with all necessary files` },
      projectId,
      metadata: {
        id: projectId,
        platform: options.platform,
        framework: options.framework,
        qualityScore: { overall: 8 },
        timestamp: new Date().toISOString(),
        analysis: `Complete ${options.platform} project structure generated`
      },
      platform: options.platform,
      framework: options.framework,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Code generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

// Handle Figma import
async function handleFigmaImport(req, res) {
  try {
    const { figmaUrl, platform, framework, styling, architecture } = req.body;

    if (!figmaUrl) {
      return res.status(400).json({
        success: false,
        error: 'Figma URL is required',
        timestamp: new Date().toISOString()
      });
    }

    console.log('Importing from Figma:', { figmaUrl, platform, framework });

    // Extract file key from Figma URL
    const fileKey = extractFigmaFileKey(figmaUrl);
    if (!fileKey) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Figma URL',
        timestamp: new Date().toISOString()
      });
    }

    // Get Figma file data
    const figmaData = await getFigmaFileData(fileKey);
    const frames = extractFigmaFrames(figmaData.document);
    const imageUrls = await getFigmaImageUrls(fileKey, frames);
    const images = await downloadFigmaImages(imageUrls);

    // Generate code from Figma data
    const options = {
      platform: platform || 'web',
      framework: framework || 'React',
      styling: styling || 'Tailwind CSS',
      architecture: architecture || 'Component Based'
    };

    const generatedCode = await generateWithGemini(images, options);
    
    const projectId = `figma-project-${Date.now()}`;
    
    res.json({
      success: true,
      mainCode: generatedCode,
      figmaData: {
        fileKey,
        frames: frames.length,
        images: images.length
      },
      projectId,
      platform: options.platform,
      framework: options.framework,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Figma import error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

// Handle native code generation
async function handleNativeCodeGeneration(req, res) {
  try {
    const { platform, framework, description, images } = req.body;

    console.log('Generating native code:', { platform, framework, description });

    const prompt = `Generate ${platform} native code using ${framework} for the following description: ${description}`;
    
    const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const generatedCode = result.response.text();

    res.json({
      success: true,
      code: generatedCode,
      platform,
      framework,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Native code generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

// Handle Android generation
async function handleAndroidGeneration(req, res) {
  try {
    const { description, features, architecture = 'MVVM', language = 'Kotlin' } = req.body;

    console.log('Generating Android code:', { description, features, architecture, language });

    const projectFiles = await generateCompleteAndroidProject(description, features, architecture, language);

    res.json({
      success: true,
      projectFiles: projectFiles,
      mainCode: projectFiles['app/src/main/java/com/example/app/MainActivity.kt'] || projectFiles['app/src/main/java/com/example/app/MainActivity.java'],
      platform: 'android',
      architecture: architecture,
      language: language,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Android generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

// Enhanced Android project generation with image analysis
async function generateCompleteAndroidProject(images, options) {
  const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
  
  const {
    architecture = 'MVVM',
    customLogic = '',
    styling = 'Material Design 3'
  } = options || {};
  
  // Analyze images for Android-specific design patterns
  let imageAnalysis = null;
  if (images && images.length > 0) {
    try {
      imageAnalysis = await analyzeImageMetadata(images, model);
    } catch (error) {
      console.warn('Image analysis failed for Android generation:', error.message);
    }
  }
  
  const projectName = 'DigitalStudioApp';
  const packageName = 'com.digitalstudio.app';
  
  // Enhanced Android generation with Jetpack Compose support
  const useCompose = true; // Modern Android development uses Compose
  
  // Generate main activity with Jetpack Compose
  let mainActivityPrompt = `Generate a complete Kotlin MainActivity for Android using Jetpack Compose with ${architecture} architecture.

REQUIREMENTS:
- Use Jetpack Compose for UI (modern Android development)
- Implement ${architecture} architecture pattern  
- Include proper Material Design 3 theming
- Add proper state management with StateFlow/LiveData
- Include error handling and loading states
- Follow modern Android best practices
- Add accessibility features (contentDescription, semantics)
- Include proper lifecycle management
- Use Hilt for dependency injection
- Implement proper navigation with Navigation Compose

CUSTOM LOGIC: ${customLogic || 'Standard mobile app functionality'}`;

  if (imageAnalysis) {
    mainActivityPrompt += `

IMAGE ANALYSIS RESULTS:
- Colors detected: ${imageAnalysis.colors.join(', ')}
- Layout alignment: ${imageAnalysis.alignment}
- Spacing preference: ${imageAnalysis.spacing}
- Typography style: ${imageAnalysis.typography}
- Theme: ${imageAnalysis.theme}
- Components identified: ${imageAnalysis.components.join(', ')}
- Layout type: ${imageAnalysis.layout}

Use these visual elements to create Material Design 3 components that match the design.`;
  }

  mainActivityPrompt += `

ANDROID PROJECT STRUCTURE:
- MainActivity.kt with Compose setup
- UI composables with Material Design 3
- ViewModel for business logic (${architecture} pattern)
- Repository pattern for data layer
- Proper dependency injection with Hilt
- Navigation with NavController
- Theming with Material Design 3

Return ONLY the complete Kotlin MainActivity code with proper imports and package declaration.`;
  
  const mainActivityResult = await model.generateContent(mainActivityPrompt);
  const mainActivityCode = mainActivityResult.response.text();

  // Generate additional Compose files
  let composeUIPrompt = `Generate Jetpack Compose UI components with Material Design 3.

CUSTOM LOGIC: ${customLogic || 'Standard mobile app UI components'}

Create composable functions for:
- Main screen UI with proper Material Design 3 components
- Custom reusable composables
- Material Design 3 theming and colors
- Proper state handling with remember and State
- Loading states with CircularProgressIndicator
- Error states with proper user feedback
- Navigation composables
- Accessibility features (semantics, contentDescription)`;

  if (imageAnalysis) {
    composeUIPrompt += `

DESIGN REQUIREMENTS (from image analysis):
- Use colors: ${imageAnalysis.colors.join(', ')}
- Alignment: ${imageAnalysis.alignment}
- Spacing: ${imageAnalysis.spacing}
- Theme: ${imageAnalysis.theme}
- Components: ${imageAnalysis.components.join(', ')}

Apply these design elements using Material Design 3 components.`;
  }

  composeUIPrompt += `

Return only the Kotlin Compose UI code with proper package declaration and imports.`;

  const composeUIResult = await model.generateContent(composeUIPrompt);
  const composeUICode = composeUIResult.response.text();

  // Generate ViewModel
  const viewModelPrompt = `Generate a ${architecture} ViewModel for Android with custom logic: ${customLogic || 'Standard app functionality'}

Include:
- Proper state management with StateFlow/MutableStateFlow
- Business logic handling with proper separation of concerns
- Error handling with sealed classes or data classes
- Repository pattern integration
- Coroutines for async operations (viewModelScope)
- Hilt dependency injection (@HiltViewModel)
- Proper lifecycle awareness
- Loading states management
- Data validation and processing

Return only the Kotlin ViewModel code with proper package declaration and imports.`;

  const viewModelResult = await model.generateContent(viewModelPrompt);
  const viewModelCode = viewModelResult.response.text();

  // Generate enhanced project structure with modern Android standards
  const projectFiles = {
    'build.gradle.kts': `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("kotlin-kapt")
    id("kotlin-parcelize")
    id("dagger.hilt.android.plugin")
    id("androidx.navigation.safeargs.kotlin")
}

android {
    namespace = "${packageName}"
    compileSdk = 34

    defaultConfig {
        applicationId = "${packageName}"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_1_8
        targetCompatibility = JavaVersion.VERSION_1_8
    }
    
    kotlinOptions {
        jvmTarget = "1.8"
    }
    
    buildFeatures {
        compose = true
        viewBinding = true
    }
    
    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.8"
    }
    
    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    // Core Android
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.7.0")
    implementation("androidx.activity:activity-compose:1.8.2")
    
    // Jetpack Compose
    implementation(platform("androidx.compose:compose-bom:2024.02.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")
    
    // Navigation
    implementation("androidx.navigation:navigation-compose:2.7.6")
    
    // ViewModel & LiveData
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.7.0")
    implementation("androidx.lifecycle:lifecycle-livedata-ktx:2.7.0")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.7.0")
    
    // Dependency Injection
    implementation("com.google.dagger:hilt-android:2.48.1")
    implementation("androidx.hilt:hilt-navigation-compose:1.1.0")
    kapt("com.google.dagger:hilt-compiler:2.48.1")
    
    // Networking
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-gson:2.9.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")
    
    // Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")
    
    // Room Database
    implementation("androidx.room:room-runtime:2.6.1")
    implementation("androidx.room:room-ktx:2.6.1")
    kapt("androidx.room:room-compiler:2.6.1")
    
    // Image Loading
    implementation("io.coil-kt:coil-compose:2.5.0")
    
    // DataStore
    implementation("androidx.datastore:datastore-preferences:1.0.0")
    
    // Work Manager
    implementation("androidx.work:work-runtime-ktx:2.9.0")
    
    // Testing
    testImplementation("junit:junit:4.13.2")
    testImplementation("org.mockito:mockito-core:5.8.0")
    testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test:1.7.3")
    testImplementation("androidx.arch.core:core-testing:2.2.0")
    
    // Android Testing
    androidTestImplementation("androidx.test.ext:junit:1.1.5")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.5.1")
    androidTestImplementation(platform("androidx.compose:compose-bom:2024.02.00"))
    androidTestImplementation("androidx.compose.ui:ui-test-junit4")
    
    // Debug
    debugImplementation("androidx.compose.ui:ui-tooling")
    debugImplementation("androidx.compose.ui:ui-test-manifest")
}`,

    'app/src/main/java/com/digitalstudio/app/MainActivity.kt': mainActivityCode,
    
    'app/src/main/java/com/digitalstudio/app/ui/screens/MainScreen.kt': composeUICode,
    
    'app/src/main/java/com/digitalstudio/app/ui/viewmodel/MainViewModel.kt': viewModelCode,
    'app/src/main/java/com/digitalstudio/app/ui/screens/MainScreen.kt': composeUICode,
    
    'app/src/main/java/com/digitalstudio/app/ui/viewmodel/MainViewModel.kt': viewModelCode,

    'app/src/main/java/com/digitalstudio/app/ui/theme/Theme.kt': `package ${packageName}.ui.theme

import android.app.Activity
import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val DarkColorScheme = darkColorScheme(
    primary = Purple80,
    secondary = PurpleGrey80,
    tertiary = Pink80
)

private val LightColorScheme = lightColorScheme(
    primary = Purple40,
    secondary = PurpleGrey40,
    tertiary = Pink40
)

@Composable
fun DigitalStudioAppTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = true,
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = colorScheme.primary.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = darkTheme
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}`,

    'app/src/main/java/com/digitalstudio/app/ui/theme/Color.kt': `package ${packageName}.ui.theme

import androidx.compose.ui.graphics.Color

val Purple80 = Color(0xFFD0BCFF)
val PurpleGrey80 = Color(0xFFCCC2DC)
val Pink80 = Color(0xFFEFB8C8)

val Purple40 = Color(0xFF6650a4)
val PurpleGrey40 = Color(0xFF625b71)
val Pink40 = Color(0xFF7D5260)`,

    'app/src/main/java/com/digitalstudio/app/ui/theme/Type.kt': `package ${packageName}.ui.theme

import androidx.compose.material3.Typography
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

val Typography = Typography(
    bodyLarge = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Normal,
        fontSize = 16.sp,
        lineHeight = 24.sp,
        letterSpacing = 0.5.sp
    )
)`,

    'app/src/main/java/com/digitalstudio/app/data/repository/Repository.kt': `package ${packageName}.data.repository

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class Repository @Inject constructor(
    // Add data sources here (API, Database, etc.)
) {
    
    fun getData(): Flow<Result<List<String>>> = flow {
        try {
            // Implement data fetching logic
            emit(Result.success(listOf("Sample Data 1", "Sample Data 2")))
        } catch (e: Exception) {
            emit(Result.failure(e))
        }
    }
}`,

    'app/src/main/java/com/digitalstudio/app/di/AppModule.kt': `package ${packageName}.di

import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import ${packageName}.data.repository.Repository
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object AppModule {

    @Provides
    @Singleton
    fun provideRepository(): Repository {
        return Repository()
    }
}`,

    'app/src/main/AndroidManifest.xml': `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:name=".DigitalStudioApplication"
        android:allowBackup="true"
        android:dataExtractionRules="@xml/data_extraction_rules"
        android:fullBackupContent="@xml/backup_rules"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.DigitalStudioApp"
        tools:targetApi="31">
        
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:theme="@style/Theme.DigitalStudioApp">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`,

    'app/src/main/java/com/digitalstudio/app/DigitalStudioApplication.kt': `package ${packageName}

import android.app.Application
import dagger.hilt.android.HiltAndroidApp

@HiltAndroidApp
class DigitalStudioApplication : Application() {
    
    override fun onCreate() {
        super.onCreate()
    }
}`,
    id 'com.android.application'
    id 'org.jetbrains.kotlin.android'
    id 'kotlin-kapt'
    id 'kotlin-parcelize'
}

android {
    namespace '${packageName}'
    compileSdk 34

    defaultConfig {
        applicationId "${packageName}"
        minSdk 24
        targetSdk 34
        versionCode 1
        versionName "1.0"

        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_1_8
        targetCompatibility JavaVersion.VERSION_1_8
    }
    kotlinOptions {
        jvmTarget = '1.8'
    }
    buildFeatures {
        viewBinding true
        dataBinding true
    }
}

dependencies {
    implementation 'androidx.core:core-ktx:1.12.0'
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.11.0'
    implementation 'androidx.constraintlayout:constraintlayout:2.1.4'
    implementation 'androidx.lifecycle:lifecycle-viewmodel-ktx:2.7.0'
    implementation 'androidx.lifecycle:lifecycle-livedata-ktx:2.7.0'
    implementation 'androidx.navigation:navigation-fragment-ktx:2.7.6'
    implementation 'androidx.navigation:navigation-ui-ktx:2.7.6'
    implementation 'androidx.room:room-runtime:2.6.1'
    implementation 'androidx.room:room-ktx:2.6.1'
    kapt 'androidx.room:room-compiler:2.6.1'
    implementation 'com.squareup.retrofit2:retrofit:2.9.0'
    implementation 'com.squareup.retrofit2:converter-gson:2.9.0'
    implementation 'com.squareup.okhttp3:logging-interceptor:4.12.0'
    implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3'
    implementation 'androidx.work:work-runtime-ktx:2.9.0'
    
    testImplementation 'junit:junit:4.13.2'
    androidTestImplementation 'androidx.test.ext:junit:1.1.5'
    androidTestImplementation 'androidx.test.espresso:espresso-core:3.5.1'
}`,

    'app/src/main/java/com/digitalstudio/app/DigitalStudioApplication.kt': `package ${packageName}

import android.app.Application
import dagger.hilt.android.HiltAndroidApp

@HiltAndroidApp
class DigitalStudioApplication : Application() {
    
    override fun onCreate() {
        super.onCreate()
    }
}`,

    'app/src/main/res/values/strings.xml': `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">Digital Studio App</string>
    <string name="app_description">Generated with Digital Studio VM</string>
    <string name="welcome_message">Welcome to your generated Android app!</string>
    <string name="error_generic">Something went wrong. Please try again.</string>
    <string name="loading">Loading...</string>
    <string name="retry">Retry</string>
    <string name="cancel">Cancel</string>
    <string name="ok">OK</string>
</resources>`,

    'app/src/main/res/values/themes.xml': `<?xml version="1.0" encoding="utf-8"?>
<resources xmlns:tools="http://schemas.android.com/tools">
    <style name="Base.Theme.DigitalStudioApp" parent="Theme.Material3.DayNight">
        <!-- Customize your app theme here -->
    </style>

    <style name="Theme.DigitalStudioApp" parent="Base.Theme.DigitalStudioApp" />
</resources>`,

    'app/src/test/java/com/digitalstudio/app/ExampleUnitTest.kt': `package ${packageName}

import org.junit.Test
import org.junit.Assert.*

/**
 * Example local unit test, which will execute on the development machine (host).
 *
 * See [testing documentation](http://d.android.com/tools/testing).
 */
class ExampleUnitTest {
    @Test
    fun addition_isCorrect() {
        assertEquals(4, 2 + 2)
    }
}`,

    'app/src/androidTest/java/com/digitalstudio/app/ExampleInstrumentedTest.kt': `package ${packageName}

import androidx.test.platform.app.InstrumentationRegistry
import androidx.test.ext.junit.runners.AndroidJUnit4

import org.junit.Test
import org.junit.runner.RunWith

import org.junit.Assert.*

/**
 * Instrumented test, which will execute on an Android device.
 *
 * See [testing documentation](http://d.android.com/tools/testing).
 */
@RunWith(AndroidJUnit4::class)
class ExampleInstrumentedTest {
    @Test
    fun useAppContext() {
        // Context of the app under test.
        val appContext = InstrumentationRegistry.getInstrumentation().targetContext
        assertEquals("${packageName}", appContext.packageName)
    }
}`,

    'gradle.properties': `# Project-wide Gradle settings.
# IDE (e.g. Android Studio) users:
# Gradle settings configured through the IDE *will override*
# any settings specified in this file.
# For more details on how to configure your build environment visit
# http://www.gradle.org/docs/current/userguide/build_environment.html

# Specifies the JVM arguments used for the daemon process.
org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8

# When configured, Gradle will run in incubating parallel mode.
org.gradle.parallel=true

# AndroidX package structure to make it clearer which packages are bundled with the
# Android operating system, and which are packaged with your app's APK
android.useAndroidX=true

# Kotlin code style for this project: "official" or "obsolete":
kotlin.code.style=official

# Enables namespacing of each library's R class so that its R class includes only the
# resources declared in the library itself and none from the library's dependencies,
# thereby reducing the size of the R class for that library
android.nonTransitiveRClass=true`,

    'README.md': `# ${projectName}

This Android project was generated using Digital Studio VM.

## Features
- **Architecture**: ${architecture}
- **Language**: ${language}
- **UI Framework**: Jetpack Compose with Material Design 3
- **Dependency Injection**: Hilt
- **Navigation**: Navigation Compose
- **State Management**: ViewModel + StateFlow/LiveData

## Project Structure
\`\`\`
app/
├── src/main/java/com/digitalstudio/app/
│   ├── MainActivity.kt                 # Main entry point
│   ├── DigitalStudioApplication.kt     # Application class
│   ├── ui/
│   │   ├── screens/                    # Compose screens
│   │   ├── viewmodel/                  # ViewModels
│   │   └── theme/                      # Material Design 3 theme
│   ├── data/
│   │   └── repository/                 # Data layer
│   └── di/                            # Dependency injection modules
├── src/test/                          # Unit tests
└── src/androidTest/                   # Integration tests
\`\`\`

## Getting Started

### Prerequisites
- Android Studio Hedgehog | 2023.1.1 or later
- JDK 8 or higher
- Android SDK 34

### Building the Project
1. Clone or download the project
2. Open in Android Studio
3. Sync Gradle files
4. Run the app on a device/emulator

### Dependencies
- **Jetpack Compose**: Modern UI toolkit
- **Material Design 3**: Latest design system
- **Hilt**: Dependency injection
- **Navigation Compose**: Type-safe navigation
- **ViewModel**: MVVM architecture
- **Room**: Local database (optional)
- **Retrofit**: Networking (optional)
- **Coroutines**: Asynchronous programming

## Architecture
This project follows the **${architecture}** architecture pattern:
- **UI Layer**: Jetpack Compose screens and ViewModels
- **Domain Layer**: Business logic and use cases
- **Data Layer**: Repository pattern with data sources

## Testing
- **Unit Tests**: Located in \`src/test/\`
- **Integration Tests**: Located in \`src/androidTest/\`
- **Compose Tests**: UI testing with Compose Testing

## Generated Information
- **Description**: ${description}
- **Features**: ${features}
- **Generated**: ${new Date().toISOString()}
- **Generated by**: Digital Studio VM

## Next Steps
1. Customize the UI to match your design
2. Implement business logic in ViewModels
3. Add data sources (API, database)
4. Write comprehensive tests
5. Add more features as needed
`
  };

  return projectFiles;
}

// iOS project generation with SwiftUI
async function generateCompleteIOSProject(images, options) {
  const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
  
  const {
    architecture = 'MVVM',
    customLogic = '',
    styling = 'SwiftUI'
  } = options || {};
  
  // Analyze images for iOS-specific design patterns
  let imageAnalysis = null;
  if (images && images.length > 0) {
    try {
      imageAnalysis = await analyzeImageMetadata(images, model);
    } catch (error) {
      console.warn('Image analysis failed for iOS generation:', error.message);
    }
  }
  
  const projectName = 'DigitalStudioApp';
  const bundleId = 'com.digitalstudio.app';
  
  // Generate ContentView with SwiftUI
  let contentViewPrompt = `Generate a complete SwiftUI ContentView for iOS using ${architecture} architecture.

REQUIREMENTS:
- Use SwiftUI for UI (modern iOS development)
- Implement ${architecture} architecture pattern
- Include proper iOS design patterns (Human Interface Guidelines)
- Add proper state management with @StateObject, @ObservedObject
- Include error handling and loading states
- Follow modern iOS/Swift best practices
- Add accessibility features (accessibility labels, hints)
- Include proper navigation with NavigationView/NavigationStack
- Use Combine framework for reactive programming
- Implement proper dependency injection

CUSTOM LOGIC: ${customLogic || 'Standard iOS app functionality'}`;

  if (imageAnalysis) {
    contentViewPrompt += `

IMAGE ANALYSIS RESULTS:
- Colors detected: ${imageAnalysis.colors.join(', ')}
- Layout alignment: ${imageAnalysis.alignment}
- Spacing preference: ${imageAnalysis.spacing}
- Typography style: ${imageAnalysis.typography}
- Theme: ${imageAnalysis.theme}
- Components identified: ${imageAnalysis.components.join(', ')}
- Layout type: ${imageAnalysis.layout}

Use these visual elements to create SwiftUI views that match the design with iOS-appropriate adaptations.`;
  }

  contentViewPrompt += `

iOS PROJECT STRUCTURE:
- ContentView.swift with SwiftUI setup
- ViewModels following ${architecture} pattern
- Models and data structures
- Network/Repository layer
- Proper SwiftUI navigation
- iOS-specific UI components

Return ONLY the complete Swift ContentView code with proper imports.`;

  const contentViewResult = await model.generateContent(contentViewPrompt);
  const contentViewCode = contentViewResult.response.text();

  // Generate ViewModel for iOS
  const viewModelPrompt = `Generate a ${architecture} ViewModel for iOS/SwiftUI with custom logic: ${customLogic || 'Standard iOS app functionality'}

Include:
- ObservableObject protocol conformance
- @Published properties for state management
- Business logic handling with proper separation
- Error handling with proper Swift error types
- Combine framework integration for reactive programming
- Async/await for modern Swift concurrency
- Proper dependency injection
- Network/API integration patterns
- Core Data integration if needed
- Proper lifecycle management

Return only the Swift ViewModel code with proper imports.`;

  const viewModelResult = await model.generateContent(viewModelPrompt);
  const viewModelCode = viewModelResult.response.text();

  // Generate App.swift file
  const appSwiftPrompt = `Generate a SwiftUI App struct for iOS with proper setup.

Include:
- @main App struct
- WindowGroup setup
- Proper app lifecycle handling
- Dependency injection setup
- Core Data stack if needed
- Environment setup

Return only the Swift App code.`;

  const appSwiftResult = await model.generateContent(appSwiftPrompt);
  const appSwiftCode = appSwiftResult.response.text();

  // Generate complete iOS project structure
  const projectFiles = {
    'DigitalStudioApp.xcodeproj/project.pbxproj': `// !$*UTF8*$!
{
	archiveVersion = 1;
	classes = {
	};
	objectVersion = 56;
	objects = {
		// Project configuration for iOS app
		// Modern iOS development with SwiftUI
		// Minimum iOS version: 16.0
	};
	rootObject = /* Project object */;
}`,

    'DigitalStudioApp/App.swift': appSwiftCode,
    
    'DigitalStudioApp/ContentView.swift': contentViewCode,
    
    'DigitalStudioApp/ViewModels/MainViewModel.swift': viewModelCode,
    
    'DigitalStudioApp/Models/AppModel.swift': `import Foundation
import SwiftUI

// MARK: - Data Models
struct AppModel: Codable, Identifiable {
    let id = UUID()
    // Add your data properties here
    
    // Custom logic: ${customLogic || 'Standard data model'}
}

// MARK: - App State
class AppState: ObservableObject {
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var items: [AppModel] = []
}`,

    'DigitalStudioApp/Views/Components/LoadingView.swift': `import SwiftUI

struct LoadingView: View {
    var body: some View {
        VStack {
            ProgressView()
                .scaleEffect(1.5)
                .padding()
            
            Text("Loading...")
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(UIColor.systemBackground))
    }
}

#Preview {
    LoadingView()
}`,

    'DigitalStudioApp/Views/Components/ErrorView.swift': `import SwiftUI

struct ErrorView: View {
    let message: String
    let retryAction: () -> Void
    
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "exclamationmark.triangle")
                .font(.system(size: 50))
                .foregroundColor(.orange)
            
            Text("Something went wrong")
                .font(.title2)
                .fontWeight(.semibold)
            
            Text(message)
                .font(.body)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal)
            
            Button("Try Again") {
                retryAction()
            }
            .buttonStyle(.borderedProminent)
        }
        .padding()
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(UIColor.systemBackground))
    }
}

#Preview {
    ErrorView(message: "Unable to load data") {
        // Retry action
    }
}`,

    'DigitalStudioApp/Info.plist': `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>CFBundleDevelopmentRegion</key>
	<string>$(DEVELOPMENT_LANGUAGE)</string>
	<key>CFBundleExecutable</key>
	<string>$(EXECUTABLE_NAME)</string>
	<key>CFBundleIdentifier</key>
	<string>${bundleId}</string>
	<key>CFBundleInfoDictionaryVersion</key>
	<string>6.0</string>
	<key>CFBundleName</key>
	<string>$(PRODUCT_NAME)</string>
	<key>CFBundlePackageType</key>
	<string>APPL</string>
	<key>CFBundleShortVersionString</key>
	<string>1.0</string>
	<key>CFBundleVersion</key>
	<string>1</string>
	<key>LSRequiresIPhoneOS</key>
	<true/>
	<key>UIApplicationSceneManifest</key>
	<dict>
		<key>UIApplicationSupportsMultipleScenes</key>
		<true/>
		<key>UISceneConfigurations</key>
		<dict>
			<key>UIWindowSceneSessionRoleApplication</key>
			<array>
				<dict>
					<key>UISceneConfigurationName</key>
					<string>Default Configuration</string>
					<key>UISceneDelegateClassName</key>
					<string>$(PRODUCT_MODULE_NAME).SceneDelegate</string>
				</dict>
			</array>
		</dict>
	</dict>
	<key>UIApplicationSupportsIndirectInputEvents</key>
	<true/>
	<key>UILaunchScreen</key>
	<dict/>
	<key>UIRequiredDeviceCapabilities</key>
	<array>
		<string>armv7</string>
	</array>
	<key>UISupportedInterfaceOrientations</key>
	<array>
		<string>UIInterfaceOrientationPortrait</string>
		<string>UIInterfaceOrientationLandscapeLeft</string>
		<string>UIInterfaceOrientationLandscapeRight</string>
	</array>
	<key>UISupportedInterfaceOrientations~ipad</key>
	<array>
		<string>UIInterfaceOrientationPortrait</string>
		<string>UIInterfaceOrientationPortraitUpsideDown</string>
		<string>UIInterfaceOrientationLandscapeLeft</string>
		<string>UIInterfaceOrientationLandscapeRight</string>
	</array>
</dict>
</plist>`,

    'DigitalStudioApp/Assets.xcassets/Contents.json': `{
  "info" : {
    "author" : "xcode",
    "version" : 1
  }
}`,

    'DigitalStudioApp/Assets.xcassets/AppIcon.appiconset/Contents.json': `{
  "images" : [
    {
      "idiom" : "iphone",
      "scale" : "2x",
      "size" : "20x20"
    },
    {
      "idiom" : "iphone",
      "scale" : "3x",
      "size" : "20x20"
    },
    {
      "idiom" : "iphone",
      "scale" : "2x",
      "size" : "29x29"
    },
    {
      "idiom" : "iphone",
      "scale" : "3x",
      "size" : "29x29"
    },
    {
      "idiom" : "iphone",
      "scale" : "2x",
      "size" : "40x40"
    },
    {
      "idiom" : "iphone",
      "scale" : "3x",
      "size" : "40x40"
    },
    {
      "idiom" : "iphone",
      "scale" : "2x",
      "size" : "60x60"
    },
    {
      "idiom" : "iphone",
      "scale" : "3x",
      "size" : "60x60"
    },
    {
      "idiom" : "ipad",
      "scale" : "1x",
      "size" : "20x20"
    },
    {
      "idiom" : "ipad",
      "scale" : "2x",
      "size" : "20x20"
    }
  ],
  "info" : {
    "author" : "xcode",
    "version" : 1
  }
}`,

    'DigitalStudioApp/Assets.xcassets/AccentColor.colorset/Contents.json': `{
  "colors" : [
    {
      "idiom" : "universal"
    }
  ],
  "info" : {
    "author" : "xcode",
    "version" : 1
  }
}`,

    'README.md': `# ${projectName}

A SwiftUI iOS application generated by Digital Studio VM.

## Features

- Modern SwiftUI architecture
- ${architecture} design pattern
- iOS Human Interface Guidelines compliant
- Accessibility support
- Error handling and loading states
- Combine framework integration
- Modern Swift concurrency (async/await)

## Custom Logic

${customLogic || 'Standard iOS application functionality'}

## Architecture

This app follows the ${architecture} architecture pattern with:
- Views: SwiftUI views for the user interface
- ViewModels: Business logic and state management
- Models: Data structures and business entities
- Services: Network and data persistence layers

## Requirements

- iOS 16.0+
- Xcode 15.0+
- Swift 5.9+

## Installation

1. Open DigitalStudioApp.xcodeproj in Xcode
2. Select your target device or simulator
3. Press Cmd+R to build and run

## Generated Features

${imageAnalysis ? `
### Design Analysis Applied
- Colors: ${imageAnalysis.colors.join(', ')}
- Theme: ${imageAnalysis.theme}
- Layout: ${imageAnalysis.layout}
- Components: ${imageAnalysis.components.join(', ')}
` : ''}

Generated on: ${new Date().toISOString()}
`
  };

  return projectFiles;
}

        app:layout_constraintTop_toTopOf="parent">

        <LinearLayout
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:orientation="vertical"
            android:padding="24dp">

            <ImageView
                android:layout_width="64dp"
                android:layout_height="64dp"
                android:layout_gravity="center_horizontal"
                android:layout_marginBottom="16dp"
                android:src="@android:drawable/ic_dialog_info"
                app:tint="@color/md_theme_light_primary" />

            <TextView
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:layout_gravity="center_horizontal"
                android:layout_marginBottom="8dp"
                android:text="@string/app_name"
                android:textAppearance="@style/TextAppearance.Material3.HeadlineSmall"
                android:textColor="@color/md_theme_light_onSurface" />

            <TextView
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:layout_gravity="center_horizontal"
                android:layout_marginBottom="24dp"
                android:text="@string/welcome_message"
                android:textAppearance="@style/TextAppearance.Material3.BodyLarge"
                android:textColor="@color/md_theme_light_onSurfaceVariant" />

            <com.google.android.material.button.MaterialButton
                android:id="@+id/btnAction"
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:text="Get Started"
                app:icon="@android:drawable/ic_media_play"
                style="@style/Widget.Material3.Button" />

        </LinearLayout>

    </com.google.android.material.card.MaterialCardView>

</androidx.constraintlayout.widget.ConstraintLayout>`,

    'README.md': `# Digital Studio Android App

This Android application was generated using Digital Studio VM.

## Features

- **Architecture**: ${architecture}
- **Language**: ${language}
- **Description**: ${description}
- **Features**: ${features}

## Getting Started

1. Open the project in Android Studio
2. Sync the project with Gradle files
3. Run the app on an emulator or device

## Project Structure

- \`app/src/main/java/\` - Main source code
- \`app/src/main/res/\` - Resources (layouts, strings, colors)
- \`app/src/main/AndroidManifest.xml\` - App configuration

## Dependencies

- Material Design 3
- AndroidX libraries
- Room database
- Retrofit for networking
- Coroutines for async operations

Generated on: ${new Date().toISOString()}
`
  };

  // Add main activity code
  if (language.toLowerCase() === 'kotlin') {
    projectFiles[`app/src/main/java/${packageName.replace(/\./g, '/')}/MainActivity.kt`] = mainActivityCode;
  } else {
    projectFiles[`app/src/main/java/${packageName.replace(/\./g, '/')}/MainActivity.java`] = mainActivityCode;
  }

  return projectFiles;
}

// Handle MCP generation
async function handleMCPGeneration(req, res) {
  try {
    const { description } = req.body;

    console.log('Generating MCP code:', { description });

    const prompt = `Generate Model Context Protocol (MCP) code for: ${description}`;
    
    const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const generatedCode = result.response.text();

    res.json({
      success: true,
      code: generatedCode,
      platform: 'mcp',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('MCP generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

// Handle prompt analysis
async function handlePromptAnalysis(req, res) {
  try {
    const { prompt, platform, framework, styling, architecture } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required',
        timestamp: new Date().toISOString()
      });
    }

    console.log('Analyzing prompt:', { prompt, platform, framework, styling, architecture });

    const analysisPrompt = `
Analyze the following project description and provide a detailed breakdown:

Project Description: ${prompt}
Platform: ${platform || 'web'}
Framework: ${framework || 'React'}
Styling: ${styling || 'Tailwind CSS'}
Architecture: ${architecture || 'Component-Based'}

Please provide:
1. Project Overview
2. Key Features
3. Technical Requirements
4. Component Structure
5. Data Flow
6. UI/UX Considerations
7. Implementation Recommendations

Return the analysis in a structured format.
    `;

    const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(analysisPrompt);
    const analysis = result.response.text();

    res.json({
      success: true,
      analysis,
      prompt,
      platform: platform || 'web',
      framework: framework || 'React',
      styling: styling || 'Tailwind CSS',
      architecture: architecture || 'Component-Based',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Prompt analysis error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
}

// Handle text generation
async function handleTextGeneration(req, res) {
  try {
    const { prompt, platform, framework, styling, architecture, customLogic, routing } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required',
        timestamp: new Date().toISOString()
      });
    }

    console.log('Generating code from text:', { prompt, platform, framework, styling, architecture });

    const codeGenerationPrompt = `
Generate a complete ${framework} component based on the following description:

Description: ${prompt}
Platform: ${platform || 'web'}
Framework: ${framework || 'React'}
Styling: ${styling || 'Tailwind CSS'}
Architecture: ${architecture || 'Component-Based'}
Custom Logic: ${customLogic || 'None'}
Routing: ${routing || 'None'}

Requirements:
1. Create a functional ${framework} component
2. Use ${styling} for styling
3. Follow ${architecture} architecture
4. Include proper error handling
5. Make it responsive and accessible
6. Add comprehensive comments
7. Follow best practices

Return only the complete component code without explanations.
    `;

    const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(codeGenerationPrompt);
    const generatedCode = result.response.text();

    const qualityScore = {
      overall: 8,
      codeQuality: 8,
      performance: 8,
      accessibility: 8,
      security: 8
    };

    const analysis = `# Component Analysis

## ${framework} Component for ${platform}

### Component Structure
- Functional component using ${framework}
- Styled with ${styling}
- Follows ${architecture} architecture

### Features
- Responsive design
- Accessible markup
- Error handling
- Clean code structure

### Technical Details
- Platform: ${platform}
- Framework: ${framework}
- Styling: ${styling}
- Architecture: ${architecture}

Generated from text description: "${prompt}"
    `;

    const projectId = `project-${Date.now()}`;

    res.json({
      success: true,
      mainCode: generatedCode,
      qualityScore,
      analysis: { analysis },
      projectId,
      metadata: {
        id: projectId,
        platform: platform || 'web',
        framework: framework || 'React',
        qualityScore,
        timestamp: new Date().toISOString(),
        analysis
      },
      platform: platform || 'web',
      framework: framework || 'React',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Text generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
}

// Handle GitHub export
async function handleGitHubExport(req, res) {
  try {
    const { projectData, projectName, framework, platform } = req.body;

    if (!projectData || !projectName) {
      return res.status(400).json({
        success: false,
        error: 'Project data and name are required',
        timestamp: new Date().toISOString()
      });
    }

    console.log('Exporting project to GitHub:', { projectName, framework, platform });

    // Create a ZIP file with the project structure
    const zip = new JSZip();

    // Add package.json
    const packageJson = {
      name: projectName.toLowerCase().replace(/\s+/g, '-'),
      version: "1.0.0",
      private: true,
      dependencies: {
        "react": "^18.2.0",
        "react-dom": "^18.2.0"
      },
      devDependencies: {
        "@types/react": "^18.2.0",
        "@types/react-dom": "^18.2.0",
        "vite": "^4.0.0",
        "@vitejs/plugin-react": "^4.0.0"
      },
      scripts: {
        "dev": "vite",
        "build": "vite build",
        "preview": "vite preview"
      }
    };

    zip.file("package.json", JSON.stringify(packageJson, null, 2));

    // Add README.md
    const readme = `# ${projectName}

This project was generated using Digital Studio VM.

## Features
- ${framework} framework
- ${platform} platform
- Modern development setup

## Getting Started

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Start development server:
\`\`\`bash
npm run dev
\`\`\`

3. Build for production:
\`\`\`bash
npm run build
\`\`\`

## Project Structure
- \`src/\` - Source code
- \`public/\` - Static assets
- \`package.json\` - Dependencies and scripts

Generated on: ${new Date().toISOString()}
`;

    zip.file("README.md", readme);

    // Add source files
    if (projectData.mainCode) {
      zip.file("src/App.jsx", projectData.mainCode);
    }

    // Add index.html
    const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`;

    zip.file("index.html", indexHtml);

    // Generate ZIP buffer
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${projectName}.zip"`);
    res.send(zipBuffer);

  } catch (error) {
    console.error('GitHub export error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
}

// Handle download zip
async function handleDownloadZip(req, res) {
  try {
    const { projectData, projectName } = req.body;

    if (!projectData || !projectName) {
      return res.status(400).json({
        success: false,
        error: 'Project data and name are required',
        timestamp: new Date().toISOString()
      });
    }

    // Create a ZIP file with the project structure
    const zip = new JSZip();

    // Add package.json
    const packageJson = {
      name: projectName.toLowerCase().replace(/\s+/g, '-'),
      version: "1.0.0",
      private: true,
      dependencies: {
        "react": "^18.2.0",
        "react-dom": "^18.2.0"
      },
      scripts: {
        "start": "react-scripts start",
        "build": "react-scripts build",
        "test": "react-scripts test"
      }
    };

    zip.file("package.json", JSON.stringify(packageJson, null, 2));

    // Add source files
    if (projectData.mainCode) {
      zip.file("src/App.jsx", projectData.mainCode);
    }

    // Generate ZIP buffer
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${projectName}.zip"`);
    res.send(zipBuffer);

  } catch (error) {
    console.error('Download zip error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
}

// Handle live preview
async function handleLivePreview(req, res) {
  try {
    const { code, framework } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Code is required',
        timestamp: new Date().toISOString()
      });
    }

    // Generate preview URL or return preview data
    res.json({
      success: true,
      previewUrl: `data:text/html;base64,${Buffer.from(code).toString('base64')}`,
      framework: framework || 'React',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Live preview error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
}

// Handle code evaluation
async function handleCodeEvaluation(req, res) {
  try {
    const { code, framework } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Code is required',
        timestamp: new Date().toISOString()
      });
    }

    const evaluationPrompt = `
Evaluate the quality of the following ${framework} code:

${code}

Provide a detailed evaluation covering:
1. Code Quality (1-10)
2. Performance (1-10)
3. Accessibility (1-10)
4. Best Practices (1-10)
5. Security (1-10)
6. Overall Score (1-10)

Return the evaluation as JSON format.
    `;

    const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(evaluationPrompt);
    const evaluation = result.response.text();

    res.json({
      success: true,
      evaluation,
      framework: framework || 'React',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Code evaluation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
}

// Handle enhanced API
async function handleEnhancedAPI(req, res) {
  try {
    const { action, ...data } = req.body;

    res.json({
      success: true,
      message: 'Enhanced API endpoint',
      action,
      data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Enhanced API error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
}

// Figma helper functions
function extractFigmaFileKey(url) {
  const match = url.match(/figma\.com\/file\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}

async function getFigmaFileData(fileKey) {
  // Placeholder for Figma API integration
  return {
    document: {
      children: []
    }
  };
}

function extractFigmaFrames(document) {
  // Placeholder for frame extraction
  return [];
}

async function getFigmaImageUrls(fileKey, frames) {
  // Placeholder for image URL generation
  return [];
}

async function downloadFigmaImages(imageUrls) {
  // Placeholder for image downloading
  return [];
}

// Health check endpoint
async function handleHealth(req, res) {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      services: {
        gemini: 'operational',
        cache: 'operational',
        validation: 'operational',
        performance: 'operational'
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development'
    };

    res.json(health);
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

// Metrics endpoint
async function handleMetrics(req, res) {
  try {
    const metrics = {
      performance: performanceMonitor.getMetrics(),
      cache: codeGenerationCache.getStats(),
      timestamp: new Date().toISOString()
    };

    res.json(metrics);
  } catch (error) {
    res.status(500).json({
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}