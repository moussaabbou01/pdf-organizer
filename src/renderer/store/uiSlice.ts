// UI state slice - manages UI-related state
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { DEFAULT_ZOOM, MIN_ZOOM, MAX_ZOOM, ZOOM_STEP } from '../../shared/constants';
import { ExportProgress } from '../../shared/types/ipc';

interface UIState {
  // Zoom
  zoom: number;
  
  // Dialogs
  isExportDialogOpen: boolean;
  isProgressDialogOpen: boolean;
  isAboutDialogOpen: boolean;
  isRecoveryDialogOpen: boolean;
  
  // Progress
  exportProgress: ExportProgress | null;
  
  // Loading states
  isLoading: boolean;
  loadingMessage: string;
  
  // Drag state
  isDragging: boolean;
  draggedIds: string[];
  
  // Actions
  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  
  openExportDialog: () => void;
  closeExportDialog: () => void;
  openProgressDialog: () => void;
  closeProgressDialog: () => void;
  openAboutDialog: () => void;
  closeAboutDialog: () => void;
  openRecoveryDialog: () => void;
  closeRecoveryDialog: () => void;
  
  setExportProgress: (progress: ExportProgress | null) => void;
  
  setLoading: (isLoading: boolean, message?: string) => void;
  
  setDragging: (isDragging: boolean, ids?: string[]) => void;
}

export const useUIStore = create<UIState>()(
  immer((set) => ({
    zoom: DEFAULT_ZOOM,
    
    isExportDialogOpen: false,
    isProgressDialogOpen: false,
    isAboutDialogOpen: false,
    isRecoveryDialogOpen: false,
    
    exportProgress: null,
    
    isLoading: false,
    loadingMessage: '',
    
    isDragging: false,
    draggedIds: [],

    setZoom: (zoom: number) => {
      set((state) => {
        state.zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom));
      });
    },

    zoomIn: () => {
      set((state) => {
        state.zoom = Math.min(MAX_ZOOM, state.zoom + ZOOM_STEP);
      });
    },

    zoomOut: () => {
      set((state) => {
        state.zoom = Math.max(MIN_ZOOM, state.zoom - ZOOM_STEP);
      });
    },

    resetZoom: () => {
      set((state) => {
        state.zoom = DEFAULT_ZOOM;
      });
    },

    openExportDialog: () => {
      set((state) => {
        state.isExportDialogOpen = true;
      });
    },

    closeExportDialog: () => {
      set((state) => {
        state.isExportDialogOpen = false;
      });
    },

    openProgressDialog: () => {
      set((state) => {
        state.isProgressDialogOpen = true;
      });
    },

    closeProgressDialog: () => {
      set((state) => {
        state.isProgressDialogOpen = false;
      });
    },

    openAboutDialog: () => {
      set((state) => {
        state.isAboutDialogOpen = true;
      });
    },

    closeAboutDialog: () => {
      set((state) => {
        state.isAboutDialogOpen = false;
      });
    },

    openRecoveryDialog: () => {
      set((state) => {
        state.isRecoveryDialogOpen = true;
      });
    },

    closeRecoveryDialog: () => {
      set((state) => {
        state.isRecoveryDialogOpen = false;
      });
    },

    setExportProgress: (progress: ExportProgress | null) => {
      set((state) => {
        state.exportProgress = progress;
      });
    },

    setLoading: (isLoading: boolean, message = '') => {
      set((state) => {
        state.isLoading = isLoading;
        state.loadingMessage = message;
      });
    },

    setDragging: (isDragging: boolean, ids: string[] = []) => {
      set((state) => {
        state.isDragging = isDragging;
        state.draggedIds = ids;
      });
    }
  }))
);
