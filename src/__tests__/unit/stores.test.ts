// Unit tests for Zustand stores
import { describe, it, expect, beforeEach } from 'vitest';
import { useProjectStore } from '../../renderer/store/projectSlice';
import { useSelectionStore } from '../../renderer/store/selectionSlice';
import { useUndoStore } from '../../renderer/store/undoSlice';
import { createDocument } from '../../shared/types/project';

describe('Project Store', () => {
  beforeEach(() => {
    // Reset store
    useProjectStore.getState().resetProject();
  });

  it('should initialize with empty project', () => {
    const state = useProjectStore.getState();
    
    expect(state.project.documents).toHaveLength(0);
    expect(state.project.outputPages).toHaveLength(0);
    expect(state.project.isDirty).toBe(false);
  });

  it('should add document and create page references', () => {
    const doc = createDocument('/test.pdf', 'test.pdf', 3, 1024);
    
    useProjectStore.getState().addDocument(doc);
    const state = useProjectStore.getState();
    
    expect(state.project.documents).toHaveLength(1);
    expect(state.project.outputPages).toHaveLength(3);
    expect(state.project.isDirty).toBe(true);
  });

  it('should remove document and its pages', () => {
    const doc = createDocument('/test.pdf', 'test.pdf', 3, 1024);
    
    useProjectStore.getState().addDocument(doc);
    useProjectStore.getState().removeDocument(doc.id);
    
    const state = useProjectStore.getState();
    
    expect(state.project.documents).toHaveLength(0);
    expect(state.project.outputPages).toHaveLength(0);
  });

  it('should remove specific pages from output', () => {
    const doc = createDocument('/test.pdf', 'test.pdf', 3, 1024);
    
    useProjectStore.getState().addDocument(doc);
    const pageRefId = useProjectStore.getState().project.outputPages[1].id;
    
    useProjectStore.getState().removePagesFromOutput([pageRefId]);
    
    const state = useProjectStore.getState();
    expect(state.project.outputPages).toHaveLength(2);
  });

  it('should reorder pages', () => {
    const doc = createDocument('/test.pdf', 'test.pdf', 3, 1024);
    
    useProjectStore.getState().addDocument(doc);
    
    const [first, second] = useProjectStore.getState().project.outputPages;
    
    useProjectStore.getState().reorderPages(second.id, first.id);
    
    const state = useProjectStore.getState();
    expect(state.project.outputPages[0].id).toBe(second.id);
    expect(state.project.outputPages[1].id).toBe(first.id);
  });

  it('should rotate page', () => {
    const doc = createDocument('/test.pdf', 'test.pdf', 1, 1024);
    
    useProjectStore.getState().addDocument(doc);
    const pageId = doc.pages[0].id;
    
    useProjectStore.getState().rotatePage(pageId, true);
    
    const page = useProjectStore.getState().getPageById(pageId);
    expect(page?.rotation).toBe(90);
    
    useProjectStore.getState().rotatePage(pageId, true);
    expect(useProjectStore.getState().getPageById(pageId)?.rotation).toBe(180);
    
    useProjectStore.getState().rotatePage(pageId, false);
    expect(useProjectStore.getState().getPageById(pageId)?.rotation).toBe(90);
  });
});

describe('Selection Store', () => {
  beforeEach(() => {
    useSelectionStore.getState().deselectAll();
  });

  it('should select and deselect items', () => {
    useSelectionStore.getState().select('item1');
    
    expect(useSelectionStore.getState().isSelected('item1')).toBe(true);
    expect(useSelectionStore.getState().getSelectedCount()).toBe(1);
    
    useSelectionStore.getState().deselect('item1');
    
    expect(useSelectionStore.getState().isSelected('item1')).toBe(false);
  });

  it('should handle multi-select with Ctrl', () => {
    useSelectionStore.getState().select('item1');
    useSelectionStore.getState().select('item2', true); // multiSelect
    
    expect(useSelectionStore.getState().getSelectedCount()).toBe(2);
    expect(useSelectionStore.getState().isSelected('item1')).toBe(true);
    expect(useSelectionStore.getState().isSelected('item2')).toBe(true);
  });

  it('should replace selection without modifier', () => {
    useSelectionStore.getState().select('item1');
    useSelectionStore.getState().select('item2'); // no multiSelect
    
    expect(useSelectionStore.getState().getSelectedCount()).toBe(1);
    expect(useSelectionStore.getState().isSelected('item1')).toBe(false);
    expect(useSelectionStore.getState().isSelected('item2')).toBe(true);
  });

  it('should select range with Shift', () => {
    const allIds = ['a', 'b', 'c', 'd', 'e'];
    
    useSelectionStore.getState().select('b');
    useSelectionStore.getState().select('d', false, true, allIds); // rangeSelect
    
    expect(useSelectionStore.getState().getSelectedCount()).toBe(3);
    expect(useSelectionStore.getState().isSelected('b')).toBe(true);
    expect(useSelectionStore.getState().isSelected('c')).toBe(true);
    expect(useSelectionStore.getState().isSelected('d')).toBe(true);
  });

  it('should select all', () => {
    const ids = ['a', 'b', 'c'];
    
    useSelectionStore.getState().selectAll(ids);
    
    expect(useSelectionStore.getState().getSelectedCount()).toBe(3);
  });
});

describe('Undo Store', () => {
  beforeEach(() => {
    useUndoStore.getState().clear();
  });

  it('should track operations', () => {
    useUndoStore.getState().execute(
      'DELETE_PAGES',
      { type: 'DELETE_PAGES', pageRefIds: ['1'], previousState: [] },
      { type: 'INSERT_PAGES', pageRefs: [], insertIndex: 0 }
    );
    
    expect(useUndoStore.getState().canUndo()).toBe(true);
    expect(useUndoStore.getState().canRedo()).toBe(false);
  });

  it('should undo and redo', () => {
    useUndoStore.getState().execute(
      'DELETE_PAGES',
      { type: 'DELETE_PAGES', pageRefIds: ['1'], previousState: [] },
      { type: 'INSERT_PAGES', pageRefs: [], insertIndex: 0 }
    );
    
    const undone = useUndoStore.getState().undo();
    
    expect(undone).not.toBeNull();
    expect(useUndoStore.getState().canUndo()).toBe(false);
    expect(useUndoStore.getState().canRedo()).toBe(true);
    
    const redone = useUndoStore.getState().redo();
    
    expect(redone).not.toBeNull();
    expect(useUndoStore.getState().canUndo()).toBe(true);
    expect(useUndoStore.getState().canRedo()).toBe(false);
  });

  it('should clear redo stack on new action', () => {
    useUndoStore.getState().execute(
      'DELETE_PAGES',
      { type: 'DELETE_PAGES', pageRefIds: ['1'], previousState: [] },
      { type: 'INSERT_PAGES', pageRefs: [], insertIndex: 0 }
    );
    
    useUndoStore.getState().undo();
    expect(useUndoStore.getState().canRedo()).toBe(true);
    
    useUndoStore.getState().execute(
      'ROTATE_PAGES',
      { type: 'ROTATE_PAGES', rotations: [], previousRotations: [] },
      { type: 'ROTATE_PAGES', rotations: [], previousRotations: [] }
    );
    
    expect(useUndoStore.getState().canRedo()).toBe(false);
  });
});
