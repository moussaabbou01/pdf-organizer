import React, { useState, useCallback, useMemo } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverEvent
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy
} from '@dnd-kit/sortable';
import { ThumbnailCard } from './ThumbnailCard';
import { DragPreview } from './DragPreview';
import { EmptyState } from './EmptyState';
import { useProjectStore } from '../../store/projectSlice';
import { useSelectionStore } from '../../store/selectionSlice';
import { useUIStore } from '../../store/uiSlice';
import { useUndoStore } from '../../store/undoSlice';
import { useSelection } from '../../hooks/useSelection';
import './ThumbnailGrid.css';

export function ThumbnailGrid() {
  const projectStore = useProjectStore();
  const selectionStore = useSelectionStore();
  const uiStore = useUIStore();
  const undoStore = useUndoStore();
  const { handlePageClick } = useSelection();

  const [activeId, setActiveId] = useState<string | null>(null);

  const { project } = projectStore;
  const { outputPages, documents } = project;

  // Configure drag sensors - use distance-based activation for reliability
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Activate drag after 8px of movement
      }
    })
  );

  // Get page data for rendering
  const pageData = useMemo(() => {
    return outputPages.map((pageRef) => {
      const document = documents.find((d) => d.id === pageRef.documentId);
      const page = document?.pages.find((p) => p.id === pageRef.pageId);
      
      return {
        pageRef,
        page,
        document
      };
    });
  }, [outputPages, documents]);

  // Handle drag start
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);

    // If dragged item is not selected, select only it
    if (!selectionStore.isSelected(active.id as string)) {
      selectionStore.selectAll([active.id as string]);
    }

    uiStore.setDragging(true, selectionStore.getSelectedIds());
  }, [selectionStore, uiStore]);

  // Handle drag end
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveId(null);
    uiStore.setDragging(false);

    if (!over || active.id === over.id) return;

    const selectedIds = selectionStore.getSelectedIds();
    const overIndex = outputPages.findIndex((p) => p.id === over.id);

    if (overIndex === -1) return;

    // Record previous state for undo
    const moves = selectedIds.map((id) => {
      const fromIndex = outputPages.findIndex((p) => p.id === id);
      return { pageRefId: id, fromIndex, toIndex: overIndex };
    });

    // Move selected pages
    if (selectedIds.length === 1) {
      projectStore.reorderPages(active.id as string, over.id as string);
    } else {
      projectStore.movePagesToIndex(selectedIds, overIndex);
    }

    // Record for undo
    undoStore.execute(
      'REORDER_PAGES',
      { type: 'REORDER_PAGES', moves },
      { type: 'REORDER_PAGES', moves: moves.map((m) => ({ ...m, fromIndex: m.toIndex, toIndex: m.fromIndex })) }
    );
  }, [projectStore, selectionStore, undoStore, uiStore, outputPages]);

  // Get active page for drag overlay
  const activePage = useMemo(() => {
    if (!activeId) return null;
    return pageData.find((p) => p.pageRef.id === activeId);
  }, [activeId, pageData]);

  // Calculate grid style based on zoom
  const gridStyle = useMemo(() => ({
    '--zoom': uiStore.zoom
  } as React.CSSProperties), [uiStore.zoom]);

  if (outputPages.length === 0) {
    return <EmptyState />;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={outputPages.map((p) => p.id)} strategy={rectSortingStrategy}>
        <div className="thumbnail-grid" style={gridStyle}>
          {pageData.map(({ pageRef, page, document }, index) => (
            <ThumbnailCard
              key={pageRef.id}
              pageRef={pageRef}
              page={page!}
              document={document!}
              index={index}
              isSelected={selectionStore.isSelected(pageRef.id)}
              isDragging={activeId === pageRef.id}
              onClick={handlePageClick}
            />
          ))}
        </div>
      </SortableContext>

      <DragOverlay dropAnimation={null}>
        {activePage && (
          <DragPreview
            count={selectionStore.getSelectedCount()}
            page={activePage.page!}
            document={activePage.document!}
          />
        )}
      </DragOverlay>
    </DndContext>
  );
}
