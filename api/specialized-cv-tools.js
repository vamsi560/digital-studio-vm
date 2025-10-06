/**
 * Specialized Computer Vision Tools
 * Microsoft Sketch2Code inspired analysis and Pix2Code approach
 */

import { CVAnalysis } from './utils/cv-analysis.js';

export class SpecializedCVTools {
  constructor() {
    this.cvAnalysis = new CVAnalysis();
  }

  /**
   * Main analysis function combining Microsoft Sketch2Code and Pix2Code approaches
   * @param {Array} images - Array of image buffers with metadata
   * @returns {Object} - Comprehensive CV analysis results
   */
  async analyzeWithSpecializedCV(images) {
    console.log('Starting specialized CV analysis...');
    
    try {
      const analysisResults = await Promise.all(
        images.map((image, index) => this.analyzeIndividualImage(image, index))
      );

      // Merge results from multiple images
      const mergedResults = this.mergeMultipleImageAnalysis(analysisResults);
      
      console.log('Specialized CV analysis completed:', {
        imagesAnalyzed: images.length,
        totalElements: mergedResults.elements.length,
        overallConfidence: mergedResults.confidence
      });

      return mergedResults;
    } catch (error) {
      console.error('Specialized CV analysis error:', error);
      return this.getEmptyAnalysisResult();
    }
  }

  /**
   * Analyze individual image using Sketch2Code methodology
   * @param {Object} image - Image object with buffer and metadata
   * @param {number} index - Image index
   * @returns {Object} - Analysis result for single image
   */
  async analyzeIndividualImage(image, index) {
    try {
      const imageBuffer = Buffer.from(image.data, 'base64');
      
      // Stage 1: Basic CV preprocessing
      const cvResult = await this.cvAnalysis.preprocessImage(imageBuffer);
      
      // Stage 2: Sketch2Code style classification
      const sketch2CodeResult = await this.runSketch2CodeAnalysis(imageBuffer, cvResult);
      
      // Stage 3: Pix2Code style element detection
      const pix2CodeResult = await this.runPix2CodeAnalysis(imageBuffer, cvResult);
      
      // Stage 4: Enhanced element classification
      const classifiedElements = await this.classifyAndEnhanceElements(
        cvResult.elements, 
        sketch2CodeResult, 
        pix2CodeResult,
        cvResult.text
      );

      return {
        imageIndex: index,
        originalImage: image,
        cvAnalysis: cvResult,
        sketch2Code: sketch2CodeResult,
        pix2Code: pix2CodeResult,
        elements: classifiedElements,
        layout: this.enhanceLayoutAnalysis(cvResult.layout, classifiedElements),
        wireframe: await this.generateWireframeData(classifiedElements, cvResult.layout),
        confidence: this.calculateOverallConfidence(cvResult, sketch2CodeResult, pix2CodeResult)
      };
    } catch (error) {
      console.error(`Error analyzing image ${index}:`, error);
      return this.getEmptyImageAnalysisResult(index, image);
    }
  }

  /**
   * Microsoft Sketch2Code inspired analysis
   * Focus on UI mockup and wireframe detection
   */
  async runSketch2CodeAnalysis(imageBuffer, cvResult) {
    try {
      const analysis = {
        wireframeElements: [],
        layoutStructure: 'unknown',
        navigationElements: [],
        contentBlocks: [],
        interactiveElements: [],
        confidence: 0
      };

      // Classify detected elements as wireframe components
      for (const element of cvResult.elements) {
        const wireframeType = this.classifyAsWireframeElement(element, cvResult.text);
        
        if (wireframeType) {
          analysis.wireframeElements.push({
            ...element,
            wireframeType,
            htmlTag: this.mapWireframeToHTML(wireframeType),
            cssClasses: this.generateCSSClasses(wireframeType, element),
            priority: this.calculateElementPriority(element, wireframeType)
          });
        }
      }

      // Detect layout patterns common in mockups
      analysis.layoutStructure = this.detectMockupLayoutPattern(cvResult.layout, analysis.wireframeElements);
      
      // Identify navigation patterns
      analysis.navigationElements = this.detectNavigationPatterns(analysis.wireframeElements);
      
      // Group content blocks
      analysis.contentBlocks = this.groupContentBlocks(analysis.wireframeElements);
      
      // Identify interactive elements
      analysis.interactiveElements = this.identifyInteractiveElements(analysis.wireframeElements);

      analysis.confidence = this.calculateSketch2CodeConfidence(analysis);

      return analysis;
    } catch (error) {
      console.error('Sketch2Code analysis error:', error);
      return {
        wireframeElements: [],
        layoutStructure: 'unknown',
        navigationElements: [],
        contentBlocks: [],
        interactiveElements: [],
        confidence: 0
      };
    }
  }

