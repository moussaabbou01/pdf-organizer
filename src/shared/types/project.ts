// Shared type definitions for PDF Organizer

export type Rotation = 0 | 90 | 180 | 270;

export interface Project {
  id: string;
  name: string;
  createdAt: number;
  modifiedAt: number;
  documents: Document[];
  outputPages: PageReference[];
  isDirty: boolean;
}

export interface Document {
  id: string;
  filePath: string;
  fileName: string;
  pageCount: number;
  fileSize: number;
  loadedAt: number;
  pages: Page[];
}

export interface Page {
  id: string;
  documentId: string;
  originalIndex: number;
  rotation: Rotation;
  thumbnailCacheKey: string;
}

export interface PageReference {
  id: string;
  pageId: string;
  documentId: string;
  position: number;
}

export function createEmptyProject(name: string = 'Untitled Project'): Project {
  return {
    id: crypto.randomUUID(),
    name,
    createdAt: Date.now(),
    modifiedAt: Date.now(),
    documents: [],
    outputPages: [],
    isDirty: false
  };
}

export function createDocument(
  filePath: string,
  fileName: string,
  pageCount: number,
  fileSize: number
): Document {
  const docId = crypto.randomUUID();
  const pages: Page[] = [];
  
  for (let i = 0; i < pageCount; i++) {
    pages.push({
      id: crypto.randomUUID(),
      documentId: docId,
      originalIndex: i,
      rotation: 0,
      thumbnailCacheKey: `${docId}-${i}-0`
    });
  }
  
  return {
    id: docId,
    filePath,
    fileName,
    pageCount,
    fileSize,
    loadedAt: Date.now(),
    pages
  };
}

export function createPageReference(page: Page, position: number): PageReference {
  return {
    id: crypto.randomUUID(),
    pageId: page.id,
    documentId: page.documentId,
    position
  };
}
