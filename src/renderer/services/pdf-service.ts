// PDF Service - wraps pdf-lib for PDF manipulation
import { PDFDocument, degrees, PDFPage } from 'pdf-lib';
import { Document, Page, Rotation, createDocument } from '../../shared/types/project';
import { getFileName } from '../../shared/utils/path-utils';

export interface LoadedPdfInfo {
  document: Document;
  pdfDoc: PDFDocument;
  bytes: Uint8Array;
}

export class PdfService {
  private loadedDocs: Map<string, PDFDocument> = new Map();
  private docBytes: Map<string, Uint8Array> = new Map();

  /**
   * Load a PDF file and extract metadata
   */
  async loadPdf(filePath: string): Promise<LoadedPdfInfo> {
    const result = await window.electronAPI.readFile(filePath);
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to read file');
    }

    const bytes = new Uint8Array(result.data);
    const pdfDoc = await PDFDocument.load(bytes, {
      ignoreEncryption: true
    });

    const pageCount = pdfDoc.getPageCount();
    const fileInfo = await window.electronAPI.getFileInfo(filePath);
    const fileSize = fileInfo.success ? fileInfo.size! : bytes.length;

    const document = createDocument(
      filePath,
      getFileName(filePath),
      pageCount,
      fileSize
    );

    // Cache the loaded document
    this.loadedDocs.set(document.id, pdfDoc);
    this.docBytes.set(document.id, bytes);

    return { document, pdfDoc, bytes };
  }

  /**
   * Get a loaded PDF document by ID
   */
  getLoadedDoc(documentId: string): PDFDocument | undefined {
    return this.loadedDocs.get(documentId);
  }

  /**
   * Get raw bytes for a document
   */
  getDocBytes(documentId: string): Uint8Array | undefined {
    return this.docBytes.get(documentId);
  }

  /**
   * Unload a document from cache
   */
  unloadDoc(documentId: string): void {
    this.loadedDocs.delete(documentId);
    this.docBytes.delete(documentId);
  }

  /**
   * Clear all cached documents
   */
  clearCache(): void {
    this.loadedDocs.clear();
    this.docBytes.clear();
  }

  /**
   * Get page dimensions
   */
  getPageDimensions(documentId: string, pageIndex: number): { width: number; height: number } | null {
    const pdfDoc = this.loadedDocs.get(documentId);
    if (!pdfDoc) return null;

    const page = pdfDoc.getPage(pageIndex);
    const { width, height } = page.getSize();
    return { width, height };
  }

  /**
   * Rotate a page (returns new rotation value)
   */
  rotatePage(currentRotation: Rotation, clockwise: boolean): Rotation {
    const delta = clockwise ? 90 : -90;
    let newRotation = (currentRotation + delta) % 360;
    if (newRotation < 0) newRotation += 360;
    return newRotation as Rotation;
  }
}

// Singleton instance
export const pdfService = new PdfService();
