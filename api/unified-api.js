import { GoogleGenerativeAI } from '@google/generative-ai';
import multer from 'multer';
import cors from 'cors';
import JSZip from 'jszip';
import SpecializedCVTools from './utils/specialized-cv-tools.js';
import HybridAnalysisMerger from './utils/hybrid-analysis-merger.js';

// CORS configuration
const corsMiddleware = cors({
  origin: true, // Allow all origins for testing
  credentials: true
});

// Initialize Gemini AI model
const gemini = new GoogleGenerativeAI("AIzaSyBcR6rMwP9v8e2cN56gdnkWMhJtOWyP_uU");

// Initialize CV analysis tools
const cvTools = new SpecializedCVTools();
const hybridMerger = new HybridAnalysisMerger();

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

// Enhanced code generation function that creates complete projects with hybrid CV-LLM analysis
async function generateCompleteReactProject(images, options) {
  console.log('Starting hybrid CV-LLM code generation...');
  
  // Generate the main React component using hybrid approach
  const mainComponentCode = await generateWithHybridAnalysis(images, options);
  
  // Validate and ensure CSS files are always generated
  const cssValidation = validateCSSRequirements(mainComponentCode, options);
  
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

    'src/index.css': generateGlobalCSS(options.styling),
    'src/App.css': generateAppCSS(options.styling, cssValidation),

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

  // Add testing configuration and files
  projectFiles['src/setupTests.js'] = `// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';`;

  projectFiles['src/App.test.jsx'] = `import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});

test('renders without crashing', () => {
  render(<App />);
});`;

  // Add ESLint configuration
  projectFiles['.eslintrc.json'] = `{
  "extends": [
    "react-app",
    "react-app/jest"
  ],
  "rules": {
    "no-unused-vars": "warn",
    "no-console": "warn",
    "react/prop-types": "warn",
    "react/no-unescaped-entities": "warn"
  }
}`;

  // Add Prettier configuration
  projectFiles['.prettierrc'] = `{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}`;

  // Add environment variables template
  projectFiles['.env.example'] = `# API Configuration
REACT_APP_API_URL=http://localhost:3001/api

# Feature Flags
REACT_APP_ENABLE_ANALYTICS=false
REACT_APP_DEBUG_MODE=false

# External Services
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here`;

  // Add comprehensive documentation
  projectFiles['DEVELOPMENT.md'] = `# Development Guide

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation
\`\`\`bash
npm install
\`\`\`

### Development Server
\`\`\`bash
npm start
\`\`\`
Opens [http://localhost:3000](http://localhost:3000)

### Building for Production
\`\`\`bash
npm run build
\`\`\`

### Running Tests
\`\`\`bash
npm test
\`\`\`

## Project Structure
\`\`\`
src/
├── components/          # Reusable UI components
├── pages/              # Page-level components
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── services/           # API services
├── context/            # React Context providers
├── types/              # TypeScript type definitions
├── constants/          # Application constants
└── assets/             # Static assets
\`\`\`

## Code Standards
- Use functional components with hooks
- Follow component naming conventions (PascalCase)
- Write comprehensive tests for components
- Use meaningful commit messages
- Follow ESLint and Prettier rules

## Styling Guidelines
${options.styling === 'Tailwind CSS' ? 
  '- Use Tailwind CSS utility classes\n- Create custom components in App.css for complex styles\n- Follow mobile-first responsive design' :
  '- Use CSS modules or styled-components\n- Follow BEM naming convention\n- Create reusable style components'
}

## Performance Best Practices
- Use React.memo for expensive components
- Implement code splitting with React.lazy
- Optimize images and assets
- Use useMemo and useCallback appropriately
- Monitor bundle size

## Deployment
This project is configured for deployment on:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

## Environment Variables
Copy \`.env.example\` to \`.env.local\` and configure your environment variables.
`;

  // Add additional utility files
  projectFiles['src/utils/constants.js'] = `// Application constants
export const API_ENDPOINTS = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  USERS: '/users',
  POSTS: '/posts',
};

export const APP_CONFIG = {
  APP_NAME: 'Digital Studio Project',
  VERSION: '1.0.0',
  DESCRIPTION: 'Generated with Digital Studio VM',
};

export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  CONTACT: '/contact',
};`;

  projectFiles['src/utils/helpers.js'] = `// Utility helper functions

/**
 * Formats a date string to a readable format
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Check if an object is empty
 * @param {Object} obj - Object to check
 * @returns {boolean} True if empty
 */
export const isEmpty = (obj) => {
  return Object.keys(obj).length === 0;
};`;

  // Add a custom hook example
  projectFiles['src/hooks/useLocalStorage.js'] = `import { useState, useEffect } from 'react';

/**
 * Custom hook for localStorage management
 * @param {string} key - localStorage key
 * @param {*} initialValue - Initial value
 * @returns {[*, Function]} Current value and setter function
 */
export const useLocalStorage = (key, initialValue) => {
  // Get from local storage then parse stored json or return initialValue
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(\`Error reading localStorage key "\${key}":\`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(\`Error setting localStorage key "\${key}":\`, error);
    }
  };

  return [storedValue, setValue];
};`;

  return projectFiles;
}

