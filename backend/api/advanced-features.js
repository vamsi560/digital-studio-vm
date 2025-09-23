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
    // Strategy 2: Step-by-step generation
    const steps = [
      this.generateArchitecture(images, options),
      this.generateComponents(images, options),
      this.generateStyling(images, options),
      this.generateLogic(images, options)
    ];

    const results = await Promise.all(steps);
    const combinedCode = this.combineStepResults(results);
    
    return {
      code: combinedCode,
      strategy: 'step-by-step',
      quality: this.assessCodeQuality(combinedCode)
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

  combineStepResults(results) {
    // Combine architecture, components, styling, and logic into a complete project
    const [architecture, components, styling, logic] = results;
    
    return {
      'src/App.jsx': components,
      'src/App.css': this.generateAppCSS(styling),
      'src/index.css': this.generateGlobalCSS(styling),
      'src/utils/logic.js': logic,
      'src/architecture.json': JSON.stringify(architecture, null, 2)
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

  generateAppCSS(styling) {
    const baseAppCSS = `/* App Component Styles - src/App.css */

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
}`;

    if (typeof styling === 'string' && styling.includes('Tailwind')) {
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
}`;
    }

    return baseAppCSS;
  }

  generateGlobalCSS(styling) {
    const baseGlobalCSS = `/* Global Styles - src/index.css */

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
}`;

    if (typeof styling === 'string' && styling.includes('Tailwind')) {
      return `@tailwind base;
@tailwind components;
@tailwind utilities;

${baseGlobalCSS}`;
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
