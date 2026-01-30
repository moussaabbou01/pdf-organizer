// Project state slice - manages PDF documents and pages
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import {
  Project,
  Document,
  Page,
  PageReference,
  Rotation,
  createEmptyProject,
  createPageReference
} from '../../shared/types/project';

interface ProjectState {
  project: Project;
  
  // Actions
  resetProject: (name?: string) => void;
  setProject: (project: Project) => void;
  markDirty: () => void;
  markClean: () => void;
  
  // Document operations
  addDocument: (document: Document) => void;
  removeDocument: (documentId: string) => void;
  
  // Page operations
  addPagesToOutput: (documentId: string, pageIds: string[], insertIndex?: number) => void;
  removePagesFromOutput: (pageRefIds: string[]) => void;
  reorderPages: (activeId: string, overId: string) => void;
  movePagesToIndex: (pageRefIds: string[], targetIndex: number) => void;
  rotatePage: (pageId: string, clockwise: boolean) => void;
  rotateSelectedPages: (pageRefIds: string[], clockwise: boolean) => void;
  
  // Helpers
  getPageById: (pageId: string) => Page | undefined;
  getDocumentById: (documentId: string) => Document | undefined;
  getPageRefById: (pageRefId: string) => PageReference | undefined;
}

export const useProjectStore = create<ProjectState>()(
  immer((set, get) => ({
    project: createEmptyProject(),

    resetProject: (name?: string) => {
      set((state) => {
        state.project = createEmptyProject(name);
      });
    },

    setProject: (project: Project) => {
      set((state) => {
        state.project = project;
      });
    },

    markDirty: () => {
      set((state) => {
        state.project.isDirty = true;
        state.project.modifiedAt = Date.now();
      });
    },

    markClean: () => {
      set((state) => {
        state.project.isDirty = false;
      });
    },

    addDocument: (document: Document) => {
      set((state) => {
        state.project.documents.push(document);
        
        // Add all pages to output
        const startIndex = state.project.outputPages.length;
        document.pages.forEach((page, idx) => {
          const pageRef = createPageReference(page, startIndex + idx);
          state.project.outputPages.push(pageRef);
        });
        
        state.project.isDirty = true;
        state.project.modifiedAt = Date.now();
      });
    },

    removeDocument: (documentId: string) => {
      set((state) => {
        // Remove document
        state.project.documents = state.project.documents.filter(
          (d) => d.id !== documentId
        );
        
        // Remove all page references from this document
        state.project.outputPages = state.project.outputPages.filter(
          (pr) => pr.documentId !== documentId
        );
        
        // Re-index positions
        state.project.outputPages.forEach((pr, idx) => {
          pr.position = idx;
        });
        
        state.project.isDirty = true;
        state.project.modifiedAt = Date.now();
      });
    },

    addPagesToOutput: (documentId: string, pageIds: string[], insertIndex?: number) => {
      set((state) => {
        const document = state.project.documents.find((d) => d.id === documentId);
        if (!document) return;

        const pagesToAdd = pageIds
          .map((id) => document.pages.find((p) => p.id === id))
          .filter((p): p is Page => p !== undefined);

        const targetIndex = insertIndex ?? state.project.outputPages.length;
        
        const newRefs = pagesToAdd.map((page, idx) =>
          createPageReference(page, targetIndex + idx)
        );

        state.project.outputPages.splice(targetIndex, 0, ...newRefs);
        
        // Re-index positions
        state.project.outputPages.forEach((pr, idx) => {
          pr.position = idx;
        });

        state.project.isDirty = true;
        state.project.modifiedAt = Date.now();
      });
    },

    removePagesFromOutput: (pageRefIds: string[]) => {
      set((state) => {
        state.project.outputPages = state.project.outputPages.filter(
          (pr) => !pageRefIds.includes(pr.id)
        );
        
        // Re-index positions
        state.project.outputPages.forEach((pr, idx) => {
          pr.position = idx;
        });

        state.project.isDirty = true;
        state.project.modifiedAt = Date.now();
      });
    },

    reorderPages: (activeId: string, overId: string) => {
      set((state) => {
        const oldIndex = state.project.outputPages.findIndex((p) => p.id === activeId);
        const newIndex = state.project.outputPages.findIndex((p) => p.id === overId);
        
        if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

        const [removed] = state.project.outputPages.splice(oldIndex, 1);
        state.project.outputPages.splice(newIndex, 0, removed);
        
        // Re-index positions
        state.project.outputPages.forEach((pr, idx) => {
          pr.position = idx;
        });

        state.project.isDirty = true;
        state.project.modifiedAt = Date.now();
      });
    },

    movePagesToIndex: (pageRefIds: string[], targetIndex: number) => {
      set((state) => {
        // Extract pages to move
        const toMove = state.project.outputPages.filter((pr) =>
          pageRefIds.includes(pr.id)
        );
        
        // Remove them from current positions
        state.project.outputPages = state.project.outputPages.filter(
          (pr) => !pageRefIds.includes(pr.id)
        );
        
        // Calculate adjusted target index
        const adjustedIndex = Math.min(targetIndex, state.project.outputPages.length);
        
        // Insert at new position
        state.project.outputPages.splice(adjustedIndex, 0, ...toMove);
        
        // Re-index positions
        state.project.outputPages.forEach((pr, idx) => {
          pr.position = idx;
        });

        state.project.isDirty = true;
        state.project.modifiedAt = Date.now();
      });
    },

    rotatePage: (pageId: string, clockwise: boolean) => {
      set((state) => {
        for (const doc of state.project.documents) {
          const page = doc.pages.find((p) => p.id === pageId);
          if (page) {
            const delta = clockwise ? 90 : -90;
            let newRotation = (page.rotation + delta) % 360;
            if (newRotation < 0) newRotation += 360;
            page.rotation = newRotation as Rotation;
            page.thumbnailCacheKey = `${doc.id}-${page.originalIndex}-${page.rotation}`;
            break;
          }
        }

        state.project.isDirty = true;
        state.project.modifiedAt = Date.now();
      });
    },

    rotateSelectedPages: (pageRefIds: string[], clockwise: boolean) => {
      set((state) => {
        const pageIds = new Set(
          state.project.outputPages
            .filter((pr) => pageRefIds.includes(pr.id))
            .map((pr) => pr.pageId)
        );

        for (const doc of state.project.documents) {
          for (const page of doc.pages) {
            if (pageIds.has(page.id)) {
              const delta = clockwise ? 90 : -90;
              let newRotation = (page.rotation + delta) % 360;
              if (newRotation < 0) newRotation += 360;
              page.rotation = newRotation as Rotation;
              page.thumbnailCacheKey = `${doc.id}-${page.originalIndex}-${page.rotation}`;
            }
          }
        }

        state.project.isDirty = true;
        state.project.modifiedAt = Date.now();
      });
    },

    getPageById: (pageId: string) => {
      const state = get();
      for (const doc of state.project.documents) {
        const page = doc.pages.find((p) => p.id === pageId);
        if (page) return page;
      }
      return undefined;
    },

    getDocumentById: (documentId: string) => {
      return get().project.documents.find((d) => d.id === documentId);
    },

    getPageRefById: (pageRefId: string) => {
      return get().project.outputPages.find((pr) => pr.id === pageRefId);
    }
  }))
);
