// Unit tests for project types and helpers
import { describe, it, expect } from 'vitest';
import {
  createEmptyProject,
  createDocument,
  createPageReference
} from '../../shared/types/project';

describe('Project Types', () => {
  describe('createEmptyProject', () => {
    it('should create a project with default name', () => {
      const project = createEmptyProject();
      
      expect(project.name).toBe('Untitled Project');
      expect(project.documents).toEqual([]);
      expect(project.outputPages).toEqual([]);
      expect(project.isDirty).toBe(false);
      expect(project.id).toBeDefined();
      expect(project.createdAt).toBeDefined();
      expect(project.modifiedAt).toBeDefined();
    });

    it('should create a project with custom name', () => {
      const project = createEmptyProject('My Project');
      
      expect(project.name).toBe('My Project');
    });
  });

  describe('createDocument', () => {
    it('should create a document with pages', () => {
      const doc = createDocument(
        '/path/to/file.pdf',
        'file.pdf',
        5,
        1024
      );
      
      expect(doc.filePath).toBe('/path/to/file.pdf');
      expect(doc.fileName).toBe('file.pdf');
      expect(doc.pageCount).toBe(5);
      expect(doc.fileSize).toBe(1024);
      expect(doc.pages).toHaveLength(5);
      expect(doc.id).toBeDefined();
      
      // Check pages
      doc.pages.forEach((page, index) => {
        expect(page.documentId).toBe(doc.id);
        expect(page.originalIndex).toBe(index);
        expect(page.rotation).toBe(0);
      });
    });
  });

  describe('createPageReference', () => {
    it('should create a page reference', () => {
      const doc = createDocument('/path/to/file.pdf', 'file.pdf', 1, 512);
      const page = doc.pages[0];
      
      const pageRef = createPageReference(page, 0);
      
      expect(pageRef.pageId).toBe(page.id);
      expect(pageRef.documentId).toBe(page.documentId);
      expect(pageRef.position).toBe(0);
      expect(pageRef.id).toBeDefined();
    });
  });
});