  /**
   * Pix2Code inspired analysis
   * Focus on precise element detection and positioning
   */
  async runPix2CodeAnalysis(imageBuffer, cvResult) {
    try {
      const analysis = {
        preciseElements: [],
        spatialRelationships: [],
        visualHierarchy: [],
        colorMapping: {},
        responsiveBreakpoints: [],
        confidence: 0
      };

      // Enhance element detection with precise positioning
      analysis.preciseElements = await this.enhancePreciseElementDetection(cvResult.elements, imageBuffer);
      
      // Analyze spatial relationships
      analysis.spatialRelationships = this.analyzeSpatialRelationships(analysis.preciseElements);
      
      // Build visual hierarchy
      analysis.visualHierarchy = this.buildVisualHierarchy(analysis.preciseElements, cvResult.text);
      
      // Map colors to semantic meaning
      analysis.colorMapping = this.mapColorsToSemantics(cvResult.colors, analysis.preciseElements);
      
      // Detect responsive breakpoints
      analysis.responsiveBreakpoints = this.detectResponsiveBreakpoints(cvResult.metadata, analysis.preciseElements);

      analysis.confidence = this.calculatePix2CodeConfidence(analysis);

      return analysis;
    } catch (error) {
      console.error('Pix2Code analysis error:', error);
      return {
        preciseElements: [],
        spatialRelationships: [],
        visualHierarchy: [],
        colorMapping: {},
        responsiveBreakpoints: [],
        confidence: 0
      };
    }
  }

  /**
   * Classify CV elements as wireframe components
   */
  classifyAsWireframeElement(element, textData) {
    const { type, bounds, properties } = element;
    const { width, height } = bounds;
    const aspectRatio = width / height;

    // Check if element contains text
    const hasText = this.elementContainsText(element, textData);
    
    // Classification logic based on Sketch2Code patterns
    if (type === 'button' || (aspectRatio > 1.5 && aspectRatio < 6 && height < 60)) {
      return hasText ? 'button' : 'placeholder-button';
    }
    
    if (type === 'input-field' || (aspectRatio > 2 && height < 50 && properties?.isEmpty)) {
      return 'input-field';
    }
    
    if (type === 'text-region' || type === 'text-block') {
      if (height < 30) return 'text-label';
      if (height > 100) return 'text-content';
      return 'text-heading';
    }
    
    if (type === 'container') {
      if (width > 300 && height > 200) return 'content-section';
      if (aspectRatio > 2) return 'horizontal-container';
      if (aspectRatio < 0.5) return 'vertical-container';
      return 'card-container';
    }
    
    if (type === 'circular-element') {
      if (width < 50) return 'icon-placeholder';
      return 'avatar-placeholder';
    }
    
    if (type === 'horizontal-separator') return 'divider';
    if (type === 'vertical-separator') return 'sidebar';
    
    return null;
  }

  /**
   * Map wireframe elements to HTML tags
   */
  mapWireframeToHTML(wireframeType) {
    const mapping = {
      'button': 'button',
      'placeholder-button': 'button',
      'input-field': 'input',
      'text-label': 'label',
      'text-heading': 'h2',
      'text-content': 'p',
      'content-section': 'section',
      'horizontal-container': 'div',
      'vertical-container': 'div',
      'card-container': 'div',
      'icon-placeholder': 'i',
      'avatar-placeholder': 'img',
      'divider': 'hr',
      'sidebar': 'aside'
    };
    
    return mapping[wireframeType] || 'div';
  }