// Generate global CSS for index.css
function generateGlobalCSS(stylingOption) {
  const globalCSS = `/* Global Styles - src/index.css */

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  line-height: 1.6;
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
  font-weight: 600;
}

p {
  margin: 0 0 1rem 0;
}

button {
  font-family: inherit;
  cursor: pointer;
}

input, textarea, select {
  font-family: inherit;
}

/* Utility Classes */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}`;

  if (stylingOption === 'Tailwind CSS') {
    return `@tailwind base;
@tailwind components;
@tailwind utilities;

${globalCSS}`;
  }

  return globalCSS;
}

// Generate component-specific CSS for App.css
function generateAppCSS(stylingOption, validation = {}) {
  // Extract component classes from validation if available
  const detectedClasses = validation.detectedClasses || [];
  const missingImports = validation.missingImports || [];
  
  let appCSS = `/* App Component Styles - src/App.css */

.App {
  text-align: center;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.App-header {
  background-color: #282c34;
  padding: 20px;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
}

.App-link {
  color: #61dafb;
  text-decoration: none;
}

.App-link:hover {
  text-decoration: underline;
}

.App-content {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

/* Responsive Design */
@media (max-width: 768px) {
  .App-header {
    padding: 1rem;
    font-size: calc(8px + 2vmin);
  }
  
  .App-content {
    padding: 1rem;
  }
}

/* Button Styles */
.btn {
  background-color: #61dafb;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  color: #282c34;
  font-weight: 600;
  transition: background-color 0.3s ease;
}

.btn:hover {
  background-color: #21a1c4;
}

.btn:focus {
  outline: 2px solid #61dafb;
  outline-offset: 2px;
}

/* Card Styles */
.card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
}

/* Form Styles */
.form-group {
  margin-bottom: 1rem;
  text-align: left;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-input:focus {
  outline: none;
  border-color: #61dafb;
  box-shadow: 0 0 0 2px rgba(97, 218, 251, 0.2);
}`;

  // Add styles for detected classes that might be missing
  if (detectedClasses.length > 0) {
    appCSS += `\n\n/* Auto-generated styles for detected classes */\n`;
    detectedClasses.forEach(className => {
      if (!appCSS.includes(`.${className}`)) {
        appCSS += `\n.${className} {\n  /* Add styles for ${className} */\n  padding: 0.5rem;\n  margin: 0.25rem;\n}\n`;
      }
    });
  }

  if (stylingOption === 'Tailwind CSS') {
    return `/* App Component Styles - src/App.css */
/* Custom component styles when using Tailwind CSS */

.App {
  @apply min-h-screen flex flex-col;
}

.App-header {
  @apply bg-gray-800 p-8 text-white flex flex-col items-center justify-center text-2xl;
}

.App-content {
  @apply flex-1 p-8 max-w-6xl mx-auto w-full;
}

/* Custom components that extend Tailwind */
.btn-primary {
  @apply bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2;
}

.card {
  @apply bg-white rounded-lg p-6 shadow-md mb-4;
}

/* Responsive utilities */
@media (max-width: 768px) {
  .App-header {
    @apply p-4 text-xl;
  }
  
  .App-content {
    @apply p-4;
  }
}${detectedClasses.length > 0 ? '\n\n/* Auto-generated Tailwind utilities for detected classes */\n' + detectedClasses.map(className => `/* .${className} - Add Tailwind classes as needed */`).join('\n') : ''}`;
  }

  return appCSS;
}

