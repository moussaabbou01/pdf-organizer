// Operation types for undo/redo

import type { PageReference, Rotation } from './project';

export type OperationType =
  | 'INSERT_PAGES'
  | 'DELETE_PAGES'
  | 'REORDER_PAGES'
  | 'ROTATE_PAGES'
  | 'ADD_DOCUMENT'
  | 'REMOVE_DOCUMENT';

export interface Operation {
  id: string;
  type: OperationType;
  timestamp: number;
  payload: OperationPayload;
  inverse: OperationPayload;
}

export type OperationPayload =
  | InsertPagesPayload
  | DeletePagesPayload
  | ReorderPagesPayload
  | RotatePagesPayload
  | AddDocumentPayload
  | RemoveDocumentPayload;

export interface InsertPagesPayload {
  type: 'INSERT_PAGES';
  pageRefs: PageReference[];
  insertIndex: number;
}

export interface DeletePagesPayload {
  type: 'DELETE_PAGES';
  pageRefIds: string[];
  previousState: { pageRef: PageReference; position: number }[];
}

export interface ReorderPagesPayload {
  type: 'REORDER_PAGES';
  moves: { pageRefId: string; fromIndex: number; toIndex: number }[];
}

export interface RotatePagesPayload {
  type: 'ROTATE_PAGES';
  rotations: { pageId: string; newRotation: Rotation }[];
  previousRotations: { pageId: string; oldRotation: Rotation }[];
}

export interface AddDocumentPayload {
  type: 'ADD_DOCUMENT';
  documentId: string;
  filePath: string;
}

export interface RemoveDocumentPayload {
  type: 'REMOVE_DOCUMENT';
  documentId: string;
}

export function createOperation(
  type: OperationType,
  payload: OperationPayload,
  inverse: OperationPayload
): Operation {
  return {
    id: crypto.randomUUID(),
    type,
    timestamp: Date.now(),
    payload,
    inverse
  };
}
