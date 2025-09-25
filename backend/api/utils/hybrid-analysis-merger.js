/**
 * Hybrid Analysis Result Merger
 * Combines CV analysis results with LLM analysis for enhanced accuracy
 */

export class HybridAnalysisMerger {
  constructor() {
    this.confidenceWeights = {
      cv: 0.4,
      llm: 0.6
    };
  }

  /**
   * Main function to merge CV and LLM analysis results
   * @param {Object} cvAnalysis - Computer vision analysis results
   * @param {Object} llmAnalysis - LLM analysis results 
   * @param {Object} options - Merge options and preferences
   * @returns {Object} - Enhanced merged analysis
   */
  async mergeAnalysisResults(cvAnalysis, llmAnalysis, options = {}) {
    console.log('Starting hybrid analysis merge...');
    
    try {
      // Extract key data from both analyses
      const cvData = this.extractCVData(cvAnalysis);
      const llmData = this.extractLLMData(llmAnalysis);
      
      // Perform cross-validation and enhancement
      const mergedElements = await this.mergeElementDetection(cvData.elements, llmData.components);
      const mergedLayout = await this.mergeLayoutAnalysis(cvData.layout, llmData.layout);
      const mergedColors = await this.mergeColorAnalysis(cvData.colors, llmData.colors);
      const mergedText = await this.mergeTextAnalysis(cvData.text, llmData.text);
      const mergedInsights = await this.generateMergedInsights(cvData, llmData, mergedElements);
      
      // Calculate enhanced confidence scores
      const confidenceMetrics = this.calculateEnhancedConfidence(cvAnalysis, llmAnalysis, {
        elements: mergedElements,
        layout: mergedLayout,
        colors: mergedColors,
        text: mergedText
      });
      
      const result = {
        source: 'hybrid-analysis',
        timestamp: new Date().toISOString(),
        confidence: confidenceMetrics,
        elements: mergedElements,
        layout: mergedLayout,
        colors: mergedColors,
        text: mergedText,
        insights: mergedInsights,
        validation: await this.crossValidateResults(cvData, llmData, mergedElements),
        recommendations: await this.generateRecommendations(mergedElements, mergedLayout),
        codeGeneration: await this.enhanceCodeGenerationData(mergedElements, mergedLayout, mergedColors),
        metadata: {
          cvConfidence: cvAnalysis.confidence || 0,
          llmConfidence: llmAnalysis.confidence || 0,
          elementsFromCV: cvData.elements.length,
          elementsFromLLM: llmData.components.length,
          mergedElements: mergedElements.length,
          processingTime: Date.now()
        }
      };
      
      console.log('Hybrid analysis merge completed:', {
        confidence: result.confidence.overall,
        elements: result.elements.length,
        validation: result.validation.isValid
      });
      
      return result;
    } catch (error) {
      console.error('Hybrid analysis merge error:', error);
      return this.getEmptyMergedResult(error);
    }
  }

  /**
   * Extract and normalize CV analysis data
   */
  extractCVData(cvAnalysis) {
    return {
      elements: cvAnalysis.elements || [],
      layout: cvAnalysis.layout || { structure: 'unknown' },
      colors: cvAnalysis.colors || [],
      text: cvAnalysis.text || { blocks: [] },
      confidence: cvAnalysis.confidence || 0,
      wireframe: cvAnalysis.wireframe || { components: [] }
    };
  }

  /**
   * Extract and normalize LLM analysis data
   */
  extractLLMData(llmAnalysis) {
    return {
      components: this.parseLLMComponents(llmAnalysis),
      layout: this.parseLLMLayout(llmAnalysis),
      colors: this.parseLLMColors(llmAnalysis),
      text: this.parseLLMText(llmAnalysis),
      themes: this.parseLLMThemes(llmAnalysis),
      confidence: llmAnalysis.confidence || 0.7 // Default LLM confidence
    };
  }

