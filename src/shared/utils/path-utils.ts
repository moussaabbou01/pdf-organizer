// Utility functions for path manipulation
// Browser-compatible implementations (no Node.js path module)

export function getFileName(filePath: string): string {
  // Handle both forward and back slashes
  const normalized = filePath.replace(/\\/g, '/');
  const parts = normalized.split('/');
  return parts[parts.length - 1] || '';
}

export function getFileNameWithoutExtension(filePath: string): string {
  const name = getFileName(filePath);
  const lastDot = name.lastIndexOf('.');
  if (lastDot <= 0) return name; // No extension or hidden file
  return name.slice(0, lastDot);
}

export function getFileExtension(filePath: string): string {
  const name = getFileName(filePath);
  const lastDot = name.lastIndexOf('.');
  if (lastDot <= 0) return ''; // No extension or hidden file
  return name.slice(lastDot).toLowerCase();
}

export function getDirectory(filePath: string): string {
  const normalized = filePath.replace(/\\/g, '/');
  const lastSlash = normalized.lastIndexOf('/');
  if (lastSlash === -1) return '';
  return normalized.slice(0, lastSlash);
}

export function joinPaths(...paths: string[]): string {
  return paths
    .filter(p => p)
    .join('/')
    .replace(/\/+/g, '/');
}

export function isPdfFile(filePath: string): boolean {
  return getFileExtension(filePath) === '.pdf';
}

export function generateOutputFileName(
  inputPaths: string[],
  suffix: string = '_merged'
): string {
  if (inputPaths.length === 0) {
    return `output${suffix}.pdf`;
  }
  
  const firstName = getFileNameWithoutExtension(inputPaths[0]);
  return `${firstName}${suffix}.pdf`;
}

export function sanitizeFileName(name: string): string {
  // Remove characters not allowed in Windows file names
  return name.replace(/[<>:"/\\|?*]/g, '_').trim();
}
