import React, { memo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useThumbnail } from '../../hooks/useThumbnails';
import type { Page, PageReference, Document } from '../../../shared/types/project';
import './ThumbnailCard.css';

interface ThumbnailCardProps {
  pageRef: PageReference;
  page: Page;
  document: Document;
  index: number;
  isSelected: boolean;
  isDragging: boolean;
  onClick: (pageRefId: string, event: React.MouseEvent) => void;
}

export const ThumbnailCard = memo(function ThumbnailCard({
  pageRef,
  page,
  document,
  index,
  isSelected,
  isDragging,
  onClick
}: ThumbnailCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging
  } = useSortable({ id: pageRef.id });

  const { dataUrl, isLoading, error } = useThumbnail({
    documentId: page.documentId,
    pageIndex: page.originalIndex,
    rotation: page.rotation
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1
  };

  const handleClick = (e: React.MouseEvent) => {
    onClick(pageRef.id, e);
  };

  const classNames = [
    'thumbnail-card',
    isSelected && 'thumbnail-card--selected',
    isDragging && 'thumbnail-card--dragging'
  ].filter(Boolean).join(' ');

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={classNames}
      onClick={handleClick}
      {...attributes}
      {...listeners}
    >
      <div className="thumbnail-image-container">
        {isLoading ? (
          <div className="thumbnail-placeholder">
            <div className="thumbnail-spinner" />
          </div>
        ) : error ? (
          <div className="thumbnail-error">
            <span>⚠️</span>
            <span>Error</span>
          </div>
        ) : (
          <img
            src={dataUrl || ''}
            alt={`Page ${page.originalIndex + 1}`}
            className="thumbnail-image"
            draggable={false}
          />
        )}
        
        {page.rotation !== 0 && (
          <div className="thumbnail-rotation-badge">
            {page.rotation}°
          </div>
        )}
      </div>

      <div className="thumbnail-info">
        <span className="thumbnail-page-number">{index + 1}</span>
        <span className="thumbnail-doc-name" title={document.fileName}>
          {document.fileName}
        </span>
      </div>

      {isSelected && (
        <div className="thumbnail-selection-indicator" />
      )}
    </div>
  );
});
