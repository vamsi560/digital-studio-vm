/**
 * Computer Vision Analysis Utilities
 * Microsoft Sketch2Code inspired approach for UI element detection
 */

import sharp from 'sharp';
import Jimp from 'jimp';
import { createWorker } from 'tesseract.js';

export class CVAnalysis {
  constructor() {
    this.ocrWorker = null;
  }

  /**
   * Initialize OCR worker
   */
  async initializeOCR() {
    if (!this.ocrWorker) {
      this.ocrWorker = await createWorker('eng');
    }
    return this.ocrWorker;
  }

  /**
   * Main preprocessing function for images
   * @param {Buffer} imageBuffer - Input image buffer
   * @returns {Object} - Preprocessed analysis results
   */
  async preprocessImage(imageBuffer) {
    try {
      console.log('Starting CV preprocessing...');
      
      // Convert buffer to various formats for analysis
      const sharpImage = sharp(imageBuffer);
      const metadata = await sharpImage.metadata();
      
      // Parallel processing of different analysis types
      const [
        elements,
        layout,
        textData,
        colorPalette,
        edges
      ] = await Promise.all([
        this.detectUIElements(imageBuffer, metadata),
        this.analyzeLayout(imageBuffer, metadata),
        this.extractText(imageBuffer),
        this.extractColorPalette(imageBuffer),
        this.detectEdges(imageBuffer)
      ]);

      const result = {
        metadata: {
          width: metadata.width,
          height: metadata.height,
          format: metadata.format,
          channels: metadata.channels
        },
        elements,
        layout,
        text: textData,
        colors: colorPalette,
        edges,
        confidence: this.calculateConfidence(elements, layout, textData)
      };

      console.log('CV preprocessing completed:', {
        elementsFound: elements.length,
        textBlocks: textData.blocks?.length || 0,
        colorsDetected: colorPalette.length,
        confidence: result.confidence
      });

      return result;
    } catch (error) {
      console.error('CV preprocessing error:', error);
      return {
        error: error.message,
        elements: [],
        layout: { structure: 'unknown' },
        text: { blocks: [] },
        colors: [],
        edges: [],
        confidence: 0
      };
    }
  }

  /**
   * Detect UI elements using Microsoft Sketch2Code approach
   * @param {Buffer} imageBuffer 
   * @param {Object} metadata 
   * @returns {Array} Detected UI elements
   */
  async detectUIElements(imageBuffer, metadata) {
    try {
      const jimp = await Jimp.read(imageBuffer);
      const elements = [];

      // Convert to grayscale for better edge detection
      const grayscale = jimp.clone().greyscale();
      
      // Detect rectangular regions (buttons, cards, containers)
      const rectangles = await this.detectRectangularElements(grayscale, metadata);
      elements.push(...rectangles);

      // Detect circular elements (buttons, icons)
      const circles = await this.detectCircularElements(grayscale, metadata);
      elements.push(...circles);

      // Detect text regions
      const textRegions = await this.detectTextRegions(grayscale, metadata);
      elements.push(...textRegions);

      // Detect input fields
      const inputFields = await this.detectInputFields(grayscale, metadata);
      elements.push(...inputFields);

      // Sort by area (largest first) and confidence
      return elements.sort((a, b) => (b.area * b.confidence) - (a.area * a.confidence));
    } catch (error) {
      console.error('UI element detection error:', error);
      return [];
    }
  }

  /**
   * Detect rectangular UI elements (buttons, cards, containers)
   */
  async detectRectangularElements(grayscaleJimp, metadata) {
    const elements = [];
    const { width, height } = metadata;
    
    try {
      // Simple edge-based rectangle detection
      const edgeThreshold = 50;
      const minWidth = Math.floor(width * 0.05);  // Min 5% of image width
      const minHeight = Math.floor(height * 0.02); // Min 2% of image height
      const maxWidth = Math.floor(width * 0.8);   // Max 80% of image width
      const maxHeight = Math.floor(height * 0.6);  // Max 60% of image height

      // Scan for rectangular regions
      for (let y = 0; y < height - minHeight; y += 10) {
        for (let x = 0; x < width - minWidth; x += 10) {
          const region = await this.analyzeRegion(grayscaleJimp, x, y, minWidth, minHeight, maxWidth, maxHeight);
          
          if (region && region.confidence > 0.6) {
            const elementType = this.classifyRectangularElement(region);
            elements.push({
              type: elementType,
              bounds: region.bounds,
              area: region.area,
              confidence: region.confidence,
              properties: region.properties
            });
          }
        }
      }

      return this.removeDuplicateElements(elements);
    } catch (error) {
      console.error('Rectangular element detection error:', error);
      return [];
    }
  }

