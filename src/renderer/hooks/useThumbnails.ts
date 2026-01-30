// Hook for thumbnail loading and caching
import { useState, useEffect, useCallback, useRef } from 'react';
import { thumbnailService } from '../services/thumbnail-service';
import { cacheService } from '../services/cache-service';
import { pdfService } from '../services/pdf-service';
import { THUMBNAIL_WIDTH } from '../../shared/constants';

interface UseThumbnailOptions {
  documentId: string;
  pageIndex: number;
  rotation: number;
  priority?: 'high' | 'normal' | 'low';
}

interface ThumbnailState {
  dataUrl: string | null;
  isLoading: boolean;
  error: string | null;
}

export function useThumbnail({
  documentId,
  pageIndex,
  rotation,
  priority = 'normal'
}: UseThumbnailOptions): ThumbnailState {
  const [state, setState] = useState<ThumbnailState>({
    dataUrl: null,
    isLoading: true,
    error: null
  });

  const abortController = useRef<AbortController | null>(null);

  useEffect(() => {
    // Cancel previous request
    if (abortController.current) {
      abortController.current.abort();
    }
    abortController.current = new AbortController();

    const cacheKey = cacheService.getCacheKey(documentId, pageIndex, rotation);

    // Check cache first
    const cached = cacheService.get(cacheKey);
    if (cached) {
      setState({
        dataUrl: cached.dataUrl,
        isLoading: false,
        error: null
      });
      return;
    }

    // Check if already loading
    const pending = cacheService.getPending(cacheKey);
    if (pending) {
      pending.then((dataUrl) => {
        if (!abortController.current?.signal.aborted) {
          setState({
            dataUrl,
            isLoading: false,
            error: null
          });
        }
      }).catch((err) => {
        if (!abortController.current?.signal.aborted) {
          setState({
            dataUrl: null,
            isLoading: false,
            error: err.message
          });
        }
      });
      return;
    }

    // Generate thumbnail
    setState({ dataUrl: null, isLoading: true, error: null });

    const bytes = pdfService.getDocBytes(documentId);
    if (!bytes) {
      setState({
        dataUrl: null,
        isLoading: false,
        error: 'Document not loaded'
      });
      return;
    }

    const generatePromise = thumbnailService.generateThumbnail(
      documentId,
      bytes,
      pageIndex,
      rotation,
      { width: THUMBNAIL_WIDTH }
    );

    cacheService.setPending(cacheKey, generatePromise);

    generatePromise
      .then((dataUrl) => {
        if (!abortController.current?.signal.aborted) {
          // Store in cache
          cacheService.set(cacheKey, dataUrl, THUMBNAIL_WIDTH, 0);
          
          setState({
            dataUrl,
            isLoading: false,
            error: null
          });
        }
      })
      .catch((err) => {
        if (!abortController.current?.signal.aborted) {
          setState({
            dataUrl: null,
            isLoading: false,
            error: err.message
          });
        }
      });

    return () => {
      abortController.current?.abort();
    };
  }, [documentId, pageIndex, rotation, priority]);

  return state;
}

/**
 * Hook to preload thumbnails for visible range
 */
export function useThumbnailPreloader(
  pages: Array<{ documentId: string; pageIndex: number; rotation: number }>,
  visibleRange: { start: number; end: number }
) {
  const preloadBuffer = 5; // Preload 5 pages before/after visible range

  useEffect(() => {
    const start = Math.max(0, visibleRange.start - preloadBuffer);
    const end = Math.min(pages.length, visibleRange.end + preloadBuffer);

    for (let i = start; i < end; i++) {
      const page = pages[i];
      if (!page) continue;

      const cacheKey = cacheService.getCacheKey(
        page.documentId,
        page.pageIndex,
        page.rotation
      );

      // Skip if already cached or loading
      if (cacheService.has(cacheKey) || cacheService.getPending(cacheKey)) {
        continue;
      }

      const bytes = pdfService.getDocBytes(page.documentId);
      if (!bytes) continue;

      // Generate in background
      const promise = thumbnailService.generateThumbnail(
        page.documentId,
        bytes,
        page.pageIndex,
        page.rotation
      );

      cacheService.setPending(cacheKey, promise);

      promise.then((dataUrl) => {
        cacheService.set(cacheKey, dataUrl, THUMBNAIL_WIDTH, 0);
      }).catch(() => {
        // Ignore preload errors
      });
    }
  }, [pages, visibleRange]);
}