// CSS validation function to ensure proper CSS generation
function validateCSSRequirements(componentCode, options) {
  const validation = {
    detectedClasses: [],
    missingImports: [],
    hasAppCSSImport: false,
    hasIndexCSSImport: false,
    recommendations: []
  };

  // Check for CSS imports
  validation.hasAppCSSImport = componentCode.includes("import './App.css'") || componentCode.includes('import "./App.css"');
  validation.hasIndexCSSImport = componentCode.includes("import './index.css'") || componentCode.includes('import "./index.css"');

  // Extract className usages
  const classNameMatches = componentCode.match(/className=["']([^"']+)["']/g);
  if (classNameMatches) {
    classNameMatches.forEach(match => {
      const classes = match.match(/className=["']([^"']+)["']/)[1].split(' ');
      validation.detectedClasses.push(...classes.filter(cls => cls.trim()));
    });
    validation.detectedClasses = [...new Set(validation.detectedClasses)]; // Remove duplicates
  }

  // Validate import statements
  if (!validation.hasAppCSSImport) {
    validation.missingImports.push('App.css');
    validation.recommendations.push('Component should import App.css for component-specific styles');
  }

  // Check for common CSS framework usage
  if (options.styling === 'Tailwind CSS') {
    const hasTailwindClasses = validation.detectedClasses.some(cls => 
      ['bg-', 'text-', 'p-', 'm-', 'flex', 'grid', 'w-', 'h-'].some(prefix => cls.startsWith(prefix))
    );
    if (hasTailwindClasses) {
      validation.recommendations.push('Detected Tailwind classes - ensure Tailwind CSS is properly configured');
    }
  }

  return validation;
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

  const prompt = `Generate a complete ${framework} main component (App.jsx) for a ${platform} project.

CRITICAL REQUIREMENTS:
- MUST include: import './App.css'; at the top of the component
- MUST use className attributes for styling (not inline styles)
- MUST follow the exact CSS file structure standards:
  * App.css for component-specific styles
  * index.css for global styles (already handled)

TECHNICAL SPECIFICATIONS:
- Platform: ${platform}
- Framework: ${framework}
- Styling: ${styling}
- Architecture: ${architecture}
- Custom Logic: ${customLogic || 'None'}
- Routing: ${routing || 'None'}

CSS REQUIREMENTS:
- Import App.css: import './App.css';
- Use semantic CSS class names (e.g., .App, .App-header, .App-content)
- Ensure responsive design with CSS classes
- Follow accessibility best practices

CODE STRUCTURE:
- Functional component with proper imports
- Clean, semantic HTML structure
- Proper component organization
- Error boundaries where appropriate
- Loading states and user feedback

QUALITY STANDARDS:
- Production-ready, accessible, responsive code
- Modern React best practices
- Clean, readable code structure
- Comprehensive error handling

Return ONLY the complete App.jsx component code with proper CSS import.`;

  const imageParts = (images || []).map(img => ({
    inlineData: {
      data: img.data,
      mimeType: img.mimeType || 'image/png'
    }
  }));

  const result = await model.generateContent([prompt, ...imageParts]);
  let generatedCode = result.response.text();
  
  // Ensure CSS import is present - fallback mechanism
  if (!generatedCode.includes("import './App.css'") && !generatedCode.includes('import "./App.css"')) {
    // Add CSS import after other imports
    const importLines = [];
    const otherLines = [];
    const lines = generatedCode.split('\n');
    let foundImports = false;
    
    for (const line of lines) {
      if (line.trim().startsWith('import ')) {
        importLines.push(line);
        foundImports = true;
      } else if (foundImports && !line.trim()) {
        // Empty line after imports - good place to add our import
        importLines.push("import './App.css';");
        importLines.push(line);
        otherLines.push(...lines.slice(lines.indexOf(line) + 1));
        break;
      } else if (!foundImports) {
        // No imports found yet, this might be before imports
        otherLines.push(line);
      } else {
        // After imports
        if (importLines.length > 0 && !importLines.includes("import './App.css';")) {
          importLines.push("import './App.css';");
        }
        otherLines.push(line);
      }
    }
    
    if (!importLines.includes("import './App.css';")) {
      importLines.push("import './App.css';");
    }
    
    generatedCode = [...importLines, ...otherLines].join('\n');
  }
  
  return generatedCode;
}

