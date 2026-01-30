/**
 * Export Worker
 * 
 * Handles PDF export operations in a worker thread to avoid blocking the main process.
 * Uses pdf-lib for PDF manipulation.
 */

import { parentPort } from 'worker_threads';
import { PDFDocument, degrees } from 'pdf-lib';
import * as fs from 'fs/promises';

interface PageToExport {
  sourceFilePath: string;
  pageIndex: number;
  rotation: number;
}

interface ExportRequest {
  id: string;
  outputPath: string;
  pages: PageToExport[];
}

interface ExportProgress {
  id: string;
  phase: 'loading' | 'processing' | 'saving';
  current: number;
  total: number;
  percentage: number;
}

interface ExportResponse {
  id: string;
  success: boolean;
  outputPath?: string;
  pageCount?: number;
  fileSize?: number;
  error?: string;
}

// PDF document cache
const pdfCache = new Map<string, PDFDocument>();

async function loadPdfDocument(filePath: string): Promise<PDFDocument> {
  if (pdfCache.has(filePath)) {
    return pdfCache.get(filePath)!;
  }

  const bytes = await fs.readFile(filePath);
  const pdf = await PDFDocument.load(bytes, {
    ignoreEncryption: true
  });

  pdfCache.set(filePath, pdf);
  return pdf;
}

function sendProgress(progress: ExportProgress): void {
  parentPort?.postMessage({ type: 'progress', data: progress });
}

async function exportPdf(request: ExportRequest): Promise<ExportResponse> {
  const { id, outputPath, pages } = request;

  try {
    // Phase 1: Loading source documents
    const uniqueFilePaths = [...new Set(pages.map(p => p.sourceFilePath))];
    
    for (let i = 0; i < uniqueFilePaths.length; i++) {
      sendProgress({
        id,
        phase: 'loading',
        current: i + 1,
        total: uniqueFilePaths.length,
        percentage: Math.round(((i + 1) / uniqueFilePaths.length) * 33)
      });
      await loadPdfDocument(uniqueFilePaths[i]);
    }

    // Phase 2: Processing pages
    const outputPdf = await PDFDocument.create();

    for (let i = 0; i < pages.length; i++) {
      const { sourceFilePath, pageIndex, rotation } = pages[i];

      sendProgress({
        id,
        phase: 'processing',
        current: i + 1,
        total: pages.length,
        percentage: 33 + Math.round(((i + 1) / pages.length) * 34)
      });

      const sourcePdf = await loadPdfDocument(sourceFilePath);
      const [copiedPage] = await outputPdf.copyPages(sourcePdf, [pageIndex]);

      // Apply rotation if needed
      if (rotation !== 0) {
        const currentRotation = copiedPage.getRotation().angle;
        copiedPage.setRotation(degrees(currentRotation + rotation));
      }

      outputPdf.addPage(copiedPage);
    }

    // Phase 3: Saving
    sendProgress({
      id,
      phase: 'saving',
      current: 0,
      total: 1,
      percentage: 67
    });

    const pdfBytes = await outputPdf.save({
      useObjectStreams: true
    });

    await fs.writeFile(outputPath, pdfBytes);

    sendProgress({
      id,
      phase: 'saving',
      current: 1,
      total: 1,
      percentage: 100
    });

    return {
      id,
      success: true,
      outputPath,
      pageCount: pages.length,
      fileSize: pdfBytes.length
    };
  } catch (error) {
    return {
      id,
      success: false,
      error: error instanceof Error ? error.message : 'Export failed'
    };
  }
}

// Handle messages from main process
parentPort?.on('message', async (message: { type: string; data: any }) => {
  switch (message.type) {
    case 'export':
      const result = await exportPdf(message.data as ExportRequest);
      parentPort?.postMessage({ type: 'result', data: result });
      break;

    case 'clear-cache':
      pdfCache.clear();
      parentPort?.postMessage({ type: 'cache-cleared' });
      break;

    case 'remove-from-cache':
      const filePath = message.data as string;
      pdfCache.delete(filePath);
      parentPort?.postMessage({ type: 'removed-from-cache', data: filePath });
      break;
  }
});

// Notify ready
parentPort?.postMessage({ type: 'ready' });