  /**
   * Generate CSS classes for wireframe elements
   */
  generateCSSClasses(wireframeType, element) {
    const classes = [`ui-${wireframeType}`];
    
    // Add size-based classes
    const { width, height } = element.bounds;
    if (width > 400) classes.push('large-width');
    if (height > 200) classes.push('large-height');
    if (width < 100) classes.push('small-width');
    if (height < 50) classes.push('small-height');
    
    // Add position-based classes
    const { x, y } = element.bounds;
    if (x < 50) classes.push('left-aligned');
    if (y < 50) classes.push('top-aligned');
    
    return classes;
  }

  /**
   * Calculate element priority for rendering order
   */
  calculateElementPriority(element, wireframeType) {
    const priorityMap = {
      'text-heading': 10,
      'button': 9,
      'input-field': 8,
      'text-label': 7,
      'text-content': 6,
      'content-section': 5,
      'card-container': 4,
      'horizontal-container': 3,
      'vertical-container': 3,
      'icon-placeholder': 2,
      'divider': 1
    };
    
    const basePriority = priorityMap[wireframeType] || 5;
    const sizeFactor = (element.area / 10000) * 0.1; // Larger elements get slight priority boost
    const confidenceFactor = element.confidence * 0.2;
    
    return Math.min(10, basePriority + sizeFactor + confidenceFactor);
  }

  /**
   * Detect layout patterns common in mockups
   */
  detectMockupLayoutPattern(layout, wireframeElements) {
    if (!wireframeElements.length) return 'empty';
    
    // Analyze arrangement patterns
    const hasHeader = wireframeElements.some(el => 
      el.bounds.y < 100 && el.wireframeType.includes('heading')
    );
    
    const hasNavigation = wireframeElements.some(el => 
      el.wireframeType === 'sidebar' || el.bounds.x < 100
    );
    
    const hasCards = wireframeElements.filter(el => 
      el.wireframeType === 'card-container'
    ).length > 2;
    
    const hasGrid = layout.grid?.columns > 2;
    
    // Determine pattern
    if (hasNavigation && hasHeader) return 'dashboard-layout';
    if (hasCards && hasGrid) return 'card-grid-layout';
    if (hasHeader && layout.grid?.rows > 2) return 'content-layout';
    if (hasNavigation) return 'sidebar-layout';
    if (layout.grid?.columns > 2) return 'column-layout';
    
    return 'simple-layout';
  }

  /**
   * Detect navigation patterns
   */
  detectNavigationPatterns(wireframeElements) {
    const navElements = [];
    
    // Top navigation
    const topElements = wireframeElements.filter(el => 
      el.bounds.y < 80 && (el.wireframeType === 'button' || el.wireframeType.includes('text'))
    );
    
    if (topElements.length > 2) {
      navElements.push({
        type: 'top-navigation',
        elements: topElements,
        position: 'header'
      });
    }
    
    // Side navigation
    const sideElements = wireframeElements.filter(el => 
      el.bounds.x < 150 && el.wireframeType === 'sidebar'
    );
    
    if (sideElements.length > 0) {
      navElements.push({
        type: 'side-navigation',
        elements: sideElements,
        position: 'sidebar'
      });
    }
    
    return navElements;
  }

  /**
   * Group content blocks
   */
  groupContentBlocks(wireframeElements) {
    const contentBlocks = [];
    const processed = new Set();
    
    for (const element of wireframeElements) {
      if (processed.has(element) || !this.isContentElement(element)) continue;
      
      const block = {
        type: 'content-block',
        mainElement: element,
        relatedElements: [],
        bounds: element.bounds
      };
      
      // Find related elements nearby
      const nearby = wireframeElements.filter(other => 
        !processed.has(other) && 
        other !== element &&
        this.areElementsRelated(element, other)
      );
      
      block.relatedElements = nearby;
      nearby.forEach(el => processed.add(el));
      processed.add(element);
      
      // Update bounding box to include all elements
      if (nearby.length > 0) {
        const allBounds = [element.bounds, ...nearby.map(el => el.bounds)];
        block.bounds = this.calculateBoundingBox(allBounds);
      }
      
      contentBlocks.push(block);
    }
    
    return contentBlocks.sort((a, b) => a.bounds.y - b.bounds.y);
  }