// Enhanced hybrid analysis function combining CV and LLM
async function generateWithHybridAnalysis(images, options) {
  try {
    console.log('Running hybrid CV-LLM analysis pipeline...');
    
    // Step 1: Run CV analysis on images
    const cvAnalysis = await cvTools.analyzeWithSpecializedCV(images);
    console.log('CV analysis completed:', {
      elements: cvAnalysis.elements?.length || 0,
      confidence: cvAnalysis.confidence || 0
    });
    
    // Step 2: Run traditional LLM analysis
    const llmAnalysis = await analyzeImageMetadata(images, gemini.getGenerativeModel({ model: 'gemini-1.5-flash' }));
    console.log('LLM analysis completed');
    
    // Step 3: Merge CV and LLM results
    const mergedAnalysis = await hybridMerger.mergeAnalysisResults(cvAnalysis, llmAnalysis, options);
    console.log('Hybrid analysis merge completed:', {
      confidence: mergedAnalysis.confidence?.overall || 0,
      elements: mergedAnalysis.elements?.length || 0
    });
    
    // Step 4: Generate enhanced prompt with merged insights
    const enhancedPrompt = buildEnhancedPromptFromHybridAnalysis(mergedAnalysis, options);
    
    // Step 5: Generate code with enhanced context
    const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const imageParts = (images || []).map(img => ({
      inlineData: {
        data: img.data,
        mimeType: img.mimeType || 'image/png'
      }
    }));
    
    const result = await model.generateContent([enhancedPrompt, ...imageParts]);
    let generatedCode = result.response.text();
    
    // Ensure CSS import is present
    if (!generatedCode.includes("import './App.css'") && !generatedCode.includes('import "./App.css"')) {
      const importLines = [];
      const otherLines = [];
      const lines = generatedCode.split('\n');
      let foundImports = false;
      
      for (const line of lines) {
        if (line.trim().startsWith('import ')) {
          importLines.push(line);
          foundImports = true;
        } else if (foundImports && !line.trim()) {
          importLines.push("import './App.css';");
          importLines.push(line);
          otherLines.push(...lines.slice(lines.indexOf(line) + 1));
          break;
        } else if (!foundImports) {
          otherLines.push(line);
        } else {
          if (importLines.length > 0 && !importLines.includes("import './App.css';")) {
            importLines.push("import './App.css';");
          }
          otherLines.push(line);
        }
      }
      
      if (!importLines.includes("import './App.css';")) {
        importLines.push("import './App.css';");
      }
      
      generatedCode = [...importLines, ...otherLines].join('\n');
    }
    
    console.log('Hybrid code generation completed successfully');
    return generatedCode;
    
  } catch (error) {
    console.error('Hybrid analysis error, falling back to LLM-only:', error);
    // Fallback to original LLM-only approach
    return await generateWithGemini(images, options);
  }
}

