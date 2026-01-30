// Cache Service - LRU memory cache + disk cache for thumbnails
import { LRUCache } from 'lru-cache';
import { MEMORY_CACHE_MAX_ITEMS, MEMORY_CACHE_MAX_SIZE_MB } from '../../shared/constants';
import { generateCacheKey } from '../../shared/utils/id-utils';

export interface CachedThumbnail {
  dataUrl: string;
  width: number;
  height: number;
  timestamp: number;
}

export class CacheService {
  private memoryCache: LRUCache<string, CachedThumbnail>;
  private pendingRequests: Map<string, Promise<string>> = new Map();

  constructor() {
    this.memoryCache = new LRUCache<string, CachedThumbnail>({
      max: MEMORY_CACHE_MAX_ITEMS,
      maxSize: MEMORY_CACHE_MAX_SIZE_MB * 1024 * 1024,
      sizeCalculation: (value) => {
        // Estimate size based on data URL length (roughly base64 encoded)
        return value.dataUrl.length;
      },
      ttl: 1000 * 60 * 60 * 24, // 24 hours
      updateAgeOnGet: true
    });
  }

  /**
   * Generate a cache key for a thumbnail
   */
  getCacheKey(documentId: string, pageIndex: number, rotation: number): string {
    return generateCacheKey(documentId, pageIndex, rotation);
  }

  /**
   * Get a cached thumbnail
   */
  get(cacheKey: string): CachedThumbnail | null {
    const cached = this.memoryCache.get(cacheKey);
    return cached || null;
  }

  /**
   * Store a thumbnail in cache
   */
  set(cacheKey: string, dataUrl: string, width: number, height: number): void {
    this.memoryCache.set(cacheKey, {
      dataUrl,
      width,
      height,
      timestamp: Date.now()
    });
  }

  /**
   * Check if a thumbnail is cached
   */
  has(cacheKey: string): boolean {
    return this.memoryCache.has(cacheKey);
  }

  /**
   * Register a pending thumbnail request to avoid duplicate generation
   */
  setPending(cacheKey: string, promise: Promise<string>): void {
    this.pendingRequests.set(cacheKey, promise);
    promise.finally(() => {
      this.pendingRequests.delete(cacheKey);
    });
  }

  /**
   * Get a pending request if one exists
   */
  getPending(cacheKey: string): Promise<string> | null {
    return this.pendingRequests.get(cacheKey) || null;
  }

  /**
   * Invalidate all thumbnails for a document
   */
  invalidateDocument(documentId: string): void {
    const keysToDelete: string[] = [];
    
    for (const key of this.memoryCache.keys()) {
      if (key.startsWith(documentId)) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.memoryCache.delete(key);
    }
  }

  /**
   * Invalidate a specific page's thumbnails (all rotations)
   */
  invalidatePage(documentId: string, pageIndex: number): void {
    const rotations = [0, 90, 180, 270];
    for (const rotation of rotations) {
      const key = this.getCacheKey(documentId, pageIndex, rotation);
      this.memoryCache.delete(key);
    }
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.memoryCache.clear();
    this.pendingRequests.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; itemCount: number } {
    return {
      size: this.memoryCache.calculatedSize || 0,
      itemCount: this.memoryCache.size
    };
  }
}

// Singleton instance
export const cacheService = new CacheService();