  /**
   * Identify interactive elements
   */
  identifyInteractiveElements(wireframeElements) {
    return wireframeElements.filter(element => {
      const interactiveTypes = ['button', 'placeholder-button', 'input-field'];
      return interactiveTypes.includes(element.wireframeType);
    }).map(element => ({
      ...element,
      interactionType: this.determineInteractionType(element),
      eventHandlers: this.suggestEventHandlers(element)
    }));
  }

  /**
   * Enhance precise element detection
   */
  async enhancePreciseElementDetection(elements, imageBuffer) {
    return elements.map(element => ({
      ...element,
      precisePosition: this.refineBoundingBox(element.bounds),
      subPixelAlignment: this.calculateSubPixelAlignment(element.bounds),
      marginEstimate: this.estimateMargins(element),
      paddingEstimate: this.estimatePadding(element)
    }));
  }

  /**
   * Analyze spatial relationships between elements
   */
  analyzeSpatialRelationships(elements) {
    const relationships = [];
    
    for (let i = 0; i < elements.length; i++) {
      for (let j = i + 1; j < elements.length; j++) {
        const rel = this.calculateRelationship(elements[i], elements[j]);
        if (rel.strength > 0.3) {
          relationships.push(rel);
        }
      }
    }
    
    return relationships.sort((a, b) => b.strength - a.strength);
  }

  /**
   * Build visual hierarchy
   */
  buildVisualHierarchy(elements, textData) {
    const hierarchy = {
      levels: [],
      primaryElements: [],
      secondaryElements: [],
      tertiaryElements: []
    };
    
    // Sort by visual importance (size, position, contrast)
    const scored = elements.map(element => ({
      ...element,
      visualImportance: this.calculateVisualImportance(element, textData)
    })).sort((a, b) => b.visualImportance - a.visualImportance);
    
    // Assign to hierarchy levels
    const total = scored.length;
    hierarchy.primaryElements = scored.slice(0, Math.ceil(total * 0.2));
    hierarchy.secondaryElements = scored.slice(Math.ceil(total * 0.2), Math.ceil(total * 0.6));
    hierarchy.tertiaryElements = scored.slice(Math.ceil(total * 0.6));
    
    hierarchy.levels = [
      { level: 1, elements: hierarchy.primaryElements },
      { level: 2, elements: hierarchy.secondaryElements },
      { level: 3, elements: hierarchy.tertiaryElements }
    ];
    
    return hierarchy;
  }

  /**
   * Map colors to semantic meaning
   */
  mapColorsToSemantics(colors, elements) {
    const mapping = {};
    
    for (const color of colors) {
      const semantics = this.inferColorSemantics(color);
      const usageContext = this.findColorUsageContext(color, elements);
      
      mapping[color.hex] = {
        ...semantics,
        usage: usageContext,
        frequency: color.frequency
      };
    }
    
    return mapping;
  }

  /**
   * Merge analysis results from multiple images
   */
  mergeMultipleImageAnalysis(analysisResults) {
    if (analysisResults.length === 0) {
      return this.getEmptyAnalysisResult();
    }
    
    if (analysisResults.length === 1) {
      return analysisResults[0];
    }
    
    // Merge elements from all images
    const allElements = analysisResults.flatMap(result => result.elements);
    
    // Merge layouts (take the most confident one)
    const bestLayout = analysisResults.reduce((best, current) => 
      current.layout.confidence > best.layout.confidence ? current : best
    ).layout;
    
    // Merge wireframe data
    const mergedWireframe = this.mergeWireframeData(
      analysisResults.map(result => result.wireframe)
    );
    
    // Calculate overall confidence
    const overallConfidence = analysisResults.reduce((sum, result) => 
      sum + result.confidence, 0
    ) / analysisResults.length;
    
    return {
      imageCount: analysisResults.length,
      elements: this.removeDuplicateElements(allElements),
      layout: bestLayout,
      wireframe: mergedWireframe,
      confidence: overallConfidence,
      individualResults: analysisResults
    };
  }

