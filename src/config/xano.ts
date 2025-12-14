/**
 * Xano API configuration
 * Set VITE_XANO_BASE_URL and VITE_XANO_FILE_BASE_URL in your .env file
 */
export const XANO_CONFIG = {
  // Xano instance URL - MUST be set via environment variable
  // Format: https://instance.xano.io/api:apigroup_canonical
  baseUrl: import.meta.env.VITE_XANO_BASE_URL || '',
  // File storage URL (for uploaded images)
  fileBaseUrl: import.meta.env.VITE_XANO_FILE_BASE_URL || '',
  // API group canonical (optional, for reference)
  apiGroup: import.meta.env.VITE_XANO_API_GROUP || '',
} as const;

/**
 * Helper to get full URL from Xano file path
 * Converts relative paths like /vault/... to full URLs
 */
export function getXanoFileUrl(path: string | null | undefined): string {
  if (!path) return '';
  // If already a full URL, return as-is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  // Prepend the file base URL
  return `${XANO_CONFIG.fileBaseUrl}${path}`;
}

/**
 * Xano API endpoints
 * Note: Base URL already includes the API group canonical, so endpoints are relative
 */
export const XANO_ENDPOINTS = {
  thoughts: `/thoughts`,
  createThought: `/thoughts/create`,
  updateThought: `/thoughts/update`,
  deleteThought: `/thoughts/delete`,
  adminThoughts: `/thoughts/admin/all`,
  likeThought: `/thoughts/like`,
  likeStatus: `/thoughts/like-status`,
  trackVisitor: `/visitor/track`,
  visitorCount: `/visitor/count`,
  verifyAdmin: `/admin/verify`,
  uploadImage: `/upload/image`,
} as const;

