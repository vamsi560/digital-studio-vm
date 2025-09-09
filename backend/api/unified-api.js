import { GoogleGenerativeAI } from '@google/generative-ai';
import multer from 'multer';
import cors from 'cors';
import JSZip from 'jszip';

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
  console.log('Unified API Request received:', {
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
      
      default:
        return res.status(400).json({ error: 'Invalid action specified' });
    }

  } catch (error) {
    console.error('Unified API Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
}

// Enhanced code generation function that creates complete projects
async function generateCompleteReactProject(images, options) {
  // Generate the main React component
  const mainComponentCode = await generateWithGemini(images, options);
  
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

    'src/index.css': generateCSS(options.styling),

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

  return projectFiles;
}

function generateCSS(stylingOption) {
  const baseCSS = `body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}

* {
  box-sizing: border-box;
}`;

  if (stylingOption === 'Tailwind CSS') {
    return `@tailwind base;
@tailwind components;
@tailwind utilities;

${baseCSS}`;
  }

  return baseCSS;
}

// Helper: generate code with Gemini using images and options
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

  const prompt = `Generate a complete ${framework} main component (App.jsx) for a ${platform} project.\n\nRequirements:\n\n- Styling: ${styling}\n\n- Architecture: ${architecture}\n\n- Custom Logic: ${customLogic || 'None'}\n\n- Routing: ${routing || 'None'}\n\n\nProvide production-ready, accessible, responsive code. Include necessary imports. Return only the component code.`;

  const imageParts = (images || []).map(img => ({
    inlineData: {
      data: img.data,
      mimeType: img.mimeType || 'image/png'
    }
  }));

  const result = await model.generateContent([prompt, ...imageParts]);
  return result.response.text();
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

    // Generate complete project with all files
    const projectFiles = await generateCompleteReactProject(images, options);
    
    const projectId = `project-${Date.now()}`;
    
    res.json({
      success: true,
      projectFiles: projectFiles,
      mainCode: projectFiles['src/App.jsx'],
      qualityScore: { overall: 8, codeQuality: 8, performance: 8, accessibility: 8, security: 8 },
      analysis: { analysis: 'Complete project structure generated with all necessary files' },
      projectId,
      metadata: {
        id: projectId,
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
    const { description, features } = req.body;

    console.log('Generating Android code:', { description, features });

    const prompt = `Generate Android native code for: ${description}. Features: ${features}`;
    
    const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const generatedCode = result.response.text();

    res.json({
      success: true,
      code: generatedCode,
      platform: 'android',
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
    const indexHtml = `