  // Helper methods

  elementContainsText(element, textData) {
    if (!textData.blocks) return false;
    
    return textData.blocks.some(block => {
      if (!block.bbox) return false;
      
      const overlap = this.calculateBoundingBoxOverlap(element.bounds, {
        x: block.bbox.x0,
        y: block.bbox.y0,
        width: block.bbox.x1 - block.bbox.x0,
        height: block.bbox.y1 - block.bbox.y0
      });
      
      return overlap > 0.3;
    });
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

  isContentElement(element) {
    const contentTypes = [
      'text-heading', 'text-content', 'text-label',
      'card-container', 'content-section'
    ];
    return contentTypes.includes(element.wireframeType);
  }

  areElementsRelated(element1, element2) {
    const distance = Math.sqrt(
      Math.pow(element1.bounds.x - element2.bounds.x, 2) +
      Math.pow(element1.bounds.y - element2.bounds.y, 2)
    );
    
    const maxDimension = Math.max(
      element1.bounds.width, element1.bounds.height,
      element2.bounds.width, element2.bounds.height
    );
    
    return distance < maxDimension * 1.5;
  }

  calculateBoundingBox(boundsList) {
    const minX = Math.min(...boundsList.map(b => b.x));
    const minY = Math.min(...boundsList.map(b => b.y));
    const maxX = Math.max(...boundsList.map(b => b.x + b.width));
    const maxY = Math.max(...boundsList.map(b => b.y + b.height));
    
    return {
      x: minX,
      y: minY,  
      width: maxX - minX,
      height: maxY - minY
    };
  }

  determineInteractionType(element) {
    if (element.wireframeType.includes('button')) return 'click';
    if (element.wireframeType === 'input-field') return 'input';
    return 'hover';
  }

  suggestEventHandlers(element) {
    const handlers = [];
    
    if (element.wireframeType.includes('button')) {
      handlers.push('onClick');
    }
    
    if (element.wireframeType === 'input-field') {
      handlers.push('onChange', 'onFocus', 'onBlur');
    }
    
    return handlers;
  }

  refineBoundingBox(bounds) {
    // Add sub-pixel precision (simulate)
    return {
      ...bounds,
      x: Math.round(bounds.x * 10) / 10,
      y: Math.round(bounds.y * 10) / 10,
      width: Math.round(bounds.width * 10) / 10,
      height: Math.round(bounds.height * 10) / 10
    };
  }

  calculateSubPixelAlignment(bounds) {
    // Check alignment to common grid systems
    const gridSizes = [8, 12, 16, 24];
    const alignments = {};
    
    for (const grid of gridSizes) {
      alignments[`grid-${grid}`] = {
        x: bounds.x % grid === 0,
        y: bounds.y % grid === 0,
        width: bounds.width % grid === 0,
        height: bounds.height % grid === 0
      };
    }
    
    return alignments;
  }

  estimateMargins(element) {
    // Estimate margins based on nearby elements (simplified)
    return {
      top: 8,
      right: 8,
      bottom: 8,
      left: 8
    };
  }

  estimatePadding(element) {
    // Estimate padding based on element type and size
    const basePadding = Math.max(4, Math.min(element.bounds.width, element.bounds.height) * 0.05);
    
    return {
      top: basePadding,
      right: basePadding,
      bottom: basePadding,
      left: basePadding
    };
  }

  calculateRelationship(element1, element2) {
    const distance = Math.sqrt(
      Math.pow(element1.bounds.x - element2.bounds.x, 2) +
      Math.pow(element1.bounds.y - element2.bounds.y, 2)
    );
    
    const avgSize = (element1.area + element2.area) / 2;
    const normalizedDistance = distance / Math.sqrt(avgSize);
    
    let relationshipType = 'distant';
    let strength = 0;
    
    if (normalizedDistance < 2) {
      relationshipType = 'adjacent';
      strength = 1 - (normalizedDistance / 2);
    } else if (normalizedDistance < 5) {
      relationshipType = 'nearby';
      strength = 1 - (normalizedDistance / 5);
    }
    
    return {
      element1: element1,
      element2: element2,
      type: relationshipType,
      distance,
      strength
    };
  }

  calculateVisualImportance(element, textData) {
    let importance = 0;
    
    // Size factor (larger elements are more important)
    importance += Math.log(element.area) * 0.3;
    
    // Position factor (top-left elements are more important)
    const positionScore = (1000 - element.bounds.x - element.bounds.y) / 1000;
    importance += positionScore * 0.2;
    
    // Type factor
    const typeImportance = {
      'text-heading': 0.8,
      'button': 0.7,
      'content-section': 0.6,
      'input-field': 0.5,
      'text-content': 0.4
    };
    importance += (typeImportance[element.wireframeType] || 0.3) * 0.5;
    
    return importance;
  }

  inferColorSemantics(color) {
    const { r, g, b } = color;
    
    // Basic color semantics
    if (r > 200 && g < 100 && b < 100) {
      return { semantic: 'error', role: 'alert' };
    }
    if (r < 100 && g > 200 && b < 100) {
      return { semantic: 'success', role: 'confirmation' };
    }
    if (r < 100 && g < 100 && b > 200) {
      return { semantic: 'info', role: 'navigation' };
    }
    if (r > 240 && g > 240 && b > 240) {
      return { semantic: 'background', role: 'neutral' };
    }
    if (r < 50 && g < 50 && b < 50) {
      return { semantic: 'text', role: 'content' };
    }
    
    return { semantic: 'accent', role: 'decoration' };
  }

  findColorUsageContext(color, elements) {
    // Find which elements likely use this color
    const contexts = [];
    
    // This is simplified - in reality you'd analyze the actual image pixels
    if (color.frequency > 0.3) contexts.push('background');
    if (color.frequency < 0.1) contexts.push('accent');
    
    return contexts;
  }

  calculateSketch2CodeConfidence(analysis) {
    let confidence = 0;
    
    confidence += Math.min(analysis.wireframeElements.length / 10, 1) * 0.4;
    confidence += (analysis.layoutStructure !== 'unknown' ? 1 : 0) * 0.3;
    confidence += Math.min(analysis.interactiveElements.length / 5, 1) * 0.3;
    
    return confidence;
  }

  calculatePix2CodeConfidence(analysis) {
    let confidence = 0;
    
    confidence += Math.min(analysis.preciseElements.length / 10, 1) * 0.3;
    confidence += Math.min(analysis.spatialRelationships.length / 20, 1) * 0.3;
    confidence += Math.min(Object.keys(analysis.colorMapping).length / 8, 1) * 0.2;
    confidence += (analysis.visualHierarchy.levels.length > 0 ? 1 : 0) * 0.2;
    
    return confidence;
  }

  calculateOverallConfidence(cvResult, sketch2CodeResult, pix2CodeResult) {
    return (cvResult.confidence * 0.4 + 
            sketch2CodeResult.confidence * 0.3 + 
            pix2CodeResult.confidence * 0.3);
  }

  removeDuplicateElements(elements) {
    const unique = [];
    
    for (const element of elements) {
      const isDuplicate = unique.some(existing => {
        const overlap = this.calculateBoundingBoxOverlap(element.bounds, existing.bounds);
        return overlap > 0.7;
      });
      
      if (!isDuplicate) {
        unique.push(element);
      }
    }
    
    return unique;
  }

  enhanceLayoutAnalysis(layout, elements) {
    return {
      ...layout,
      semanticStructure: this.analyzeSemanticStructure(elements),
      responsiveBreakpoints: this.inferResponsiveBreakpoints(elements),
      gridSystem: this.detectGridSystem(elements)
    };
  }

  analyzeSemanticStructure(elements) {
    const structure = {
      header: elements.filter(el => el.bounds.y < 100),
      main: elements.filter(el => el.bounds.y >= 100 && el.bounds.y < 600),
      footer: elements.filter(el => el.bounds.y >= 600),
      sidebar: elements.filter(el => el.bounds.x < 200)
    };
    
    return structure;
  }

  inferResponsiveBreakpoints(elements) {
    // Simplified responsive inference
    const maxWidth = Math.max(...elements.map(el => el.bounds.x + el.bounds.width));
    
    if (maxWidth > 1200) return ['xl', 'lg', 'md', 'sm'];
    if (maxWidth > 768) return ['lg', 'md', 'sm'];
    return ['md', 'sm'];
  }

  detectGridSystem(elements) {
    // Detect common grid systems
    const columns = this.findCommonColumnPositions(elements);
    
    if (columns.length === 12) return { type: 'bootstrap', columns: 12 };
    if (columns.length >= 6) return { type: 'custom', columns: columns.length };
    return { type: 'flexbox', columns: 'auto' };
  }

  findCommonColumnPositions(elements) {
    const xPositions = elements.map(el => el.bounds.x).sort((a, b) => a - b);
    const uniquePositions = [...new Set(xPositions)];
    
    // Filter positions that are used by multiple elements
    return uniquePositions.filter(pos => 
      xPositions.filter(x => Math.abs(x - pos) < 10).length > 1
    );
  }

  async generateWireframeData(elements, layout) {
    return {
      components: elements.map(el => ({
        id: `component-${Math.random().toString(36).substr(2, 9)}`,
        type: el.wireframeType,
        bounds: el.bounds,
        properties: this.generateComponentProperties(el)
      })),
      layout: layout.structure,
      grid: layout.grid,
      relationships: this.generateComponentRelationships(elements)
    };
  }

  generateComponentProperties(element) {
    const props = {};
    
    if (element.wireframeType === 'button') {
      props.variant = 'primary';
      props.size = element.bounds.width > 100 ? 'large' : 'medium';
    }
    
    if (element.wireframeType === 'input-field') {
      props.type = 'text';
      props.placeholder = 'Enter text...';
    }
    
    if (element.wireframeType.includes('text')) {
      props.content = 'Sample text content';
    }
    
    return props;
  }

  generateComponentRelationships(elements) {
    const relationships = [];
    
    for (let i = 0; i < elements.length; i++) {
      for (let j = i + 1; j < elements.length; j++) {
        const rel = this.calculateRelationship(elements[i], elements[j]);
        if (rel.strength > 0.5) {
          relationships.push({
            from: i,
            to: j,
            type: rel.type,
            strength: rel.strength
          });
        }
      }
    }
    
    return relationships;
  }

  mergeWireframeData(wireframes) {
    const merged = {
      components: [],
      layout: 'complex',
      relationships: []
    };
    
    wireframes.forEach(wireframe => {
      merged.components.push(...wireframe.components);
      merged.relationships.push(...wireframe.relationships);
    });
    
    return merged;
  }

  detectResponsiveBreakpoints(metadata, elements) {
    const breakpoints = [];
    const { width } = metadata;
    
    if (width >= 1200) breakpoints.push({ name: 'xl', width: 1200 });
    if (width >= 992) breakpoints.push({ name: 'lg', width: 992 });
    if (width >= 768) breakpoints.push({ name: 'md', width: 768 });
    breakpoints.push({ name: 'sm', width: 576 });
    
    return breakpoints;
  }

  getEmptyAnalysisResult() {
    return {
      imageCount: 0,
      elements: [],
      layout: { structure: 'unknown', grid: { columns: 1, rows: 1 } },
      wireframe: { components: [], relationships: [] },
      confidence: 0,
      individualResults: []
    };
  }

  getEmptyImageAnalysisResult(index, image) {
    return {
      imageIndex: index,
      originalImage: image,
      cvAnalysis: { elements: [], layout: {}, text: { blocks: [] }, colors: [], confidence: 0 },
      sketch2Code: { wireframeElements: [], confidence: 0 },
      pix2Code: { preciseElements: [], confidence: 0 },
      elements: [],
      layout: { structure: 'unknown' },
      wireframe: { components: [], relationships: [] },
      confidence: 0
    };
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    if (this.cvAnalysis) {
      await this.cvAnalysis.cleanup();
    }
  }
}

export default SpecializedCVTools;