  /**
   * Parse LLM components from analysis text
   */
  parseLLMComponents(llmAnalysis) {
    const components = [];
    const analysisText = llmAnalysis.analysis || llmAnalysis.toString();
    
    // Extract components mentioned in LLM analysis
    const componentPatterns = [
      /button[s]?/gi,
      /input[s]?/gi,
      /form[s]?/gi,
      /header[s]?/gi,
      /navigation/gi,
      /card[s]?/gi,
      /container[s]?/gi,
      /sidebar[s]?/gi,
      /footer[s]?/gi,
      /image[s]?/gi,
      /icon[s]?/gi,
      /menu[s]?/gi
    ];
    
    componentPatterns.forEach((pattern, index) => {
      const matches = analysisText.match(pattern);
      if (matches) {
        components.push({
          type: pattern.source.replace(/[^a-z]/gi, ''),
          confidence: 0.7,
          source: 'llm',
          mentions: matches.length,
          priority: this.calculateLLMComponentPriority(matches.length, analysisText)
        });
      }
    });
    
    return components;
  }

  /**
   * Parse layout information from LLM analysis
   */
  parseLLMLayout(llmAnalysis) {
    const analysisText = llmAnalysis.analysis || llmAnalysis.toString();
    
    const layoutKeywords = {
      grid: /grid|column[s]?|row[s]?/gi,
      flexbox: /flex|flexible/gi,
      responsive: /responsive|mobile|desktop/gi,
      centered: /center|centered/gi,
      sidebar: /sidebar|side.*nav/gi,
      header: /header|top.*nav/gi,
      footer: /footer|bottom/gi
    };
    
    const detectedPatterns = {};
    for (const [key, pattern] of Object.entries(layoutKeywords)) {
      const matches = analysisText.match(pattern);
      detectedPatterns[key] = matches ? matches.length : 0;
    }
    
    return {
      structure: this.inferLayoutStructure(detectedPatterns),
      patterns: detectedPatterns,
      confidence: Math.min(Object.values(detectedPatterns).reduce((a, b) => a + b, 0) / 10, 1)
    };
  }

