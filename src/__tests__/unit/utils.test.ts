// Unit tests for utility functions
import { describe, it, expect } from 'vitest';
import {
  getFileName,
  getFileNameWithoutExtension,
  getFileExtension,
  isPdfFile,
  generateOutputFileName,
  sanitizeFileName
} from '../../shared/utils/path-utils';
import {
  generateCacheKey,
  parseCacheKey,
  generateShortId
} from '../../shared/utils/id-utils';

describe('Path Utils', () => {
  describe('getFileName', () => {
    it('should extract file name from path', () => {
      expect(getFileName('/path/to/file.pdf')).toBe('file.pdf');
      expect(getFileName('C:\\Documents\\file.pdf')).toBe('file.pdf');
      expect(getFileName('file.pdf')).toBe('file.pdf');
    });
  });

  describe('getFileNameWithoutExtension', () => {
    it('should extract file name without extension', () => {
      expect(getFileNameWithoutExtension('/path/to/file.pdf')).toBe('file');
      expect(getFileNameWithoutExtension('document.report.pdf')).toBe('document.report');
    });
  });

  describe('getFileExtension', () => {
    it('should extract file extension', () => {
      expect(getFileExtension('/path/to/file.pdf')).toBe('.pdf');
      expect(getFileExtension('file.PDF')).toBe('.pdf');
      expect(getFileExtension('file')).toBe('');
    });
  });

  describe('isPdfFile', () => {
    it('should identify PDF files', () => {
      expect(isPdfFile('file.pdf')).toBe(true);
      expect(isPdfFile('file.PDF')).toBe(true);
      expect(isPdfFile('file.txt')).toBe(false);
      expect(isPdfFile('file')).toBe(false);
    });
  });

  describe('generateOutputFileName', () => {
    it('should generate output file name', () => {
      expect(generateOutputFileName(['/path/to/doc.pdf'])).toBe('doc_merged.pdf');
      expect(generateOutputFileName(['/path/to/doc.pdf'], '_combined')).toBe('doc_combined.pdf');
      expect(generateOutputFileName([])).toBe('output_merged.pdf');
    });
  });

  describe('sanitizeFileName', () => {
    it('should remove invalid characters', () => {
      expect(sanitizeFileName('file<>:"/\\|?*.pdf')).toBe('file_________.pdf');
      expect(sanitizeFileName('normal-file.pdf')).toBe('normal-file.pdf');
    });
  });
});

describe('ID Utils', () => {
  describe('generateCacheKey', () => {
    it('should generate consistent cache keys', () => {
      const key1 = generateCacheKey('doc1', 0, 0);
      const key2 = generateCacheKey('doc1', 0, 0);
      const key3 = generateCacheKey('doc1', 0, 90);
      
      expect(key1).toBe(key2);
      expect(key1).not.toBe(key3);
    });
  });

  describe('parseCacheKey', () => {
    it('should parse valid cache keys', () => {
      const key = generateCacheKey('doc-123', 5, 90);
      const parsed = parseCacheKey(key);
      
      expect(parsed).not.toBeNull();
      expect(parsed?.documentId).toBe('doc-123');
      expect(parsed?.pageIndex).toBe(5);
      expect(parsed?.rotation).toBe(90);
    });

    it('should return null for invalid keys', () => {
      expect(parseCacheKey('invalid')).toBeNull();
      expect(parseCacheKey('')).toBeNull();
    });
  });

  describe('generateShortId', () => {
    it('should generate 8-character IDs', () => {
      const id = generateShortId();
      expect(id).toHaveLength(8);
    });
  });
});
