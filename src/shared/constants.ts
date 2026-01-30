// Application constants

export const APP_NAME = 'PDF Organizer';
export const APP_VERSION = '1.0.0';

// Thumbnail settings
export const THUMBNAIL_WIDTH = 150;
export const THUMBNAIL_QUALITY = 0.8;
export const THUMBNAIL_FORMAT = 'image/jpeg';

// Cache settings
export const MEMORY_CACHE_MAX_ITEMS = 500;
export const MEMORY_CACHE_MAX_SIZE_MB = 100;
export const DISK_CACHE_MAX_SIZE_MB = 500;

// Autosave settings
export const AUTOSAVE_INTERVAL_MS = 30_000; // 30 seconds
export const AUTOSAVE_DEBOUNCE_MS = 1000;

// Undo/Redo settings
export const MAX_UNDO_HISTORY = 50;

// UI settings
export const DEFAULT_ZOOM = 1;
export const MIN_ZOOM = 0.5;
export const MAX_ZOOM = 2;
export const ZOOM_STEP = 0.1;

// Drag and drop
export const DRAG_ACTIVATION_DELAY_MS = 150;
export const DRAG_ACTIVATION_TOLERANCE_PX = 5;

// File types
export const PDF_FILE_FILTER = {
  name: 'PDF Files',
  extensions: ['pdf']
};

// Worker settings
export const THUMBNAIL_WORKER_POOL_SIZE = 4;
export const EXPORT_BATCH_SIZE = 10;

// Grid settings
export const GRID_GAP = 16;
export const GRID_PADDING = 24;
export const THUMBNAIL_CARD_WIDTH = 140;
export const THUMBNAIL_CARD_HEIGHT = 180;
