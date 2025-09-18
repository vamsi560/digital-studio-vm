// Comprehensive validation utilities for Digital Studio VM

export class ValidationError extends Error {
  constructor(message, field = null, code = 'VALIDATION_ERROR') {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.code = code;
  }
}

export class InputValidator {
  static validateImageUpload(files) {
    if (!files || files.length === 0) {
      throw new ValidationError('At least one image is required', 'images', 'NO_IMAGES');
    }

    if (files.length > 10) {
      throw new ValidationError('Maximum 10 images allowed', 'images', 'TOO_MANY_IMAGES');
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    for (const file of files) {
      if (!allowedTypes.includes(file.mimetype)) {
        throw new ValidationError(
          `Invalid file type: ${file.mimetype}. Allowed types: ${allowedTypes.join(', ')}`,
          'images',
          'INVALID_FILE_TYPE'
        );
      }

      if (file.size > maxSize) {
        throw new ValidationError(
          `File too large: ${file.originalname}. Maximum size: 10MB`,
          'images',
          'FILE_TOO_LARGE'
        );
      }
    }

    return true;
  }

  static validateProjectOptions(options) {
    const { platform, framework, styling, architecture } = options;

    const validPlatforms = ['web', 'android', 'ios'];
    if (!validPlatforms.includes(platform)) {
      throw new ValidationError(
        `Invalid platform: ${platform}. Valid platforms: ${validPlatforms.join(', ')}`,
        'platform',
        'INVALID_PLATFORM'
      );
    }

    const validFrameworks = {
      web: ['React', 'Vue', 'Angular', 'Svelte'],
      android: ['Kotlin', 'Java'],
      ios: ['Swift', 'Objective-C']
    };

    if (!validFrameworks[platform]?.includes(framework)) {
      throw new ValidationError(
        `Invalid framework for ${platform}: ${framework}. Valid frameworks: ${validFrameworks[platform]?.join(', ')}`,
        'framework',
        'INVALID_FRAMEWORK'
      );
    }

    const validStyling = ['Tailwind CSS', 'CSS Modules', 'Styled Components', 'Material-UI', 'Chakra UI'];
    if (platform === 'web' && !validStyling.includes(styling)) {
      throw new ValidationError(
        `Invalid styling: ${styling}. Valid options: ${validStyling.join(', ')}`,
        'styling',
        'INVALID_STYLING'
      );
    }

    const validArchitectures = ['Component-Based', 'MVVM', 'MVC', 'MVP', 'Clean Architecture'];
    if (!validArchitectures.includes(architecture)) {
      throw new ValidationError(
        `Invalid architecture: ${architecture}. Valid options: ${validArchitectures.join(', ')}`,
        'architecture',
        'INVALID_ARCHITECTURE'
      );
    }

    return true;
  }

  static validateTextInput(text, fieldName, minLength = 1, maxLength = 1000) {
    if (!text || typeof text !== 'string') {
      throw new ValidationError(`${fieldName} is required`, fieldName, 'REQUIRED_FIELD');
    }

    const trimmed = text.trim();
    if (trimmed.length < minLength) {
      throw new ValidationError(
        `${fieldName} must be at least ${minLength} characters long`,
        fieldName,
        'TOO_SHORT'
      );
    }

    if (trimmed.length > maxLength) {
      throw new ValidationError(
        `${fieldName} must be no more than ${maxLength} characters long`,
        fieldName,
        'TOO_LONG'
      );
    }

    return true;
  }

  static validateFigmaUrl(url) {
    if (!url || typeof url !== 'string') {
      throw new ValidationError('Figma URL is required', 'figmaUrl', 'REQUIRED_FIELD');
    }

    const figmaUrlPattern = /^https:\/\/www\.figma\.com\/file\/[a-zA-Z0-9]+\/[^\/]+/;
    if (!figmaUrlPattern.test(url)) {
      throw new ValidationError(
        'Invalid Figma URL format. Expected: https://www.figma.com/file/[file-id]/[file-name]',
        'figmaUrl',
        'INVALID_FIGMA_URL'
      );
    }

    return true;
  }

  static validateGitHubData(data) {
    const { projectName, description } = data;

    this.validateTextInput(projectName, 'Project Name', 1, 100);
    this.validateTextInput(description, 'Description', 1, 500);

    // Validate project name format
    const projectNamePattern = /^[a-zA-Z0-9][a-zA-Z0-9\-_]*[a-zA-Z0-9]$/;
    if (!projectNamePattern.test(projectName)) {
      throw new ValidationError(
        'Project name must contain only alphanumeric characters, hyphens, and underscores, and cannot start or end with a hyphen or underscore',
        'projectName',
        'INVALID_PROJECT_NAME'
      );
    }

    return true;
  }
}

export class SecurityValidator {
  static sanitizeInput(input) {
    if (typeof input !== 'string') return input;

    // Remove potentially dangerous characters
    return input
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  static validateApiKey(apiKey) {
    if (!apiKey || typeof apiKey !== 'string') {
      throw new ValidationError('API key is required', 'apiKey', 'MISSING_API_KEY');
    }

    if (apiKey.length < 20) {
      throw new ValidationError('API key appears to be invalid', 'apiKey', 'INVALID_API_KEY');
    }

    return true;
  }

  static validateRateLimit(identifier, maxRequests = 100, windowMs = 60000) {
    // Simple in-memory rate limiting (in production, use Redis or similar)
    if (!this.rateLimitStore) {
      this.rateLimitStore = new Map();
    }

    const now = Date.now();
    const windowStart = now - windowMs;
    const requests = this.rateLimitStore.get(identifier) || [];

    // Remove old requests outside the window
    const recentRequests = requests.filter(timestamp => timestamp > windowStart);

    if (recentRequests.length >= maxRequests) {
      throw new ValidationError(
        'Rate limit exceeded. Please try again later.',
        'rateLimit',
        'RATE_LIMIT_EXCEEDED'
      );
    }

    recentRequests.push(now);
    this.rateLimitStore.set(identifier, recentRequests);

    return true;
  }
}

export class PerformanceValidator {
  static validateImageOptimization(images) {
    const recommendations = [];

    for (const image of images) {
      if (image.size > 5 * 1024 * 1024) { // 5MB
        recommendations.push({
          type: 'warning',
          message: `Image ${image.originalname} is large (${Math.round(image.size / 1024 / 1024)}MB). Consider compressing it for better performance.`
        });
      }

      if (!['image/jpeg', 'image/webp'].includes(image.mimetype)) {
        recommendations.push({
          type: 'info',
          message: `Consider converting ${image.originalname} to WebP format for better compression.`
        });
      }
    }

    return recommendations;
  }

  static validateCodeComplexity(code) {
    const lines = code.split('\n').length;
    const complexity = {
      lines,
      functions: (code.match(/function\s+\w+|const\s+\w+\s*=\s*\(/g) || []).length,
      classes: (code.match(/class\s+\w+/g) || []).length
    };

    const recommendations = [];

    if (complexity.lines > 500) {
      recommendations.push({
        type: 'warning',
        message: 'Generated code is quite large. Consider breaking it into smaller components.'
      });
    }

    if (complexity.functions > 20) {
      recommendations.push({
        type: 'info',
        message: 'Consider using a modular architecture with separate files for better maintainability.'
      });
    }

    return { complexity, recommendations };
  }
}

export function createValidationMiddleware(validator) {
  return (req, res, next) => {
    try {
      validator(req.body || req.files);
      next();
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          error: error.message,
          field: error.field,
          code: error.code,
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal validation error',
          timestamp: new Date().toISOString()
        });
      }
    }
  };
}
