import React from 'react';
import { useThumbnail } from '../../hooks/useThumbnails';
import type { Page, Document } from '../../../shared/types/project';
import './DragPreview.css';

interface DragPreviewProps {
  count: number;
  page: Page;
  document: Document;
}

export function DragPreview({ count, page, document }: DragPreviewProps) {
  const { dataUrl } = useThumbnail({
    documentId: page.documentId,
    pageIndex: page.originalIndex,
    rotation: page.rotation
  });

  return (
    <div className="drag-preview">
      <div className="drag-preview-image">
        {dataUrl ? (
          <img src={dataUrl} alt="Dragging" draggable={false} />
        ) : (
          <div className="drag-preview-placeholder" />
        )}
      </div>
      
      {count > 1 && (
        <div className="drag-preview-badge">
          {count}
        </div>
      )}
    </div>
  );
}
