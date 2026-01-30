// Undo/Redo state slice
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { Operation, OperationPayload, createOperation, OperationType } from '../../shared/types/operations';
import { MAX_UNDO_HISTORY } from '../../shared/constants';

interface UndoState {
  past: Operation[];
  future: Operation[];
  
  // Actions
  execute: (type: OperationType, payload: OperationPayload, inverse: OperationPayload) => void;
  undo: () => Operation | null;
  redo: () => Operation | null;
  clear: () => void;
  
  // Helpers
  canUndo: () => boolean;
  canRedo: () => boolean;
  getLastOperation: () => Operation | null;
}

export const useUndoStore = create<UndoState>()(
  immer((set, get) => ({
    past: [],
    future: [],

    execute: (type: OperationType, payload: OperationPayload, inverse: OperationPayload) => {
      set((state) => {
        const operation = createOperation(type, payload, inverse);
        
        // Add to history, maintaining max size
        state.past.push(operation);
        if (state.past.length > MAX_UNDO_HISTORY) {
          state.past.shift();
        }
        
        // Clear redo stack on new action
        state.future = [];
      });
    },

    undo: () => {
      const state = get();
      if (state.past.length === 0) return null;

      // Get the operation before modifying state (create a deep copy)
      const operation = JSON.parse(JSON.stringify(state.past[state.past.length - 1])) as Operation;
      
      set((s) => {
        s.past.pop();
        s.future.unshift(operation);
      });

      return operation;
    },

    redo: () => {
      const state = get();
      if (state.future.length === 0) return null;

      // Get the operation before modifying state (create a deep copy)
      const operation = JSON.parse(JSON.stringify(state.future[0])) as Operation;
      
      set((s) => {
        s.future.shift();
        s.past.push(operation);
      });

      return operation;
    },

    clear: () => {
      set((state) => {
        state.past = [];
        state.future = [];
      });
    },

    canUndo: () => {
      return get().past.length > 0;
    },

    canRedo: () => {
      return get().future.length > 0;
    },

    getLastOperation: () => {
      const state = get();
      return state.past.length > 0 ? state.past[state.past.length - 1] : null;
    }
  }))
);
