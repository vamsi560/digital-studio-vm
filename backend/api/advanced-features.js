// Advanced features and robustness improvements

import { GoogleGenerativeAI } from '@google/generative-ai';
import { codeGenerationCache, performanceMonitor } from './cache.js';
import { InputValidator, SecurityValidator } from './validation.js';

export class AdvancedCodeGenerator {
  constructor() {
    this.gemini = new GoogleGenerativeAI("AIzaSyBcR6rMwP9v8e2cN56gdnkWMhJtOWyP_uU");
    this.generationHistory = new Map();
  }

  async generateWithRetry(images, options, maxRetries = 3) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await this.generateCode(images, options);
        return result;
      } catch (error) {
        lastError = error;
        console.warn(`Generation attempt ${attempt} failed:`, error.message);
        
        if (attempt < maxRetries) {
          // Exponential backoff
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw new Error(`Code generation failed after ${maxRetries} attempts: ${lastError.message}`);
  }

  async generateCode(images, options) {
    const startTime = performanceMonitor.startTimer();
    
    try {
      // Validate inputs
      InputValidator.validateProjectOptions(options);
      
      // Use cache if available
      const cached = await codeGenerationCache.getCachedGeneration(images, options);
      if (cached) {
        performanceMonitor.recordRequest(
          performanceMonitor.endTimer(startTime), 
          false, 
          true
        );
        return cached;
      }

      // Generate with multiple strategies
      const strategies = [
        () => this.generateWithStrategy1(images, options),
        () => this.generateWithStrategy2(images, options),
        () => this.generateWithStrategy3(images, options)
      ];

      const results = await Promise.allSettled(strategies.map(strategy => strategy()));
      const successfulResults = results
        .filter(result => result.status === 'fulfilled')
        .map(result => result.value);

      if (successfulResults.length === 0) {
        throw new Error('All generation strategies failed');
      }

      // Select best result based on quality metrics
      const bestResult = this.selectBestResult(successfulResults);
      
      // Cache the result
      await codeGenerationCache.setCachedGeneration(images, options, bestResult);
      
      // Record metrics
      performanceMonitor.recordRequest(
        performanceMonitor.endTimer(startTime), 
        false, 
        false
      );

      return bestResult;

    } catch (error) {
      performanceMonitor.recordRequest(
        performanceMonitor.endTimer(startTime), 
        true, 
        false
      );
      throw error;
    }
  }

  async generateWithStrategy1(images, options) {
    // Strategy 1: Direct generation with detailed prompts
    const prompt = this.buildDetailedPrompt(images, options);
    const model = this.gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    
    return {
      code: result.response.text(),
      strategy: 'detailed-prompt',
      quality: this.assessCodeQuality(result.response.text())
    };
  }

  async generateWithStrategy2(images, options) {
    // Strategy 2: Step-by-step generation with image analysis
    const imageAnalysis = await this.analyzeImages(images);
    
    const steps = [
      this.generateArchitecture(images, options, imageAnalysis),
      this.generateComponents(images, options, imageAnalysis),
      this.generateStyling(images, options, imageAnalysis),
      this.generateLogic(images, options, imageAnalysis)
    ];

    const results = await Promise.all(steps);
    const combinedCode = this.combineStepResults(results, imageAnalysis);
    
    return {
      code: combinedCode,
      projectFiles: combinedCode,
      strategy: 'step-by-step',
      quality: this.assessCodeQuality(combinedCode['src/App.jsx'] || combinedCode.code || combinedCode),
      imageAnalysis
    };
  }

  async generateWithStrategy3(images, options) {
    // Strategy 3: Template-based generation with customization
    const template = this.getTemplate(options.platform, options.framework);
    const customizations = await this.generateCustomizations(images, options);
    const customizedCode = this.applyCustomizations(template, customizations);
    
    return {
      code: customizedCode,
      strategy: 'template-based',
      quality: this.assessCodeQuality(customizedCode)
    };
  }

  buildDetailedPrompt(images, options) {
    const { platform, framework, styling, architecture, customLogic, routing } = options;
    
    return `Generate a complete, production-ready ${framework} application for ${platform} platform.

REQUIREMENTS:
- Platform: ${platform}
- Framework: ${framework}
- Styling: ${styling}
- Architecture: ${architecture}
- Custom Logic: ${customLogic || 'Standard functionality'}
- Routing: ${routing || 'Basic navigation'}

TECHNICAL SPECIFICATIONS:
- Use modern best practices
- Include proper error handling
- Implement responsive design
- Add accessibility features
- Follow security guidelines
- Include comprehensive comments
- Use TypeScript if applicable
- Implement proper state management

CODE QUALITY:
- Clean, readable code
- Proper component structure
- Efficient algorithms
- Memory optimization
- Performance considerations

Return only the complete, runnable code without explanations.`;
  }

  async generateArchitecture(images, options) {
    const prompt = `Design the architecture for a ${options.framework} application on ${options.platform}.
    
    Architecture Pattern: ${options.architecture}
    Requirements: ${options.customLogic}
    
    Provide a detailed architecture plan including:
    - Component hierarchy
    - Data flow
    - State management
    - Service layer structure
    
    Return as structured JSON.`;
    
    const model = this.gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  }

  async generateComponents(images, options) {
    const prompt = `Generate React components for the following architecture.
    
    Framework: ${options.framework}
    Styling: ${options.styling}
    
    Create:
    - Main App component
    - Feature components
    - Reusable UI components
    - Layout components
    
    Return only the component code.`;
    
    const model = this.gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    return result.response.text();
  }

  async generateStyling(images, options) {
    const prompt = `Generate ${options.styling} styles for the components.
    
    Requirements:
    - Modern design
    - Responsive layout
    - Accessibility
    - Performance optimized
    
    Return only the styling code.`;
    
    const model = this.gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    return result.response.text();
  }

  async generateLogic(images, options) {
    const prompt = `Generate business logic and utilities for the application.
    
    Custom Logic: ${options.customLogic}
    Routing: ${options.routing}
    
    Include:
    - API integration
    - State management
    - Utility functions
    - Error handling
    
    Return only the logic code.`;
    
    const model = this.gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    return result.response.text();
  }

  combineStepResults(results, imageAnalysis = null) {
    // Combine architecture, components, styling, and logic into a complete project
    const [architecture, components, styling, logic] = results;
    
    return {
      'src/App.jsx': components,
      'src/App.css': this.generateAppCSS(styling, imageAnalysis),
      'src/index.css': this.generateGlobalCSS(styling, imageAnalysis),
      'src/utils/logic.js': logic,
      'src/architecture.json': JSON.stringify(architecture, null, 2),
      'src/theme.json': JSON.stringify(imageAnalysis || {}, null, 2)
    };
  }

  getTemplate(platform, framework) {
    const templates = {
      'web-react': {
        'src/App.jsx': `import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to React</h1>
      </header>
    </div>
  );
}

export default App;`,
        'src/App.css': `.App {
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
}`,
        'src/index.css': `body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

* {
  box-sizing: border-box;
}`
      }
    };
    
    return templates[`${platform}-${framework.toLowerCase()}`] || templates['web-react'];
  }

  async generateCustomizations(images, options) {
    const prompt = `Analyze the provided images and generate customizations for the template.
    
    Custom Logic: ${options.customLogic}
    Styling: ${options.styling}
    
    Return customizations as JSON with component modifications.`;
    
    const model = this.gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  }

  // Enhanced image analysis for extracting visual metadata
  async analyzeImages(images) {
    if (!images || images.length === 0) {
      return {
        colors: ['#1f2937', '#3b82f6', '#10b981', '#f59e0b'],
        alignment: 'center',
        spacing: 'comfortable',
        typography: 'modern',
        icons: [],
        layout: 'responsive',
        theme: 'light',
        components: []
      };
    }

    const model = this.gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
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
9. VISUAL HIERARCHY: How elements are prioritized
10. RESPONSIVE DESIGN: Mobile-first, desktop-first, or hybrid

Return a JSON object with this structure:
{
  "colors": ["#hex1", "#hex2", "#hex3"],
  "alignment": "center|left|right",
  "spacing": "tight|comfortable|loose", 
  "typography": "modern|classic|bold|minimal",
  "icons": ["description of icons/buttons"],
  "layout": "grid|flex|sidebar|header-footer|card-based",
  "theme": "light|dark|colorful|minimal",
  "components": ["navbar", "cards", "forms"],
  "hierarchy": "description of visual priority",
  "responsive": "mobile-first|desktop-first|hybrid"
}`;

    try {
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
      
      // Fallback if JSON parsing fails
      return this.extractMetadataFromText(analysisText);
      
    } catch (error) {
      console.warn('Image analysis failed, using defaults:', error.message);
      return {
        colors: ['#1f2937', '#3b82f6', '#10b981', '#f59e0b'],
        alignment: 'center',
        spacing: 'comfortable',
        typography: 'modern',
        icons: ['basic UI elements'],
        layout: 'responsive',
        theme: 'light',
        components: ['header', 'main', 'footer'],
        hierarchy: 'standard header-content-footer',
        responsive: 'mobile-first'
      };
    }
  }

  // Extract metadata from text when JSON parsing fails
  extractMetadataFromText(text) {
    const metadata = {
      colors: [],
      alignment: 'center',
      spacing: 'comfortable',
      typography: 'modern',
      icons: [],
      layout: 'responsive',
      theme: 'light',
      components: [],
      hierarchy: 'standard',
      responsive: 'mobile-first'
    };

    // Extract colors (hex codes)
    const colorMatches = text.match(/#[0-9a-fA-F]{6}/g);
    if (colorMatches) {
      metadata.colors = [...new Set(colorMatches)].slice(0, 6);
    }

    // Extract alignment
    if (text.includes('center')) metadata.alignment = 'center';
    else if (text.includes('left')) metadata.alignment = 'left';
    else if (text.includes('right')) metadata.alignment = 'right';

    // Extract theme
    if (text.includes('dark')) metadata.theme = 'dark';
    else if (text.includes('colorful')) metadata.theme = 'colorful';
    else if (text.includes('minimal')) metadata.theme = 'minimal';

    // Extract layout type
    if (text.includes('grid')) metadata.layout = 'grid';
    else if (text.includes('sidebar')) metadata.layout = 'sidebar';
    else if (text.includes('card')) metadata.layout = 'card-based';

    // Default colors if none found
    if (metadata.colors.length === 0) {
      metadata.colors = ['#1f2937', '#3b82f6', '#10b981', '#f59e0b'];
    }

    return metadata;
  }

  // Utility function to darken a color
  darkenColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, Math.min(255, (num >> 16) - amt));
    const G = Math.max(0, Math.min(255, (num >> 8 & 0x00FF) - amt));
    const B = Math.max(0, Math.min(255, (num & 0x0000FF) - amt));
    return '#' + ((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1);
  }

  // Utility function to lighten a color
  lightenColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, Math.min(255, (num >> 16) + amt));
    const G = Math.max(0, Math.min(255, (num >> 8 & 0x00FF) + amt));
    const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt));
    return '#' + ((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1);
  }

  applyCustomizations(template, customizations) {
    // Apply customizations to the template
    const customized = { ...template };
    
    for (const [file, customizations] of Object.entries(customizations)) {
      if (customized[file]) {
        customized[file] = this.mergeCode(customized[file], customizations);
      }
    }
    
    return customized;
  }

  mergeCode(original, customizations) {
    // Simple code merging - in production, use AST manipulation
    return original + '\n\n' + customizations;
  }

  generateAppCSS(styling, imageAnalysis = null) {
    const colors = imageAnalysis?.colors || ['#282c34', '#61dafb', '#ffffff'];
    const alignment = imageAnalysis?.alignment || 'center';
    const spacing = imageAnalysis?.spacing || 'comfortable';
    const theme = imageAnalysis?.theme || 'light';
    
    // Determine spacing values
    const spacingMap = {
      tight: { padding: '1rem', headerPadding: '1rem' },
      comfortable: { padding: '2rem', headerPadding: '20px' },
      loose: { padding: '3rem', headerPadding: '2rem' }
    };
    const spacingValues = spacingMap[spacing] || spacingMap.comfortable;

    // Generate color variables
    const primaryColor = colors[0] || '#282c34';
    const accentColor = colors[1] || '#61dafb';
    const backgroundColor = theme === 'dark' ? '#121212' : '#ffffff';
    const textColor = theme === 'dark' ? '#ffffff' : '#333333';

    const baseAppCSS = `/* App Component Styles - src/App.css */
/* Generated from image analysis - Colors: ${colors.join(', ')} */

:root {
  --primary-color: ${primaryColor};
  --accent-color: ${accentColor};
  --background-color: ${backgroundColor};
  --text-color: ${textColor};
  --spacing-unit: ${spacingValues.padding};
}

.App {
  text-align: ${alignment};
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--background-color);
  color: var(--text-color);
}

.App-header {
  background: linear-gradient(135deg, ${primaryColor}, ${accentColor});
  padding: ${spacingValues.headerPadding};
  color: white;
  display: flex;
  flex-direction: column;
  align-items: ${alignment === 'left' ? 'flex-start' : alignment === 'right' ? 'flex-end' : 'center'};
  justify-content: center;
  font-size: calc(10px + 2vmin);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.App-content {
  flex: 1;
  padding: var(--spacing-unit);
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

/* Color-based component styling */
.btn-primary {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background-color: ${this.darkenColor(primaryColor, 20)};
  transform: translateY(-1px);
}

.card {
  background-color: var(--background-color);
  border: 1px solid ${this.lightenColor(primaryColor, 70)};
  border-radius: 0.75rem;
  padding: var(--spacing-unit);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin: 1rem 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .App-header {
    padding: 1rem;
    font-size: calc(8px + 2vmin);
    align-items: center; /* Center on mobile regardless of desktop alignment */
  }
  
  .App-content {
    padding: 1rem;
  }
  
  :root {
    --spacing-unit: 1rem;
  }
}`;

    if (typeof styling === 'string' && styling.includes('Tailwind')) {
      return `/* App Component Styles - src/App.css */
/* Custom component styles when using Tailwind CSS */
/* Generated from image analysis - Colors: ${colors.join(', ')} */

:root {
  --primary-color: ${primaryColor};
  --accent-color: ${accentColor};
  --background-color: ${backgroundColor};
  --text-color: ${textColor};
}

.App {
  @apply min-h-screen flex flex-col;
  background-color: var(--background-color);
  color: var(--text-color);
  text-align: ${alignment};
}

.App-header {
  @apply p-8 text-white flex flex-col justify-center text-2xl shadow-lg;
  background: linear-gradient(135deg, ${primaryColor}, ${accentColor});
  align-items: ${alignment === 'left' ? 'flex-start' : alignment === 'right' ? 'flex-end' : 'center'};
}

.App-content {
  @apply flex-1 p-8 max-w-6xl mx-auto w-full;
}

/* Custom utility classes based on image analysis */
.btn-analyzed {
  background-color: var(--primary-color);
  @apply text-white border-none px-6 py-3 rounded-lg font-medium cursor-pointer transition-all duration-200;
}

.btn-analyzed:hover {
  background-color: ${this.darkenColor(primaryColor, 20)};
  @apply transform -translate-y-px;
}

.card-analyzed {
  background-color: var(--background-color);
  border-color: ${this.lightenColor(primaryColor, 70)};
  @apply border rounded-xl p-6 shadow-md my-4;
}`;
    }

    return baseAppCSS;
  }

  generateGlobalCSS(styling, imageAnalysis = null) {
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

    const baseGlobalCSS = `/* Global Styles - src/index.css */
/* Generated from image analysis - Theme: ${theme}, Typography: ${typography} */

:root {
  --font-primary: ${selectedFont};
  --primary-color: ${colors[0] || '#1f2937'};
  --secondary-color: ${colors[1] || '#3b82f6'};
  --accent-color: ${colors[2] || '#10b981'};
  --warning-color: ${colors[3] || '#f59e0b'};
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
  line-height: 1.6;
  background-color: var(--background);
  color: var(--text-primary);
  transition: background-color 0.3s ease, color 0.3s ease;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace;
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
}

/* Global utility classes based on image analysis */
.text-primary { color: var(--text-primary); }
.text-secondary { color: var(--text-secondary); }
.bg-surface { background-color: var(--surface); }
.border-default { border-color: var(--border-color); }

/* Responsive typography */
@media (max-width: 768px) {
  body {
    font-size: 14px;
  }
  
  h1 { font-size: 1.75rem; }
  h2 { font-size: 1.5rem; }
  h3 { font-size: 1.25rem; }
}`;

    if (typeof styling === 'string' && styling.includes('Tailwind')) {
      return `@tailwind base;
@tailwind components;
@tailwind utilities;

${baseGlobalCSS}

/* Custom Tailwind layer with image analysis */
@layer components {
  .btn-analyzed {
    @apply px-4 py-2 rounded-lg font-medium transition-all duration-200;
    background-color: var(--primary-color);
    color: white;
  }
  
  .btn-analyzed:hover {
    background-color: var(--secondary-color);
    @apply transform -translate-y-px shadow-lg;
  }
  
  .card-analyzed {
    @apply rounded-xl shadow-md transition-shadow duration-200;
    background-color: var(--surface);
    border: 1px solid var(--border-color);
  }
  
  .card-analyzed:hover {
    @apply shadow-lg;
  }
}`;
    }

    return baseGlobalCSS;
  }

  selectBestResult(results) {
    // Select the result with the highest quality score
    return results.reduce((best, current) => 
      current.quality > best.quality ? current : best
    );
  }

  assessCodeQuality(code) {
    // Simple quality assessment based on various metrics
    let score = 0;
    
    // Check for proper structure
    if (code.includes('import') || code.includes('require')) score += 20;
    if (code.includes('export') || code.includes('module.exports')) score += 20;
    
    // Check for error handling
    if (code.includes('try') && code.includes('catch')) score += 15;
    if (code.includes('error') || code.includes('Error')) score += 10;
    
    // Check for comments
    const commentLines = (code.match(/\/\/|\/\*|\*\//g) || []).length;
    score += Math.min(commentLines * 2, 15);
    
    // Check for modern practices
    if (code.includes('const') || code.includes('let')) score += 10;
    if (code.includes('async') || code.includes('await')) score += 10;
    
    // Check for accessibility
    if (code.includes('aria-') || code.includes('role=')) score += 10;
    
    return Math.min(score, 100);
  }
}

export class CodeAnalyzer {
  static analyzeCode(code, framework) {
    const analysis = {
      complexity: this.calculateComplexity(code),
      maintainability: this.assessMaintainability(code),
      performance: this.assessPerformance(code),
      security: this.assessSecurity(code),
      accessibility: this.assessAccessibility(code),
      recommendations: []
    };

    // Generate recommendations
    if (analysis.complexity > 80) {
      analysis.recommendations.push('Consider breaking down complex components into smaller ones');
    }
    
    if (analysis.performance < 70) {
      analysis.recommendations.push('Optimize performance by using React.memo, useMemo, or useCallback');
    }
    
    if (analysis.security < 80) {
      analysis.recommendations.push('Review security practices and add input validation');
    }

    return analysis;
  }

  static calculateComplexity(code) {
    const lines = code.split('\n').length;
    const functions = (code.match(/function\s+\w+|const\s+\w+\s*=\s*\(/g) || []).length;
    const conditions = (code.match(/if\s*\(|switch\s*\(|case\s+/g) || []).length;
    const loops = (code.match(/for\s*\(|while\s*\(|forEach/g) || []).length;
    
    return Math.min(100, (lines * 0.1) + (functions * 5) + (conditions * 3) + (loops * 4));
  }

  static assessMaintainability(code) {
    let score = 100;
    
    // Deduct for poor practices
    if (code.includes('console.log')) score -= 10;
    if (code.includes('TODO') || code.includes('FIXME')) score -= 5;
    if (code.includes('var ')) score -= 15;
    
    // Add for good practices
    if (code.includes('//') || code.includes('/*')) score += 10;
    if (code.includes('const ') || code.includes('let ')) score += 10;
    if (code.includes('export ')) score += 10;
    
    return Math.max(0, Math.min(100, score));
  }

  static assessPerformance(code) {
    let score = 100;
    
    // Check for performance issues
    if (code.includes('innerHTML')) score -= 20;
    if (code.includes('document.write')) score -= 30;
    if (code.includes('eval(')) score -= 40;
    
    // Check for performance optimizations
    if (code.includes('React.memo')) score += 15;
    if (code.includes('useMemo')) score += 10;
    if (code.includes('useCallback')) score += 10;
    if (code.includes('lazy')) score += 10;
    
    return Math.max(0, Math.min(100, score));
  }

  static assessSecurity(code) {
    let score = 100;
    
    // Check for security issues
    if (code.includes('innerHTML')) score -= 20;
    if (code.includes('eval(')) score -= 40;
    if (code.includes('document.write')) score -= 30;
    if (code.includes('dangerouslySetInnerHTML')) score -= 25;
    
    // Check for security best practices
    if (code.includes('sanitize')) score += 15;
    if (code.includes('escape')) score += 10;
    if (code.includes('https://')) score += 10;
    if (code.includes('Content-Security-Policy')) score += 15;
    
    return Math.max(0, Math.min(100, score));
  }

  static assessAccessibility(code) {
    let score = 0;
    
    // Check for accessibility features
    if (code.includes('aria-')) score += 20;
    if (code.includes('role=')) score += 15;
    if (code.includes('alt=')) score += 10;
    if (code.includes('tabIndex')) score += 10;
    if (code.includes('onKeyDown') || code.includes('onKeyUp')) score += 10;
    if (code.includes('label')) score += 10;
    if (code.includes('title=')) score += 5;
    
    return Math.min(100, score);
  }
}

export class ProjectOptimizer {
  static optimizeProject(projectFiles) {
    const optimized = {};
    
    for (const [filePath, content] of Object.entries(projectFiles)) {
      optimized[filePath] = this.optimizeFile(content, filePath);
    }
    
    return optimized;
  }

  static optimizeFile(content, filePath) {
    if (filePath.endsWith('.js') || filePath.endsWith('.jsx') || filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
      return this.optimizeJavaScript(content);
    } else if (filePath.endsWith('.css')) {
      return this.optimizeCSS(content);
    } else if (filePath.endsWith('.html')) {
      return this.optimizeHTML(content);
    }
    
    return content;
  }

  static optimizeJavaScript(code) {
    // Remove console.logs in production
    let optimized = code.replace(/console\.log\([^)]*\);?\s*/g, '');
    
    // Remove empty lines
    optimized = optimized.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    // Add performance optimizations
    if (optimized.includes('React') && !optimized.includes('React.memo')) {
      // Suggest React.memo for functional components
      optimized = optimized.replace(
        /const\s+(\w+)\s*=\s*\([^)]*\)\s*=>\s*{/g,
        'const $1 = React.memo((props) => {'
      );
    }
    
    return optimized;
  }

  static optimizeCSS(css) {
    // Remove unnecessary whitespace
    let optimized = css.replace(/\s+/g, ' ');
    
    // Remove empty rules
    optimized = optimized.replace(/[^{}]+{\s*}/g, '');
    
    // Combine similar selectors
    optimized = optimized.replace(/([^{}]+)\s*{\s*([^}]+)\s*}\s*\1\s*{\s*([^}]+)\s*}/g, '$1 { $2 $3 }');
    
    return optimized.trim();
  }

  static optimizeHTML(html) {
    // Remove unnecessary whitespace
    let optimized = html.replace(/\s+/g, ' ');
    
    // Remove empty attributes
    optimized = optimized.replace(/\s+\w+=""/g, '');
    
    // Minify inline styles
    optimized = optimized.replace(/style="([^"]*)"/g, (match, styles) => {
      const minified = styles.replace(/\s+/g, ' ').trim();
      return `style="${minified}"`;
    });
    
    return optimized.trim();
  }
}

// Export instances
export const advancedCodeGenerator = new AdvancedCodeGenerator();
