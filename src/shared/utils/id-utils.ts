// UUID and ID generation utilities

export function generateId(): string {
  return crypto.randomUUID();
}

export function generateShortId(): string {
  return crypto.randomUUID().slice(0, 8);
}

export function generateCacheKey(
  documentId: string,
  pageIndex: number,
  rotation: number
): string {
  return `${documentId}-${pageIndex}-${rotation}`;
}

export function parseCacheKey(cacheKey: string): {
  documentId: string;
  pageIndex: number;
  rotation: number;
} | null {
  const parts = cacheKey.split('-');
  if (parts.length < 3) return null;
  
  const rotation = parseInt(parts.pop()!, 10);
  const pageIndex = parseInt(parts.pop()!, 10);
  const documentId = parts.join('-');
  
  if (isNaN(rotation) || isNaN(pageIndex)) return null;
  
  return { documentId, pageIndex, rotation };
}

export function generateTimestampId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 8);
  return `${timestamp}-${random}`;
}