  /**
   * Parse color information from LLM analysis
   */
  parseLLMColors(llmAnalysis) {
    const analysisText = llmAnalysis.analysis || llmAnalysis.toString();
    const colors = [];
    
    // Extract hex colors
    const hexMatches = analysisText.match(/#[0-9A-Fa-f]{6}/g) || [];
    hexMatches.forEach(hex => {
      colors.push({
        hex: hex.toLowerCase(),
        source: 'llm',
        confidence: 0.8,
        usage: this.inferColorUsage(hex, analysisText)
      });
    });
    
    // Extract named colors
    const colorNames = [
      'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink',
      'black', 'white', 'gray', 'grey', 'brown', 'cyan', 'magenta'
    ];
    
    colorNames.forEach(colorName => {
      const matches = analysisText.match(new RegExp(colorName, 'gi'));
      if (matches) {
        colors.push({
          name: colorName,
          hex: this.namedColorToHex(colorName),
          source: 'llm',
          confidence: 0.6,
          mentions: matches.length
        });
      }
    });
    
    return colors;
  }

  /**
   * Parse text information from LLM analysis
   */
  parseLLMText(llmAnalysis) {
    const analysisText = llmAnalysis.analysis || llmAnalysis.toString();
    
    // Extract typography mentions
    const typographyPatterns = {
      headings: /h[1-6]|heading[s]?|title[s]?/gi,
      paragraphs: /paragraph[s]?|text|content/gi,
      labels: /label[s]?/gi,
      links: /link[s]?|anchor[s]?/gi
    };
    
    const textElements = {};
    for (const [key, pattern] of Object.entries(typographyPatterns)) {
      const matches = analysisText.match(pattern);
      textElements[key] = matches ? matches.length : 0;
    }
    
    return {
      elements: textElements,
      confidence: Math.min(Object.values(textElements).reduce((a, b) => a + b, 0) / 10, 1)
    };
  }

  /**
   * Parse theme information from LLM analysis
   */
  parseLLMThemes(llmAnalysis) {
    const analysisText = llmAnalysis.analysis || llmAnalysis.toString();
    
    const themes = {
      modern: /modern|contemporary|clean|minimal/gi,
      corporate: /corporate|business|professional/gi,
      creative: /creative|artist|design/gi,
      dark: /dark.*mode|dark.*theme|night/gi,
      light: /light.*mode|light.*theme|bright/gi
    };
    
    const detectedThemes = {};
    for (const [theme, pattern] of Object.entries(themes)) {
      const matches = analysisText.match(pattern);
      detectedThemes[theme] = matches ? matches.length : 0;
    }
    
    return detectedThemes;
  }

  /**
   * Merge element detection from CV and LLM
   */
  async mergeElementDetection(cvElements, llmComponents) {
    const mergedElements = [];
    const processedCVElements = new Set();
    
    // Step 1: Match CV elements with LLM components
    for (const cvElement of cvElements) {
      const matchingLLMComponent = this.findMatchingLLMComponent(cvElement, llmComponents);
      
      if (matchingLLMComponent) {
        // Merge matched elements
        const mergedElement = this.mergeCVElementWithLLMComponent(cvElement, matchingLLMComponent);
        mergedElements.push(mergedElement);
        processedCVElements.add(cvElement);
      }
    }
    
    // Step 2: Add unmatched CV elements with lower confidence
    for (const cvElement of cvElements) {
      if (!processedCVElements.has(cvElement)) {
        mergedElements.push({
          ...cvElement,
          source: 'cv-only',
          confidence: cvElement.confidence * 0.8, // Reduce confidence for unmatched
          validation: { llmValidated: false }
        });
      }
    }
    
    // Step 3: Add high-confidence LLM components that weren't matched
    for (const llmComponent of llmComponents) {
      if (llmComponent.confidence > 0.8) {
        const hasMatch = mergedElements.some(el => 
          el.llmComponent && el.llmComponent.type === llmComponent.type
        );
        
        if (!hasMatch) {
          mergedElements.push({
            type: llmComponent.type,
            bounds: this.estimateBoundsFromLLM(llmComponent),
            source: 'llm-only',
            confidence: llmComponent.confidence * 0.7, // Reduce confidence for estimated bounds
            llmComponent,
            validation: { cvValidated: false }
          });
        }
      }
    }
    
    // Step 4: Sort by confidence and remove duplicates
    const sortedElements = mergedElements.sort((a, b) => b.confidence - a.confidence);
    return this.removeDuplicateElements(sortedElements);
  }

  /**
   * Find matching LLM component for CV element
   */
  findMatchingLLMComponent(cvElement, llmComponents) {
    const elementTypeMapping = {
      'button': ['button', 'buttons'],
      'input-field': ['input', 'inputs', 'form'],
      'text-region': ['text', 'paragraph', 'content'],
      'text-heading': ['header', 'heading', 'title'],
      'container': ['container', 'card', 'div'],
      'circular-element': ['icon', 'image', 'avatar']
    };
    
    const possibleTypes = elementTypeMapping[cvElement.type] || [cvElement.type];
    
    return llmComponents.find(component => 
      possibleTypes.some(type => 
        component.type.toLowerCase().includes(type.toLowerCase())
      )
    );
  }

  /**
   * Merge CV element with LLM component
   */
  mergeCVElementWithLLMComponent(cvElement, llmComponent) {
    const confidence = this.calculateMergedConfidence(cvElement.confidence, llmComponent.confidence);
    
    return {
      ...cvElement,
      llmComponent,
      source: 'hybrid',
      confidence,
      enhancedType: this.determineEnhancedElementType(cvElement, llmComponent),
      semanticRole: this.inferSemanticRole(cvElement, llmComponent),
      validation: {
        cvValidated: true,
        llmValidated: true,
        crossValidated: true
      },
      properties: {
        ...cvElement.properties,
        llmInsights: this.extractLLMInsights(llmComponent)
      }
    };
  }

  /**
   * Merge layout analysis from CV and LLM
   */
  async mergeLayoutAnalysis(cvLayout, llmLayout) {
    return {
      structure: this.selectBestLayoutStructure(cvLayout.structure, llmLayout.structure),
      grid: {
        ...cvLayout.grid,
        confidence: Math.max(cvLayout.grid?.confidence || 0, llmLayout.confidence)
      },
      patterns: {
        cv: cvLayout,
        llm: llmLayout.patterns
      },
      semantic: this.mergeSemanticLayout(cvLayout, llmLayout),
      confidence: this.calculateMergedConfidence(
        cvLayout.confidence || 0,
        llmLayout.confidence || 0
      )
    };
  }

  /**
   * Merge color analysis from CV and LLM
   */
  async mergeColorAnalysis(cvColors, llmColors) {
    const mergedColors = [];
    const processedCVColors = new Set();
    
    // Match CV colors with LLM colors
    for (const cvColor of cvColors) {
      const matchingLLMColor = llmColors.find(llmColor => 
        llmColor.hex && this.colorsAreSimilar(cvColor.hex, llmColor.hex)
      );
      
      if (matchingLLMColor) {
        mergedColors.push({
          ...cvColor,
          llmValidated: true,
          usage: matchingLLMColor.usage || cvColor.usage,
          confidence: this.calculateMergedConfidence(0.8, matchingLLMColor.confidence)
        });
        processedCVColors.add(cvColor);
      }
    }
    
    // Add unmatched CV colors
    for (const cvColor of cvColors) {
      if (!processedCVColors.has(cvColor)) {
        mergedColors.push({
          ...cvColor,
          llmValidated: false,
          confidence: cvColor.confidence * 0.9
        });
      }
    }
    
    // Add high-confidence LLM colors
    for (const llmColor of llmColors) {
      if (llmColor.confidence > 0.7 && llmColor.hex) {
        const alreadyIncluded = mergedColors.some(color => 
          this.colorsAreSimilar(color.hex, llmColor.hex)
        );
        
        if (!alreadyIncluded) {
          mergedColors.push({
            ...llmColor,
            cvValidated: false,
            source: 'llm'
          });
        }
      }
    }
    
    return mergedColors.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Merge text analysis from CV and LLM
   */
  async mergeTextAnalysis(cvText, llmText) {
    return {
      extractedText: cvText.fullText || '',
      confidence: Math.max(cvText.confidence || 0, llmText.confidence || 0),
      blocks: cvText.blocks || [],
      elements: {
        cv: cvText,
        llm: llmText.elements
      },
      validation: {
        ocrQuality: cvText.confidence || 0,
        llmRecognition: llmText.confidence || 0
      }
    };
  }

  /**
   * Generate merged insights combining both analyses
   */
  async generateMergedInsights(cvData, llmData, mergedElements) {
    const insights = {
      accuracy: {
        elementDetection: this.calculateElementDetectionAccuracy(cvData.elements, llmData.components),
        layoutAnalysis: this.calculateLayoutAccuracy(cvData.layout, llmData.layout),
        colorExtraction: this.calculateColorAccuracy(cvData.colors, llmData.colors)
      },
      improvements: {
        cvEnhanced: mergedElements.filter(el => el.source === 'hybrid').length,
        llmValidated: mergedElements.filter(el => el.validation?.llmValidated).length,
        crossValidated: mergedElements.filter(el => el.validation?.crossValidated).length
      },
      recommendations: [
        ...this.generateCVRecommendations(cvData),
        ...this.generateLLMRecommendations(llmData)
      ],
      qualityMetrics: {
        precision: this.calculatePrecision(mergedElements),
        recall: this.calculateRecall(cvData.elements, mergedElements),
        f1Score: this.calculateF1Score(mergedElements)
      }
    };
    
    return insights;
  }

  /**
   * Cross-validate results between CV and LLM
   */
  async crossValidateResults(cvData, llmData, mergedElements) {
    const validation = {
      isValid: true,
      issues: [],
      warnings: [],
      confidence: 0
    };
    
    // Check element count consistency
    const elementCountDiff = Math.abs(cvData.elements.length - llmData.components.length);
    if (elementCountDiff > 5) {
      validation.warnings.push({
        type: 'element-count-mismatch',
        message: `Large difference in detected elements: CV(${cvData.elements.length}) vs LLM(${llmData.components.length})`,
        severity: 'medium'
      });
    }
    
    // Check layout consistency
    if (cvData.layout.structure !== 'unknown' && llmData.layout.structure !== cvData.layout.structure) {
      validation.warnings.push({
        type: 'layout-mismatch',
        message: `Layout structure mismatch: CV(${cvData.layout.structure}) vs LLM(${llmData.layout.structure})`,
        severity: 'low'
      });
    }
    
    // Check color consistency
    const colorOverlap = this.calculateColorOverlap(cvData.colors, llmData.colors);
    if (colorOverlap < 0.3) {
      validation.warnings.push({
        type: 'color-mismatch',
        message: `Low color overlap between CV and LLM analysis: ${(colorOverlap * 100).toFixed(1)}%`,
        severity: 'medium'
      });
    }
    
    // Calculate overall validation confidence
    validation.confidence = Math.max(0, 1 - (validation.warnings.length * 0.1) - (validation.issues.length * 0.3));
    validation.isValid = validation.confidence > 0.5;
    
    return validation;
  }

  /**
   * Generate recommendations for code generation
   */
  async generateRecommendations(mergedElements, mergedLayout) {
    const recommendations = [];
    
    // Framework recommendations
    if (mergedElements.length > 10) {
      recommendations.push({
        type: 'framework',
        suggestion: 'Consider using a component-based framework like React for better organization',
        priority: 'medium'
      });
    }
    
    // Styling recommendations
    const hasComplexLayout = mergedLayout.structure === 'complex-grid';
    if (hasComplexLayout) {
      recommendations.push({
        type: 'styling',
        suggestion: 'Use CSS Grid or Flexbox for complex layouts',
        priority: 'high'
      });
    }
    
    // Responsive recommendations
    const hasMultipleElements = mergedElements.length > 5;
    if (hasMultipleElements) {
      recommendations.push({
        type: 'responsive',
        suggestion: 'Implement responsive design with mobile-first approach',
        priority: 'high'
      });
    }
    
    // Accessibility recommendations
    const hasInteractiveElements = mergedElements.some(el => 
      ['button', 'input-field'].includes(el.type)
    );
    if (hasInteractiveElements) {
      recommendations.push({
        type: 'accessibility',
        suggestion: 'Add proper ARIA labels and keyboard navigation support',
        priority: 'high'
      });
    }
    
    return recommendations;
  }

  /**
   * Enhance code generation data with merged insights
   */
  async enhanceCodeGenerationData(mergedElements, mergedLayout, mergedColors) {
    return {
      components: mergedElements.map(element => ({
        id: `component-${Math.random().toString(36).substr(2, 9)}`,
        type: element.enhancedType || element.type,
        bounds: element.bounds,
        semanticRole: element.semanticRole,
        htmlTag: this.mapElementToHTMLTag(element),
        cssClasses: this.generateEnhancedCSSClasses(element),
        properties: this.generateComponentProperties(element),
        confidence: element.confidence
      })),
      layout: {
        structure: mergedLayout.structure,
        grid: mergedLayout.grid,
        semantic: mergedLayout.semantic
      },
      colors: mergedColors.map(color => ({
        ...color,
        cssVariable: this.generateCSSVariable(color),
        usage: color.usage || 'accent'
      })),
      metadata: {
        complexity: this.calculateComplexity(mergedElements, mergedLayout),
        estimatedDevelopmentTime: this.estimateDevelopmentTime(mergedElements),
        recommendedFramework: this.suggestFramework(mergedElements, mergedLayout)
      }
    };
  }

  // Helper methods

  calculateLLMComponentPriority(mentions, analysisText) {
    const basePriority = Math.min(mentions / 3, 1);
    const contextBonus = analysisText.includes('important') ? 0.2 : 0;
    return Math.min(basePriority + contextBonus, 1);
  }

  inferLayoutStructure(patterns) {
    const scores = {
      grid: patterns.grid * 0.4,
      flexbox: patterns.flexbox * 0.3,
      sidebar: patterns.sidebar * 0.2,
      header: patterns.header * 0.1
    };
    
    const maxScore = Math.max(...Object.values(scores));
    if (maxScore === 0) return 'simple';
    
    return Object.keys(scores).find(key => scores[key] === maxScore) + '-layout';
  }

  inferColorUsage(hex, analysisText) {
    const usagePatterns = {
      background: /background|bg/gi,
      text: /text|font|color/gi,
      button: /button|cta|action/gi,
      accent: /accent|highlight|primary/gi
    };
    
    for (const [usage, pattern] of Object.entries(usagePatterns)) {
      if (analysisText.match(pattern)) {
        return usage;
      }
    }
    
    return 'unknown';
  }

  namedColorToHex(colorName) {
    const colorMap = {
      red: '#ff0000',
      blue: '#0000ff',
      green: '#008000',
      yellow: '#ffff00',
      orange: '#ffa500',
      purple: '#800080',
      pink: '#ffc0cb',
      black: '#000000',
      white: '#ffffff',
      gray: '#808080',
      grey: '#808080',
      brown: '#a52a2a',
      cyan: '#00ffff',
      magenta: '#ff00ff'
    };
    
    return colorMap[colorName.toLowerCase()] || '#000000';
  }

  calculateMergedConfidence(cvConfidence, llmConfidence) {
    return (cvConfidence * this.confidenceWeights.cv) + 
           (llmConfidence * this.confidenceWeights.llm);
  }

  determineEnhancedElementType(cvElement, llmComponent) {
    const cvType = cvElement.type || 'unknown';
    const llmType = llmComponent.type || 'unknown';
    
    // Priority mapping for type resolution
    const typePriority = {
      'button': 5,
      'input-field': 5,
      'text-heading': 4,
      'container': 3,
      'text-region': 2,
      'unknown': 1
    };
    
    const cvPriority = typePriority[cvType] || 1;
    const llmPriority = typePriority[llmType] || 1;
    
    return cvPriority >= llmPriority ? cvType : llmType;
  }

  inferSemanticRole(cvElement, llmComponent) {
    const typeRoleMap = {
      'button': 'interactive',
      'input-field': 'form-control',
      'text-heading': 'heading',
      'text-region': 'content',
      'container': 'layout',
      'circular-element': 'media'
    };
    
    return typeRoleMap[cvElement.type] || 'content';
  }

  extractLLMInsights(llmComponent) {
    return {
      mentions: llmComponent.mentions || 1,
      priority: llmComponent.priority || 0.5,
      context: llmComponent.context || 'unknown'
    };
  }

  selectBestLayoutStructure(cvStructure, llmStructure) {
    if (cvStructure === 'unknown') return llmStructure;
    if (llmStructure === 'unknown') return cvStructure;
    
    // Prefer more specific structures
    const specificity = {
      'complex-grid': 5,
      'multi-column': 4,
      'multi-row': 3,
      'simple': 2,
      'unknown': 1
    };
    
    const cvScore = specificity[cvStructure] || 1;
    const llmScore = specificity[llmStructure] || 1;
    
    return cvScore >= llmScore ? cvStructure : llmStructure;
  }

  mergeSemanticLayout(cvLayout, llmLayout) {
    return {
      hasHeader: (cvLayout.semantic?.header?.length > 0) || (llmLayout.patterns?.header > 0),
      hasSidebar: (cvLayout.semantic?.sidebar?.length > 0) || (llmLayout.patterns?.sidebar > 0),
      hasFooter: (cvLayout.semantic?.footer?.length > 0) || (llmLayout.patterns?.footer > 0),
      isResponsive: llmLayout.patterns?.responsive > 0
    };
  }

  colorsAreSimilar(hex1, hex2, threshold = 30) {
    const rgb1 = this.hexToRgb(hex1);
    const rgb2 = this.hexToRgb(hex2);
    
    if (!rgb1 || !rgb2) return false;
    
    const distance = Math.sqrt(
      Math.pow(rgb1.r - rgb2.r, 2) +
      Math.pow(rgb1.g - rgb2.g, 2) +
      Math.pow(rgb1.b - rgb2.b, 2)
    );
    
    return distance < threshold;
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  calculateElementDetectionAccuracy(cvElements, llmComponents) {
    const matched = Math.min(cvElements.length, llmComponents.length);
    const total = Math.max(cvElements.length, llmComponents.length);
    return total > 0 ? matched / total : 0;
  }

  calculateLayoutAccuracy(cvLayout, llmLayout) {
    return cvLayout.structure === llmLayout.structure ? 1 : 0.5;
  }

  calculateColorAccuracy(cvColors, llmColors) {
    return this.calculateColorOverlap(cvColors, llmColors);
  }

  calculateColorOverlap(cvColors, llmColors) {
    if (!cvColors.length || !llmColors.length) return 0;
    
    let overlaps = 0;
    for (const cvColor of cvColors) {
      const hasMatch = llmColors.some(llmColor => 
        llmColor.hex && this.colorsAreSimilar(cvColor.hex, llmColor.hex)
      );
      if (hasMatch) overlaps++;
    }
    
    return overlaps / Math.max(cvColors.length, llmColors.length);
  }

  generateCVRecommendations(cvData) {
    const recommendations = [];
    
    if (cvData.confidence < 0.5) {
      recommendations.push({
        type: 'cv-quality',
        message: 'CV analysis confidence is low, consider image preprocessing',
        priority: 'medium'
      });
    }
    
    return recommendations;
  }

  generateLLMRecommendations(llmData) {
    const recommendations = [];
    
    if (llmData.components.length === 0) {
      recommendations.push({
        type: 'llm-analysis',
        message: 'LLM did not detect UI components, review analysis prompt',
        priority: 'high'
      });
    }
    
    return recommendations;
  }

  calculatePrecision(mergedElements) {
    const validated = mergedElements.filter(el => el.validation?.crossValidated).length;
    return mergedElements.length > 0 ? validated / mergedElements.length : 0;
  }

  calculateRecall(originalElements, mergedElements) {
    return originalElements.length > 0 ? mergedElements.length / originalElements.length : 0;
  }

  calculateF1Score(mergedElements) {
    const precision = this.calculatePrecision(mergedElements);
    const recall = 0.8; // Simplified recall calculation
    
    return precision + recall > 0 ? 2 * (precision * recall) / (precision + recall) : 0;
  }

  calculateEnhancedConfidence(cvAnalysis, llmAnalysis, mergedData) {
    const overall = (cvAnalysis.confidence * 0.4) + (0.7 * 0.6); // Default LLM confidence
    
    return {
      overall: Math.min(overall, 1),
      elementDetection: this.calculateElementConfidence(mergedData.elements),
      layoutAnalysis: mergedData.layout.confidence || 0.7,
      colorExtraction: this.calculateColorConfidence(mergedData.colors),
      crossValidation: this.calculateCrossValidationConfidence(mergedData.elements)
    };
  }

  calculateElementConfidence(elements) {
    if (!elements.length) return 0;
    
    const avgConfidence = elements.reduce((sum, el) => sum + el.confidence, 0) / elements.length;
    const validatedCount = elements.filter(el => el.validation?.crossValidated).length;
    const validationBonus = validatedCount / elements.length * 0.2;
    
    return Math.min(avgConfidence + validationBonus, 1);
  }

  calculateColorConfidence(colors) {
    if (!colors.length) return 0;
    
    const avgConfidence = colors.reduce((sum, color) => sum + (color.confidence || 0.5), 0) / colors.length;
    const validatedCount = colors.filter(color => color.llmValidated).length;
    const validationBonus = validatedCount / colors.length * 0.1;
    
    return Math.min(avgConfidence + validationBonus, 1);
  }

  calculateCrossValidationConfidence(elements) {
    const crossValidated = elements.filter(el => el.validation?.crossValidated).length;
    return elements.length > 0 ? crossValidated / elements.length : 0;
  }

  estimateBoundsFromLLM(llmComponent) {
    // Estimated bounds for LLM-only components
    return {
      x: 50,
      y: 50,
      width: 200,
      height: 40
    };
  }

  removeDuplicateElements(elements) {
    const unique = [];
    
    for (const element of elements) {
      const isDuplicate = unique.some(existing => {
        if (!element.bounds || !existing.bounds) return false;
        
        const overlap = this.calculateBoundingBoxOverlap(element.bounds, existing.bounds);
        return overlap > 0.7;
      });
      
      if (!isDuplicate) {
        unique.push(element);
      }
    }
    
    return unique;
  }

  calculateBoundingBoxOverlap(bounds1, bounds2) {
    const x1 = Math.max(bounds1.x, bounds2.x);
    const y1 = Math.max(bounds1.y, bounds2.y);
    const x2 = Math.min(bounds1.x + bounds1.width, bounds2.x + bounds2.width);
    const y2 = Math.min(bounds1.y + bounds1.height, bounds2.y + bounds2.height);
    
    if (x2 <= x1 || y2 <= y1) return 0;
    
    const overlap = (x2 - x1) * (y2 - y1);
    const area1 = bounds1.width * bounds1.height;
    const area2 = bounds2.width * bounds2.height;
    
    return overlap / Math.min(area1, area2);
  }

  mapElementToHTMLTag(element) {
    const tagMap = {
      'button': 'button',
      'input-field': 'input',
      'text-heading': 'h2',
      'text-region': 'p',
      'container': 'div',
      'circular-element': 'img'
    };
    
    return tagMap[element.type] || 'div';
  }

  generateEnhancedCSSClasses(element) {
    const classes = [`ui-${element.type}`];
    
    if (element.semanticRole) {
      classes.push(`role-${element.semanticRole}`);
    }
    
    if (element.source === 'hybrid') {
      classes.push('cv-llm-validated');
    }
    
    return classes;
  }

  generateComponentProperties(element) {
    const properties = {};
    
    if (element.type === 'button') {
      properties.type = 'button';
      properties.role = 'button';
    }
    
    if (element.type === 'input-field') {
      properties.type = 'text';
      properties.placeholder = 'Enter text...';
    }
    
    if (element.bounds) {
      properties.style = {
        width: `${element.bounds.width}px`,
        height: `${element.bounds.height}px`
      };
    }
    
    return properties;
  }

  generateCSSVariable(color) {
    const usage = color.usage || 'accent';
    return `--color-${usage}-${Math.random().toString(36).substr(2, 4)}`;
  }

  calculateComplexity(elements, layout) {
    let complexity = 0;
    
    complexity += elements.length * 0.1;
    complexity += (layout.grid?.columns || 1) * 0.2;
    complexity += (layout.grid?.rows || 1) * 0.15;
    
    if (layout.structure === 'complex-grid') complexity += 0.5;
    
    return Math.min(complexity, 1);
  }

  estimateDevelopmentTime(elements) {
    const baseTime = 2; // 2 hours base
    const elementTime = elements.length * 0.5; // 30 minutes per element
    
    return Math.round(baseTime + elementTime);
  }

  suggestFramework(elements, layout) {
    if (elements.length > 10) return 'React';
    if (layout.structure === 'complex-grid') return 'Vue';
    return 'Vanilla';
  }

  getEmptyMergedResult(error) {
    return {
      source: 'hybrid-analysis',
      timestamp: new Date().toISOString(),
      confidence: { overall: 0 },
      elements: [],
      layout: { structure: 'unknown' },
      colors: [],
      text: { extractedText: '', blocks: [] },
      insights: { accuracy: {}, improvements: {}, recommendations: [] },
      validation: { isValid: false, issues: [{ type: 'merge-error', message: error?.message || 'Unknown error' }] },
      recommendations: [],
      codeGeneration: { components: [], layout: {}, colors: [] },
      metadata: { error: error?.message }
    };
  }
}

export default HybridAnalysisMerger;