// Selection state slice - manages page selection
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface SelectionState {
  selectedIds: Set<string>;
  lastSelectedId: string | null;
  
  // Actions
  select: (id: string, multiSelect?: boolean, rangeSelect?: boolean, allIds?: string[]) => void;
  deselect: (id: string) => void;
  toggleSelect: (id: string) => void;
  selectAll: (ids: string[]) => void;
  deselectAll: () => void;
  selectRange: (fromId: string, toId: string, allIds: string[]) => void;
  
  // Helpers
  isSelected: (id: string) => boolean;
  getSelectedCount: () => number;
  getSelectedIds: () => string[];
}

export const useSelectionStore = create<SelectionState>()(
  immer((set, get) => ({
    selectedIds: new Set<string>(),
    lastSelectedId: null,

    select: (id: string, multiSelect = false, rangeSelect = false, allIds?: string[]) => {
      set((state) => {
        if (rangeSelect && state.lastSelectedId && allIds) {
          // Shift+click: select range
          const lastIndex = allIds.indexOf(state.lastSelectedId);
          const currentIndex = allIds.indexOf(id);
          
          if (lastIndex !== -1 && currentIndex !== -1) {
            const start = Math.min(lastIndex, currentIndex);
            const end = Math.max(lastIndex, currentIndex);
            
            for (let i = start; i <= end; i++) {
              state.selectedIds.add(allIds[i]);
            }
          }
        } else if (multiSelect) {
          // Ctrl+click: toggle single item
          if (state.selectedIds.has(id)) {
            state.selectedIds.delete(id);
          } else {
            state.selectedIds.add(id);
          }
        } else {
          // Single click: replace selection
          state.selectedIds.clear();
          state.selectedIds.add(id);
        }
        
        state.lastSelectedId = id;
      });
    },

    deselect: (id: string) => {
      set((state) => {
        state.selectedIds.delete(id);
      });
    },

    toggleSelect: (id: string) => {
      set((state) => {
        if (state.selectedIds.has(id)) {
          state.selectedIds.delete(id);
        } else {
          state.selectedIds.add(id);
        }
        state.lastSelectedId = id;
      });
    },

    selectAll: (ids: string[]) => {
      set((state) => {
        state.selectedIds = new Set(ids);
        state.lastSelectedId = ids.length > 0 ? ids[ids.length - 1] : null;
      });
    },

    deselectAll: () => {
      set((state) => {
        state.selectedIds.clear();
        state.lastSelectedId = null;
      });
    },

    selectRange: (fromId: string, toId: string, allIds: string[]) => {
      set((state) => {
        const fromIndex = allIds.indexOf(fromId);
        const toIndex = allIds.indexOf(toId);
        
        if (fromIndex === -1 || toIndex === -1) return;
        
        const start = Math.min(fromIndex, toIndex);
        const end = Math.max(fromIndex, toIndex);
        
        for (let i = start; i <= end; i++) {
          state.selectedIds.add(allIds[i]);
        }
        
        state.lastSelectedId = toId;
      });
    },

    isSelected: (id: string) => {
      return get().selectedIds.has(id);
    },

    getSelectedCount: () => {
      return get().selectedIds.size;
    },

    getSelectedIds: () => {
      return Array.from(get().selectedIds);
    }
  }))
);
