// Integration tests for cache service
import { describe, it, expect, beforeEach } from 'vitest';
import { CacheService } from '../../renderer/services/cache-service';

describe('Cache Service', () => {
  let cacheService: CacheService;

  beforeEach(() => {
    cacheService = new CacheService();
  });

  it('should store and retrieve thumbnails', () => {
    const cacheKey = cacheService.getCacheKey('doc1', 0, 0);
    const dataUrl = 'data:image/jpeg;base64,/9j/4AAQ...';
    
    cacheService.set(cacheKey, dataUrl, 150, 200);
    
    const cached = cacheService.get(cacheKey);
    
    expect(cached).not.toBeNull();
    expect(cached?.dataUrl).toBe(dataUrl);
    expect(cached?.width).toBe(150);
    expect(cached?.height).toBe(200);
  });

  it('should report has() correctly', () => {
    const cacheKey = cacheService.getCacheKey('doc1', 0, 0);
    
    expect(cacheService.has(cacheKey)).toBe(false);
    
    cacheService.set(cacheKey, 'data:...', 150, 200);
    
    expect(cacheService.has(cacheKey)).toBe(true);
  });

  it('should invalidate document cache', () => {
    cacheService.set(cacheService.getCacheKey('doc1', 0, 0), 'data:...', 150, 200);
    cacheService.set(cacheService.getCacheKey('doc1', 1, 0), 'data:...', 150, 200);
    cacheService.set(cacheService.getCacheKey('doc2', 0, 0), 'data:...', 150, 200);
    
    cacheService.invalidateDocument('doc1');
    
    expect(cacheService.has(cacheService.getCacheKey('doc1', 0, 0))).toBe(false);
    expect(cacheService.has(cacheService.getCacheKey('doc1', 1, 0))).toBe(false);
    expect(cacheService.has(cacheService.getCacheKey('doc2', 0, 0))).toBe(true);
  });

  it('should invalidate page cache (all rotations)', () => {
    cacheService.set(cacheService.getCacheKey('doc1', 0, 0), 'data:...', 150, 200);
    cacheService.set(cacheService.getCacheKey('doc1', 0, 90), 'data:...', 150, 200);
    cacheService.set(cacheService.getCacheKey('doc1', 1, 0), 'data:...', 150, 200);
    
    cacheService.invalidatePage('doc1', 0);
    
    expect(cacheService.has(cacheService.getCacheKey('doc1', 0, 0))).toBe(false);
    expect(cacheService.has(cacheService.getCacheKey('doc1', 0, 90))).toBe(false);
    expect(cacheService.has(cacheService.getCacheKey('doc1', 1, 0))).toBe(true);
  });

  it('should clear all cache', () => {
    cacheService.set(cacheService.getCacheKey('doc1', 0, 0), 'data:...', 150, 200);
    cacheService.set(cacheService.getCacheKey('doc2', 0, 0), 'data:...', 150, 200);
    
    cacheService.clear();
    
    expect(cacheService.getStats().itemCount).toBe(0);
  });

  it('should track pending requests', () => {
    const cacheKey = cacheService.getCacheKey('doc1', 0, 0);
    const promise = Promise.resolve('data:...');
    
    expect(cacheService.getPending(cacheKey)).toBeNull();
    
    cacheService.setPending(cacheKey, promise);
    
    expect(cacheService.getPending(cacheKey)).toBe(promise);
  });
});