  /**
   * Analyze a specific region for rectangular patterns
   */
  async analyzeRegion(jimp, startX, startY, minW, minH, maxW, maxH) {
    try {
      // Sample region to detect edges
      const sampleWidth = Math.min(maxW, jimp.bitmap.width - startX);
      const sampleHeight = Math.min(maxH, jimp.bitmap.height - startY);
      
      if (sampleWidth < minW || sampleHeight < minH) return null;

      // Check for edge patterns indicating a rectangular element
      const topEdge = this.checkHorizontalEdge(jimp, startX, startY, sampleWidth);
      const bottomEdge = this.checkHorizontalEdge(jimp, startX, startY + sampleHeight - 1, sampleWidth);
      const leftEdge = this.checkVerticalEdge(jimp, startX, startY, sampleHeight);
      const rightEdge = this.checkVerticalEdge(jimp, startX + sampleWidth - 1, startY, sampleHeight);

      const edgeScore = (topEdge + bottomEdge + leftEdge + rightEdge) / 4;
      
      if (edgeScore > 0.3) {
        const area = sampleWidth * sampleHeight;
        const aspectRatio = sampleWidth / sampleHeight;
        
        return {
          bounds: {
            x: startX,
            y: startY,
            width: sampleWidth,
            height: sampleHeight
          },
          area,
          confidence: Math.min(edgeScore * 1.5, 1.0),
          properties: {
            aspectRatio,
            edgeScore,
            center: {
              x: startX + sampleWidth / 2,
              y: startY + sampleHeight / 2
            }
          }
        };
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Check for horizontal edge patterns
   */
  checkHorizontalEdge(jimp, startX, y, width) {
    let edgeStrength = 0;
    let samples = 0;

    for (let x = startX; x < startX + width && x < jimp.bitmap.width - 1; x += 5) {
      if (y >= 1 && y < jimp.bitmap.height - 1) {
        const current = Jimp.intToRGBA(jimp.getPixelColor(x, y)).r;
        const above = Jimp.intToRGBA(jimp.getPixelColor(x, y - 1)).r;
        const below = Jimp.intToRGBA(jimp.getPixelColor(x, y + 1)).r;
        
        const diff = Math.abs(current - above) + Math.abs(current - below);
        edgeStrength += diff;
        samples++;
      }
    }

    return samples > 0 ? (edgeStrength / samples) / 255 : 0;
  }

  /**
   * Check for vertical edge patterns
   */
  checkVerticalEdge(jimp, x, startY, height) {
    let edgeStrength = 0;
    let samples = 0;

    for (let y = startY; y < startY + height && y < jimp.bitmap.height - 1; y += 5) {
      if (x >= 1 && x < jimp.bitmap.width - 1) {
        const current = Jimp.intToRGBA(jimp.getPixelColor(x, y)).r;
        const left = Jimp.intToRGBA(jimp.getPixelColor(x - 1, y)).r;
        const right = Jimp.intToRGBA(jimp.getPixelColor(x + 1, y)).r;
        
        const diff = Math.abs(current - left) + Math.abs(current - right);
        edgeStrength += diff;
        samples++;
      }
    }

    return samples > 0 ? (edgeStrength / samples) / 255 : 0;
  }

  /**
   * Classify the type of rectangular element
   */
  classifyRectangularElement(region) {
    const { aspectRatio } = region.properties;
    const { width, height } = region.bounds;

    // Classification based on aspect ratio and size
    if (aspectRatio > 3) {
      return 'horizontal-separator';
    } else if (aspectRatio < 0.3) {
      return 'vertical-separator';
    } else if (aspectRatio > 2 && height < 50) {
      return 'button';
    } else if (aspectRatio > 2 && height > 30 && height < 60) {
      return 'input-field';
    } else if (width > 200 && height > 100) {
      return 'container';
    } else if (width < 150 && height < 150) {
      return 'button';
    } else {
      return 'container';
    }
  }

  /**
   * Detect circular elements
   */
  async detectCircularElements(grayscaleJimp, metadata) {
    const elements = [];
    // Simplified circular detection - look for square regions with high edge density
    // This is a placeholder for more sophisticated circular detection
    
    try {
      const { width, height } = metadata;
      const minRadius = 10;
      const maxRadius = Math.min(width, height) / 4;

      for (let y = maxRadius; y < height - maxRadius; y += 20) {
        for (let x = maxRadius; x < width - maxRadius; x += 20) {
          const circularScore = this.checkCircularPattern(grayscaleJimp, x, y, minRadius, maxRadius);
          
          if (circularScore.confidence > 0.4) {
            elements.push({
              type: 'circular-element',
              bounds: {
                x: x - circularScore.radius,
                y: y - circularScore.radius,
                width: circularScore.radius * 2,
                height: circularScore.radius * 2
              },
              area: Math.PI * circularScore.radius * circularScore.radius,
              confidence: circularScore.confidence,
              properties: {
                radius: circularScore.radius,
                center: { x, y }
              }
            });
          }
        }
      }

      return elements;
    } catch (error) {
      console.error('Circular element detection error:', error);
      return [];
    }
  }

  /**
   * Check for circular patterns at a given point
   */
  checkCircularPattern(jimp, centerX, centerY, minRadius, maxRadius) {
    try {
      let bestRadius = minRadius;
      let bestScore = 0;

      for (let radius = minRadius; radius <= maxRadius; radius += 5) {
        let edgeCount = 0;
        let samples = 0;

        // Sample points around the circle
        for (let angle = 0; angle < 360; angle += 15) {
          const radians = (angle * Math.PI) / 180;
          const x = Math.round(centerX + radius * Math.cos(radians));
          const y = Math.round(centerY + radius * Math.sin(radians));

          if (x >= 1 && x < jimp.bitmap.width - 1 && y >= 1 && y < jimp.bitmap.height - 1) {
            const centerPixel = Jimp.intToRGBA(jimp.getPixelColor(x, y)).r;
            const innerPixel = Jimp.intToRGBA(jimp.getPixelColor(
              Math.round(centerX + (radius - 5) * Math.cos(radians)),
              Math.round(centerY + (radius - 5) * Math.sin(radians))
            )).r;
            
            const diff = Math.abs(centerPixel - innerPixel);
            if (diff > 30) edgeCount++;
            samples++;
          }
        }

        const score = samples > 0 ? edgeCount / samples : 0;
        if (score > bestScore) {
          bestScore = score;
          bestRadius = radius;
        }
      }

      return {
        radius: bestRadius,
        confidence: bestScore
      };
    } catch (error) {
      return { radius: minRadius, confidence: 0 };
    }
  }

  /**
   * Detect text regions using basic pattern recognition
   */
  async detectTextRegions(grayscaleJimp, metadata) {
    const elements = [];
    
    try {
      // Look for horizontal lines of text-like patterns
      const { width, height } = metadata;
      const lineHeight = 20;
      
      for (let y = 0; y < height - lineHeight; y += 5) {
        const textScore = this.checkTextPattern(grayscaleJimp, 0, y, width, lineHeight);
        
        if (textScore.confidence > 0.3) {
          elements.push({
            type: 'text-region',
            bounds: {
              x: textScore.startX,
              y: y,
              width: textScore.width,
              height: lineHeight
            },
            area: textScore.width * lineHeight,
            confidence: textScore.confidence,
            properties: {
              textDensity: textScore.density,
              estimatedChars: textScore.estimatedChars
            }
          });
        }
      }

      return this.mergeNearbyTextRegions(elements);
    } catch (error) {
      console.error('Text region detection error:', error);
      return [];
    }
  }

  /**
   * Check for text-like patterns in a horizontal region
   */
  checkTextPattern(jimp, startX, y, maxWidth, height) {
    try {
      let textPixels = 0;
      let totalPixels = 0;
      let charCount = 0;
      let inChar = false;
      let firstTextX = startX;
      let lastTextX = startX;

      for (let x = startX; x < startX + maxWidth && x < jimp.bitmap.width; x++) {
        for (let dy = 0; dy < height && y + dy < jimp.bitmap.height; dy++) {
          const pixel = Jimp.intToRGBA(jimp.getPixelColor(x, y + dy)).r;
          totalPixels++;
          
          // Dark pixels likely represent text
          if (pixel < 128) {
            textPixels++;
            if (!inChar) {
              charCount++;
              inChar = true;
              if (firstTextX === startX) firstTextX = x;
            }
            lastTextX = x;
          } else if (inChar && pixel > 200) {
            // Light pixel after dark pixels - end of character
            inChar = false;
          }
        }
      }

      const density = totalPixels > 0 ? textPixels / totalPixels : 0;
      const confidence = Math.min(density * 2, 1) * Math.min(charCount / 5, 1);

      return {
        confidence,
        density,
        estimatedChars: charCount,
        startX: firstTextX,
        width: Math.max(lastTextX - firstTextX, 50)
      };
    } catch (error) {
      return {
        confidence: 0,
        density: 0,
        estimatedChars: 0,
        startX,
        width: 100
      };
    }
  }

  /**
   * Merge nearby text regions into larger blocks
   */
  mergeNearbyTextRegions(textRegions) {
    const merged = [];
    const used = new Set();

    for (let i = 0; i < textRegions.length; i++) {
      if (used.has(i)) continue;

      const current = textRegions[i];
      const group = [current];
      used.add(i);

      // Find nearby regions to merge
      for (let j = i + 1; j < textRegions.length; j++) {
        if (used.has(j)) continue;

        const other = textRegions[j];
        const verticalDistance = Math.abs(current.bounds.y - other.bounds.y);
        const horizontalOverlap = this.calculateHorizontalOverlap(current.bounds, other.bounds);

        if (verticalDistance < 30 && horizontalOverlap > 0.3) {
          group.push(other);
          used.add(j);
        }
      }

      // Create merged region
      if (group.length > 1) {
        const bounds = this.calculateBoundingBox(group.map(g => g.bounds));
        merged.push({
          type: 'text-block',
          bounds,
          area: bounds.width * bounds.height,
          confidence: group.reduce((sum, g) => sum + g.confidence, 0) / group.length,
          properties: {
            lineCount: group.length,
            avgTextDensity: group.reduce((sum, g) => sum + g.properties.textDensity, 0) / group.length
          }
        });
      } else {
        merged.push(current);
      }
    }

    return merged;
  }

  /**
   * Detect input field patterns
   */
  async detectInputFields(grayscaleJimp, metadata) {
    const elements = [];
    
    try {
      // Look for rectangular regions with specific input field characteristics
      const { width, height } = metadata;
      const minFieldWidth = 100;
      const fieldHeight = 35;
      
      for (let y = 0; y < height - fieldHeight; y += 10) {
        for (let x = 0; x < width - minFieldWidth; x += 20) {
          const fieldScore = this.checkInputFieldPattern(grayscaleJimp, x, y, minFieldWidth, fieldHeight);
          
          if (fieldScore.confidence > 0.5) {
            elements.push({
              type: 'input-field',
              bounds: {
                x: x,
                y: y,
                width: fieldScore.width,
                height: fieldHeight
              },
              area: fieldScore.width * fieldHeight,
              confidence: fieldScore.confidence,
              properties: {
                borderStrength: fieldScore.borderStrength,
                isEmpty: fieldScore.isEmpty
              }
            });
          }
        }
      }

      return elements;
    } catch (error) {
      console.error('Input field detection error:', error);
      return [];
    }
  }

  /**
   * Check for input field characteristics
   */
  checkInputFieldPattern(jimp, startX, startY, minWidth, height) {
    try {
      // Check for rectangular border pattern
      const maxWidth = Math.min(minWidth * 3, jimp.bitmap.width - startX);
      let bestWidth = minWidth;
      let bestScore = 0;

      for (let width = minWidth; width <= maxWidth; width += 10) {
        const borderScore = this.checkRectangularBorder(jimp, startX, startY, width, height);
        const emptinessScore = this.checkRegionEmptiness(jimp, startX + 2, startY + 2, width - 4, height - 4);
        
        const totalScore = (borderScore * 0.7) + (emptinessScore * 0.3);
        
        if (totalScore > bestScore) {
          bestScore = totalScore;
          bestWidth = width;
        }
      }

      return {
        confidence: bestScore,
        width: bestWidth,
        borderStrength: bestScore,
        isEmpty: this.checkRegionEmptiness(jimp, startX + 2, startY + 2, bestWidth - 4, height - 4) > 0.7
      };
    } catch (error) {
      return {
        confidence: 0,
        width: minWidth,
        borderStrength: 0,
        isEmpty: false
      };
    }
  }

  /**
   * Check for rectangular border pattern
   */
  checkRectangularBorder(jimp, x, y, width, height) {
    try {
      const top = this.checkHorizontalEdge(jimp, x, y, width);
      const bottom = this.checkHorizontalEdge(jimp, x, y + height - 1, width);
      const left = this.checkVerticalEdge(jimp, x, y, height);
      const right = this.checkVerticalEdge(jimp, x + width - 1, y, height);

      return (top + bottom + left + right) / 4;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Check if a region is mostly empty (light colored)
   */
  checkRegionEmptiness(jimp, x, y, width, height) {
    try {
      let lightPixels = 0;
      let totalPixels = 0;

      for (let dy = 0; dy < height && y + dy < jimp.bitmap.height; dy += 2) {
        for (let dx = 0; dx < width && x + dx < jimp.bitmap.width; dx += 2) {
          const pixel = Jimp.intToRGBA(jimp.getPixelColor(x + dx, y + dy)).r;
          if (pixel > 200) lightPixels++;
          totalPixels++;
        }
      }

      return totalPixels > 0 ? lightPixels / totalPixels : 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Analyze layout structure
   */
  async analyzeLayout(imageBuffer, metadata) {
    try {
      const { width, height } = metadata;
      
      // Analyze grid patterns
      const gridAnalysis = await this.detectGridPatterns(imageBuffer, metadata);
      
      // Analyze alignment
      const alignmentAnalysis = await this.analyzeAlignment(imageBuffer, metadata);
      
      // Analyze spacing
      const spacingAnalysis = await this.analyzeSpacing(imageBuffer, metadata);

      return {
        structure: this.determineLayoutStructure(gridAnalysis, alignmentAnalysis),
        grid: gridAnalysis,
        alignment: alignmentAnalysis,
        spacing: spacingAnalysis,
        aspectRatio: width / height,
        dimensions: { width, height }
      };
    } catch (error) {
      console.error('Layout analysis error:', error);
      return {
        structure: 'unknown',
        grid: { columns: 1, rows: 1 },
        alignment: 'left',
        spacing: { horizontal: 10, vertical: 10 }
      };
    }
  }

  /**
   * Detect grid patterns in the layout
   */
  async detectGridPatterns(imageBuffer, metadata) {
    try {
      const jimp = await Jimp.read(imageBuffer);
      const { width, height } = metadata;
      
      // Look for vertical and horizontal divisions
      const verticalDivisions = this.findVerticalDivisions(jimp, width, height);
      const horizontalDivisions = this.findHorizontalDivisions(jimp, width, height);

      return {
        columns: verticalDivisions.length + 1,
        rows: horizontalDivisions.length + 1,
        verticalDivisions,
        horizontalDivisions,
        confidence: Math.min((verticalDivisions.length + horizontalDivisions.length) / 10, 1)
      };
    } catch (error) {
      return { columns: 1, rows: 1, confidence: 0 };
    }
  }

  /**
   * Find vertical divisions in the layout
   */
  findVerticalDivisions(jimp, width, height) {
    const divisions = [];
    const threshold = height * 0.3; // Must span at least 30% of height

    for (let x = width * 0.1; x < width * 0.9; x += 10) {
      let divisionStrength = 0;
      let samples = 0;

      for (let y = 0; y < height; y += 5) {
        if (x > 0 && x < width - 1) {
          const current = Jimp.intToRGBA(jimp.getPixelColor(x, y)).r;
          const left = Jimp.intToRGBA(jimp.getPixelColor(x - 1, y)).r;
          const right = Jimp.intToRGBA(jimp.getPixelColor(x + 1, y)).r;
          
          const diff = Math.abs(current - left) + Math.abs(current - right);
          divisionStrength += diff;
          samples++;
        }
      }

      const avgStrength = samples > 0 ? divisionStrength / samples : 0;
      if (avgStrength > 20 && samples > threshold) {
        divisions.push({
          x,
          strength: avgStrength,
          height: samples * 5
        });
      }
    }

    return divisions.sort((a, b) => b.strength - a.strength).slice(0, 5);
  }

  /**
   * Find horizontal divisions in the layout
   */
  findHorizontalDivisions(jimp, width, height) {
    const divisions = [];
    const threshold = width * 0.3; // Must span at least 30% of width

    for (let y = height * 0.1; y < height * 0.9; y += 10) {
      let divisionStrength = 0;
      let samples = 0;

      for (let x = 0; x < width; x += 5) {
        if (y > 0 && y < height - 1) {
          const current = Jimp.intToRGBA(jimp.getPixelColor(x, y)).r;
          const above = Jimp.intToRGBA(jimp.getPixelColor(x, y - 1)).r;
          const below = Jimp.intToRGBA(jimp.getPixelColor(x, y + 1)).r;
          
          const diff = Math.abs(current - above) + Math.abs(current - below);
          divisionStrength += diff;
          samples++;
        }
      }

      const avgStrength = samples > 0 ? divisionStrength / samples : 0;
      if (avgStrength > 20 && samples > threshold) {
        divisions.push({
          y,
          strength: avgStrength,
          width: samples * 5
        });
      }
    }

    return divisions.sort((a, b) => b.strength - a.strength).slice(0, 5);
  }

  /**
   * Analyze alignment patterns
   */
  async analyzeAlignment(imageBuffer, metadata) {
    // Simplified alignment detection
    return {
      primary: 'left',
      secondary: 'top',
      confidence: 0.7
    };
  }

  /**
   * Analyze spacing patterns
   */
  async analyzeSpacing(imageBuffer, metadata) {
    // Simplified spacing analysis
    const { width, height } = metadata;
    return {
      horizontal: Math.floor(width * 0.02),
      vertical: Math.floor(height * 0.02),
      padding: Math.floor(Math.min(width, height) * 0.03)
    };
  }

  /**
   * Extract text using OCR
   */
  async extractText(imageBuffer) {
    try {
      await this.initializeOCR();
      
      const { data } = await this.ocrWorker.recognize(imageBuffer);
      
      const blocks = data.blocks?.map(block => ({
        text: block.text?.trim(),
        confidence: block.confidence || 0,
        bbox: block.bbox,
        fontSize: this.estimateFontSize(block.bbox),
        lines: block.lines?.length || 1
      })).filter(block => block.text && block.text.length > 0) || [];

      return {
        fullText: data.text?.trim() || '',
        confidence: data.confidence || 0,
        blocks,
        wordCount: data.words?.length || 0,
        language: 'eng'
      };
    } catch (error) {
      console.error('OCR error:', error);
      return {
        fullText: '',
        confidence: 0,
        blocks: [],
        wordCount: 0,
        language: 'eng'
      };
    }
  }

  /**
   * Extract color palette using Sharp
   */
  async extractColorPalette(imageBuffer) {
    try {
      const image = sharp(imageBuffer);
      const { dominant } = await image.stats();
      
      // Get dominant colors using Sharp's stats
      const colors = [];
      if (dominant) {
        colors.push({
          r: Math.round(dominant.r),
          g: Math.round(dominant.g),
          b: Math.round(dominant.b),
          hex: this.rgbToHex(Math.round(dominant.r), Math.round(dominant.g), Math.round(dominant.b)),
          frequency: 1.0
        });
      }

      // Add some basic color analysis
      const buffer = await image.raw().toBuffer();
      const additionalColors = this.analyzeColorDistribution(buffer);
      colors.push(...additionalColors);

      return colors.slice(0, 8); // Return top 8 colors
    } catch (error) {
      console.error('Color extraction error:', error);
      return [
        { r: 255, g: 255, b: 255, hex: '#ffffff', frequency: 0.5 },
        { r: 0, g: 0, b: 0, hex: '#000000', frequency: 0.3 }
      ];
    }
  }

  /**
   * Detect edges using simple algorithms
   */
  async detectEdges(imageBuffer) {
    try {
      const jimp = await Jimp.read(imageBuffer);
      const edges = [];
      
      // Simple edge detection - look for high contrast areas
      const { width, height } = jimp.bitmap;
      
      for (let y = 1; y < height - 1; y += 10) {
        for (let x = 1; x < width - 1; x += 10) {
          const edgeStrength = this.calculateEdgeStrength(jimp, x, y);
          
          if (edgeStrength > 50) {
            edges.push({
              x,
              y,
              strength: edgeStrength
            });
          }
        }
      }

      return edges.sort((a, b) => b.strength - a.strength).slice(0, 100);
    } catch (error) {
      console.error('Edge detection error:', error);
      return [];
    }
  }

  /**
   * Calculate edge strength at a point using Sobel operator
   */
  calculateEdgeStrength(jimp, x, y) {
    try {
      // Get surrounding pixels
      const pixels = [];
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const pixel = Jimp.intToRGBA(jimp.getPixelColor(x + dx, y + dy));
          pixels.push(pixel.r); // Use red channel for grayscale
        }
      }

      // Sobel X kernel
      const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
      // Sobel Y kernel  
      const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

      let gx = 0, gy = 0;
      for (let i = 0; i < 9; i++) {
        gx += pixels[i] * sobelX[i];
        gy += pixels[i] * sobelY[i];
      }

      return Math.sqrt(gx * gx + gy * gy);
    } catch (error) {
      return 0;
    }
  }

  // Helper methods
  
  calculateConfidence(elements, layout, textData) {
    const elementScore = Math.min(elements.length / 10, 1);
    const layoutScore = layout.grid?.confidence || 0;
    const textScore = Math.min(textData.confidence / 100, 1);
    
    return (elementScore * 0.4 + layoutScore * 0.3 + textScore * 0.3);
  }

  removeDuplicateElements(elements) {
    const filtered = [];
    
    for (const element of elements) {
      const isDuplicate = filtered.some(existing => 
        this.calculateOverlap(element.bounds, existing.bounds) > 0.7
      );
      
      if (!isDuplicate) {
        filtered.push(element);
      }
    }
    
    return filtered;
  }

  calculateOverlap(bounds1, bounds2) {
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

  calculateHorizontalOverlap(bounds1, bounds2) {
    const x1 = Math.max(bounds1.x, bounds2.x);
    const x2 = Math.min(bounds1.x + bounds1.width, bounds2.x + bounds2.width);
    
    if (x2 <= x1) return 0;
    
    const overlap = x2 - x1;
    const minWidth = Math.min(bounds1.width, bounds2.width);
    
    return overlap / minWidth;
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

  determineLayoutStructure(gridAnalysis, alignmentAnalysis) {
    const { columns, rows } = gridAnalysis;
    
    if (columns > 3 && rows > 3) return 'complex-grid';
    if (columns > 2) return 'multi-column';
    if (rows > 2) return 'multi-row';
    return 'simple';
  }

  estimateFontSize(bbox) {
    return bbox ? Math.max(12, bbox.y1 - bbox.y0) : 16;
  }

  rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  analyzeColorDistribution(buffer) {
    // Simple color distribution analysis
    const colors = [];
    const step = Math.max(1, Math.floor(buffer.length / 30000)); // Sample pixels
    
    for (let i = 0; i < buffer.length; i += step * 3) {
      if (i + 2 < buffer.length) {
        const r = buffer[i];
        const g = buffer[i + 1]; 
        const b = buffer[i + 2];
        
        // Skip very similar colors to existing ones
        const existing = colors.find(c => 
          Math.abs(c.r - r) < 30 && Math.abs(c.g - g) < 30 && Math.abs(c.b - b) < 30
        );
        
        if (!existing) {
          colors.push({
            r, g, b,
            hex: this.rgbToHex(r, g, b),
            frequency: 0.1
          });
        }
      }
    }
    
    return colors.slice(0, 5);
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    if (this.ocrWorker) {
      await this.ocrWorker.terminate();
      this.ocrWorker = null;
    }
  }
}

export default CVAnalysis;