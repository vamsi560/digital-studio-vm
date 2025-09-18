// Caching and performance optimization utilities

import crypto from 'crypto';

export class CacheManager {
  constructor() {
    this.memoryCache = new Map();
    this.cacheStats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0
    };
  }

  generateCacheKey(data) {
    // Create a hash of the input data for consistent cache keys
    const stringified = JSON.stringify(data, Object.keys(data).sort());
    return crypto.createHash('md5').update(stringified).digest('hex');
  }

  get(key) {
    const item = this.memoryCache.get(key);
    if (item) {
      // Check if item has expired
      if (item.expiresAt && Date.now() > item.expiresAt) {
        this.memoryCache.delete(key);
        this.cacheStats.misses++;
        return null;
      }
      this.cacheStats.hits++;
      return item.data;
    }
    this.cacheStats.misses++;
    return null;
  }

  set(key, data, ttlMs = 300000) { // Default 5 minutes
    const expiresAt = Date.now() + ttlMs;
    this.memoryCache.set(key, { data, expiresAt });
    this.cacheStats.sets++;
    
    // Clean up expired items periodically
    if (this.cacheStats.sets % 100 === 0) {
      this.cleanup();
    }
  }

  delete(key) {
    const deleted = this.memoryCache.delete(key);
    if (deleted) {
      this.cacheStats.deletes++;
    }
    return deleted;
  }

  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.memoryCache.entries()) {
      if (item.expiresAt && now > item.expiresAt) {
        this.memoryCache.delete(key);
      }
    }
  }

  getStats() {
    const total = this.cacheStats.hits + this.cacheStats.misses;
    return {
      ...this.cacheStats,
      hitRate: total > 0 ? (this.cacheStats.hits / total * 100).toFixed(2) + '%' : '0%',
      size: this.memoryCache.size
    };
  }

  clear() {
    this.memoryCache.clear();
    this.cacheStats = { hits: 0, misses: 0, sets: 0, deletes: 0 };
  }
}

export class CodeGenerationCache {
  constructor() {
    this.cache = new CacheManager();
    this.generationCache = new Map(); // For tracking ongoing generations
  }

  async getCachedGeneration(images, options) {
    const cacheKey = this.cache.generateCacheKey({ images: images.map(img => img.data), options });
    return this.cache.get(cacheKey);
  }

  async setCachedGeneration(images, options, result) {
    const cacheKey = this.cache.generateCacheKey({ images: images.map(img => img.data), options });
    // Cache for 1 hour for code generation results
    this.cache.set(cacheKey, result, 3600000);
  }

  async getOrGenerate(images, options, generator) {
    // Check if generation is already in progress
    const progressKey = this.cache.generateCacheKey({ images: images.map(img => img.data), options });
    
    if (this.generationCache.has(progressKey)) {
      // Return the existing promise
      return this.generationCache.get(progressKey);
    }

    // Check cache first
    const cached = await this.getCachedGeneration(images, options);
    if (cached) {
      return cached;
    }

    // Start new generation
    const generationPromise = generator(images, options);
    this.generationCache.set(progressKey, generationPromise);

    try {
      const result = await generationPromise;
      await this.setCachedGeneration(images, options, result);
      return result;
    } finally {
      this.generationCache.delete(progressKey);
    }
  }

  getStats() {
    return this.cache.getStats();
  }
}

export class ImageProcessor {
  static async optimizeImage(buffer, maxWidth = 1920, quality = 0.8) {
    // This would integrate with Sharp or similar image processing library
    // For now, return the original buffer
    return buffer;
  }

  static async extractImageFeatures(buffer) {
    // Extract basic image features for caching and comparison
    const hash = crypto.createHash('md5').update(buffer).digest('hex');
    return {
      hash,
      size: buffer.length,
      // Add more features as needed
    };
  }
}

export class PerformanceMonitor {
  constructor() {
    this.metrics = {
      requestCount: 0,
      totalResponseTime: 0,
      averageResponseTime: 0,
      errorCount: 0,
      cacheHitRate: 0
    };
  }

  startTimer() {
    return Date.now();
  }

  endTimer(startTime) {
    return Date.now() - startTime;
  }

  recordRequest(responseTime, isError = false, cacheHit = false) {
    this.metrics.requestCount++;
    this.metrics.totalResponseTime += responseTime;
    this.metrics.averageResponseTime = this.metrics.totalResponseTime / this.metrics.requestCount;
    
    if (isError) {
      this.metrics.errorCount++;
    }
  }

  getMetrics() {
    return {
      ...this.metrics,
      errorRate: this.metrics.requestCount > 0 ? 
        (this.metrics.errorCount / this.metrics.requestCount * 100).toFixed(2) + '%' : '0%'
    };
  }

  reset() {
    this.metrics = {
      requestCount: 0,
      totalResponseTime: 0,
      averageResponseTime: 0,
      errorCount: 0,
      cacheHitRate: 0
    };
  }
}

export class RequestThrottler {
  constructor(maxRequests = 10, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }

  isAllowed(identifier) {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    if (!this.requests.has(identifier)) {
      this.requests.set(identifier, []);
    }
    
    const userRequests = this.requests.get(identifier);
    const recentRequests = userRequests.filter(timestamp => timestamp > windowStart);
    
    if (recentRequests.length >= this.maxRequests) {
      return false;
    }
    
    recentRequests.push(now);
    this.requests.set(identifier, recentRequests);
    
    return true;
  }

  getRemainingRequests(identifier) {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    if (!this.requests.has(identifier)) {
      return this.maxRequests;
    }
    
    const userRequests = this.requests.get(identifier);
    const recentRequests = userRequests.filter(timestamp => timestamp > windowStart);
    
    return Math.max(0, this.maxRequests - recentRequests.length);
  }

  cleanup() {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    for (const [identifier, requests] of this.requests.entries()) {
      const recentRequests = requests.filter(timestamp => timestamp > windowStart);
      if (recentRequests.length === 0) {
        this.requests.delete(identifier);
      } else {
        this.requests.set(identifier, recentRequests);
      }
    }
  }
}

// Global instances
export const codeGenerationCache = new CodeGenerationCache();
export const performanceMonitor = new PerformanceMonitor();
export const requestThrottler = new RequestThrottler();

// Cleanup interval
setInterval(() => {
  codeGenerationCache.cache.cleanup();
  requestThrottler.cleanup();
}, 300000); // Every 5 minutes
