// Thumbnail Service - renders PDF pages using pdfjs-dist
import * as pdfjsLib from 'pdfjs-dist';
import { THUMBNAIL_WIDTH, THUMBNAIL_QUALITY, THUMBNAIL_FORMAT } from '../../shared/constants';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export interface ThumbnailOptions {
  width?: number;
  quality?: number;
  format?: 'image/jpeg' | 'image/png';
}

interface CachedPdfDocument {
  pdf: pdfjsLib.PDFDocumentProxy;
  lastAccess: number;
}

export class ThumbnailService {
  private pdfCache: Map<string, CachedPdfDocument> = new Map();
  private pendingLoads: Map<string, Promise<pdfjsLib.PDFDocumentProxy>> = new Map();
  private readonly MAX_CACHED_PDFS = 10;

  /**
   * Load a PDF document for thumbnail generation
   */
  private async loadPdf(documentId: string, bytes: Uint8Array): Promise<pdfjsLib.PDFDocumentProxy> {
    // Check cache
    const cached = this.pdfCache.get(documentId);
    if (cached) {
      cached.lastAccess = Date.now();
      return cached.pdf;
    }

    // Check if already loading
    const pending = this.pendingLoads.get(documentId);
    if (pending) {
      return pending;
    }

    // Load the PDF
    const loadPromise = (async () => {
      const loadingTask = pdfjsLib.getDocument({
        data: bytes,
        cMapUrl: 'https://unpkg.com/pdfjs-dist/cmaps/',
        cMapPacked: true
      });

      const pdf = await loadingTask.promise;
      
      // Cache the loaded PDF
      this.pdfCache.set(documentId, {
        pdf,
        lastAccess: Date.now()
      });

      // Evict old entries if needed
      this.evictOldEntries();

      this.pendingLoads.delete(documentId);
      return pdf;
    })();

    this.pendingLoads.set(documentId, loadPromise);
    return loadPromise;
  }

  /**
   * Evict least recently used PDF documents
   */
  private evictOldEntries(): void {
    if (this.pdfCache.size <= this.MAX_CACHED_PDFS) return;

    const entries = Array.from(this.pdfCache.entries());
    entries.sort((a, b) => a[1].lastAccess - b[1].lastAccess);

    const toRemove = entries.slice(0, entries.length - this.MAX_CACHED_PDFS);
    for (const [key, value] of toRemove) {
      value.pdf.destroy();
      this.pdfCache.delete(key);
    }
  }

  /**
   * Generate a thumbnail for a specific page
   */
  async generateThumbnail(
    documentId: string,
    bytes: Uint8Array,
    pageIndex: number,
    rotation: number = 0,
    options: ThumbnailOptions = {}
  ): Promise<string> {
    const {
      width = THUMBNAIL_WIDTH,
      quality = THUMBNAIL_QUALITY,
      format = THUMBNAIL_FORMAT as 'image/jpeg' | 'image/png'
    } = options;

    const pdf = await this.loadPdf(documentId, bytes);
    const page = await pdf.getPage(pageIndex + 1); // pdfjs uses 1-based indexing

    // Calculate scale to fit desired width
    const viewport = page.getViewport({ scale: 1, rotation });
    const scale = width / viewport.width;
    const scaledViewport = page.getViewport({ scale, rotation });

    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = Math.floor(scaledViewport.width);
    canvas.height = Math.floor(scaledViewport.height);

    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Failed to get canvas context');
    }

    // Render page to canvas
    await page.render({
      canvasContext: context,
      viewport: scaledViewport
    }).promise;

    // Convert to data URL
    const dataUrl = canvas.toDataURL(format, quality);

    // Clean up
    canvas.remove();

    return dataUrl;
  }

  /**
   * Clear cached PDF for a document
   */
  clearDocument(documentId: string): void {
    const cached = this.pdfCache.get(documentId);
    if (cached) {
      cached.pdf.destroy();
      this.pdfCache.delete(documentId);
    }
    this.pendingLoads.delete(documentId);
  }

  /**
   * Clear all cached PDFs
   */
  clearAll(): void {
    for (const cached of this.pdfCache.values()) {
      cached.pdf.destroy();
    }
    this.pdfCache.clear();
    this.pendingLoads.clear();
  }
}

// Singleton instance
export const thumbnailService = new ThumbnailService();