// Build enhanced prompt from hybrid analysis results
function buildEnhancedPromptFromHybridAnalysis(mergedAnalysis, options) {
  const {
    platform = 'web',
    framework = 'React',
    styling = 'Tailwind CSS',
    architecture = 'Component Based',
    customLogic = '',
    routing = ''
  } = options || {};

  const { elements, layout, colors, insights } = mergedAnalysis;
  
  // Extract detailed analysis for prompt
  const detectedElements = elements.map(el => ({
    type: el.enhancedType || el.type,
    bounds: el.bounds,
    confidence: el.confidence,
    semanticRole: el.semanticRole
  }));
  
  const layoutStructure = layout.structure || 'simple';
  const gridInfo = layout.grid || { columns: 1, rows: 1 };
  const semanticLayout = layout.semantic || {};
  
  const colorPalette = colors.map(color => ({
    hex: color.hex,
    usage: color.usage,
    confidence: color.confidence
  })).slice(0, 6); // Top 6 colors
  
  const prompt = `Generate a complete ${framework} main component (App.jsx) for a ${platform} project using HYBRID CV-LLM ANALYSIS.

CRITICAL REQUIREMENTS:
- MUST include: import './App.css'; at the top of the component
- MUST use className attributes for styling (not inline styles)
- MUST follow the exact CSS file structure standards
- Follow the PRECISE layout and element specifications below

HYBRID ANALYSIS RESULTS (Confidence: ${Math.round((mergedAnalysis.confidence?.overall || 0) * 100)}%):

DETECTED UI ELEMENTS (${detectedElements.length} elements):
${detectedElements.map((el, i) => 
  `${i + 1}. ${el.type} at (${el.bounds?.x || 0}, ${el.bounds?.y || 0}) - ${el.bounds?.width || 0}x${el.bounds?.height || 0}px
   - Semantic Role: ${el.semanticRole || 'content'}
   - Confidence: ${Math.round((el.confidence || 0) * 100)}%`
).join('\n')}

LAYOUT STRUCTURE:
- Type: ${layoutStructure}
- Grid: ${gridInfo.columns} columns × ${gridInfo.rows} rows
- Has Header: ${semanticLayout.hasHeader ? 'Yes' : 'No'}
- Has Sidebar: ${semanticLayout.hasSidebar ? 'Yes' : 'No'}
- Has Footer: ${semanticLayout.hasFooter ? 'Yes' : 'No'}
- Responsive: ${semanticLayout.isResponsive ? 'Yes' : 'No'}

COLOR PALETTE:
${colorPalette.map(color => 
  `- ${color.hex} (${color.usage || 'accent'}) - ${Math.round((color.confidence || 0) * 100)}% confidence`
).join('\n')}

TECHNICAL SPECIFICATIONS:
- Platform: ${platform}
- Framework: ${framework}
- Styling: ${styling}
- Architecture: ${architecture}
- Custom Logic: ${customLogic || 'None'}
- Routing: ${routing || 'None'}

QUALITY INSIGHTS:
- Element Detection Accuracy: ${Math.round((insights.accuracy?.elementDetection || 0) * 100)}%
- Layout Analysis Accuracy: ${Math.round((insights.accuracy?.layoutAnalysis || 0) * 100)}%
- CV-Enhanced Elements: ${insights.improvements?.cvEnhanced || 0}
- Cross-Validated Elements: ${insights.improvements?.crossValidated || 0}

CODE GENERATION REQUIREMENTS:
1. Create components that EXACTLY match the detected elements and their positions
2. Use the specified layout structure (${layoutStructure})
3. Apply the detected color palette with semantic usage
4. Implement responsive design based on analysis
5. Follow ${architecture} architecture pattern
6. Use semantic HTML elements based on detected roles
7. Ensure accessibility with proper ARIA labels
8. Implement proper spacing and alignment as detected

CSS REQUIREMENTS:
- Import App.css: import './App.css';
- Use semantic CSS class names matching detected elements
- Apply detected colors with CSS custom properties
- Implement responsive breakpoints
- Follow accessibility best practices

CODE STRUCTURE:
- Functional component with proper imports
- Clean, semantic HTML structure matching CV analysis
- Proper component organization based on detected hierarchy
- Error boundaries where appropriate
- Loading states and user feedback

Return ONLY the complete App.jsx component code with proper CSS import.
Ensure the code matches the hybrid analysis results with pixel-perfect accuracy.`;

  return prompt;
}

// Helper function to analyze image metadata (existing LLM analysis)
async function analyzeImageMetadata(images, model) {
  if (!images || images.length === 0) {
    return {
      analysis: 'No images provided for analysis',
      confidence: 0
    };
  }
  
  try {
    const prompt = `Analyze these UI mockup images and provide detailed insights about:
1. UI Components (buttons, inputs, navigation, etc.)
2. Layout Structure (grid, flexbox, columns, etc.)
3. Color Scheme and Typography
4. Visual Hierarchy and Spacing
5. Interactive Elements
6. Responsive Design Considerations

Provide a comprehensive analysis for code generation.`;
    
    const imageParts = images.map(img => ({
      inlineData: {
        data: img.data,
        mimeType: img.mimeType || 'image/png'
      }
    }));
    
    const result = await model.generateContent([prompt, ...imageParts]);
    return {
      analysis: result.response.text(),
      confidence: 0.8 // Default LLM confidence
    };
  } catch (error) {
    console.error('LLM analysis error:', error);
    return {
      analysis: 'Error in LLM analysis',
      confidence: 0
    };
  }
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
