import type { Thought, VisitorCount } from '../types';
import { XANO_CONFIG, XANO_ENDPOINTS } from '../config/xano';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

/**
 * Xano API service
 * Handles all API calls to Xano backend
 */

interface ApiResponse<T> {
  items?: T[];
  total?: number;
  itemsTotal?: number; // Xano's actual field name
  curPage?: number;
  nextPage?: number | null;
  prevPage?: number | null;
  page?: number;
  per_page?: number;
}

/**
 * Get all visible thoughts/updates
 */
export async function getThoughts(page = 1, perPage = 10): Promise<Thought[]> {
  try {
    const response = await fetch(
      `${XANO_CONFIG.baseUrl}${XANO_ENDPOINTS.thoughts}?page=${page}&per_page=${perPage}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch thoughts: ${response.statusText}`);
    }

    const data: ApiResponse<Thought> = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Error fetching thoughts:', error);
    return [];
  }
}

/**
 * Create a new thought (admin only)
 * Uses session token for authentication
 */
export async function createThought(
  content: string,
  sessionToken: string,
  isVisible = true,
  imageUrl?: string
): Promise<Thought | null> {
  try {
    const response = await fetch(`${XANO_CONFIG.baseUrl}${XANO_ENDPOINTS.createThought}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Token': sessionToken,
      },
      body: JSON.stringify({
        content,
        source: 'manual',
        is_visible: isVisible,
        image_url: imageUrl || '',
        session_token: sessionToken,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create thought: ${response.statusText} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating thought:', error);
    return null;
  }
}

/**
 * Get all thoughts including hidden (admin only)
 * Uses session token for authentication
 */
export async function getAdminThoughts(
  sessionToken: string,
  page = 1,
  perPage = 20,
  searchQuery = ''
): Promise<{ items: Thought[]; total: number }> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
      session_token: sessionToken,
    });
    if (searchQuery) params.append('search_query', searchQuery);

    const response = await fetch(
      `${XANO_CONFIG.baseUrl}${XANO_ENDPOINTS.adminThoughts}?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Token': sessionToken,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch admin thoughts: ${response.statusText} - ${errorText}`);
    }

    const data: ApiResponse<Thought> = await response.json();
    // Xano returns itemsTotal for paginated responses
    return { items: data.items || [], total: data.itemsTotal || data.total || 0 };
  } catch (error) {
    console.error('Error fetching admin thoughts:', error);
    return { items: [], total: 0 };
  }
}

/**
 * Track a visitor
 * Uses FingerprintJS for deduplication (consistent with likes)
 */
export async function trackVisitor(
  visitorFingerprint?: string,
  userAgent?: string,
  referrer?: string
): Promise<boolean> {
  try {
    const fingerprint = visitorFingerprint || await generateFingerprint();
    const response = await fetch(`${XANO_CONFIG.baseUrl}${XANO_ENDPOINTS.trackVisitor}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        visitor_fingerprint: fingerprint,
        user_agent: userAgent || navigator.userAgent,
        referrer: referrer || document.referrer,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Error tracking visitor:', error);
    return false;
  }
}

/**
 * Get total visitor count
 */
export async function getVisitorCount(): Promise<number> {
  try {
    const response = await fetch(`${XANO_CONFIG.baseUrl}${XANO_ENDPOINTS.visitorCount}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch visitor count: ${response.statusText}`);
    }

    const data: VisitorCount = await response.json();
    return data.total_visitors || 0;
  } catch (error) {
    console.error('Error fetching visitor count:', error);
    return 0;
  }
}

/**
 * Verify admin password
 */
export async function verifyAdminPassword(password: string): Promise<{ success: boolean; token?: string; message: string }> {
  try {
    const response = await fetch(`${XANO_CONFIG.baseUrl}${XANO_ENDPOINTS.verifyAdmin}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      throw new Error(`Failed to verify password: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error verifying password:', error);
    return { success: false, message: 'Authentication failed. Please try again.' };
  }
}

/**
 * Update an existing thought (admin only)
 */
export async function updateThought(
  thoughtId: number,
  sessionToken: string,
  updates: {
    content?: string;
    is_visible?: boolean;
    image_url?: string;
  }
): Promise<Thought | null> {
  try {
    const response = await fetch(`${XANO_CONFIG.baseUrl}${XANO_ENDPOINTS.updateThought}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Token': sessionToken,
      },
      body: JSON.stringify({
        thought_id: thoughtId,
        session_token: sessionToken,
        ...updates,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update thought: ${response.statusText} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating thought:', error);
    return null;
  }
}

/**
 * Delete a thought (admin only)
 */
export async function deleteThought(
  thoughtId: number,
  sessionToken: string
): Promise<boolean> {
  try {
    const response = await fetch(`${XANO_CONFIG.baseUrl}${XANO_ENDPOINTS.deleteThought}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Token': sessionToken,
      },
      body: JSON.stringify({
        thought_id: thoughtId,
        session_token: sessionToken,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to delete thought: ${response.statusText} - ${errorText}`);
    }

    return true;
  } catch (error) {
    console.error('Error deleting thought:', error);
    return false;
  }
}

/**
 * Like a thought
 */
export async function likeThought(
  thoughtId: number,
  visitorFingerprint: string
): Promise<{ likes_count: number; success: boolean } | null> {
  try {
    const response = await fetch(`${XANO_CONFIG.baseUrl}${XANO_ENDPOINTS.likeThought}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        thought_id: thoughtId,
        visitor_fingerprint: visitorFingerprint,
      }),
    });

    if (!response.ok) {
      // If already liked, return null but don't throw
      const errorData = await response.json();
      if (errorData.message === 'Already liked') {
        return null;
      }
      throw new Error(`Failed to like thought: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error liking thought:', error);
    return null;
  }
}

/**
 * Get like status for all thoughts for a visitor
 */
export async function getLikeStatus(
  visitorFingerprint: string
): Promise<number[]> {
  try {
    const response = await fetch(
      `${XANO_CONFIG.baseUrl}${XANO_ENDPOINTS.likeStatus}?visitor_fingerprint=${encodeURIComponent(visitorFingerprint)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get like status: ${response.statusText}`);
    }

    const data = await response.json();
    return data.map((like: { thought_id: number }) => like.thought_id);
  } catch (error) {
    console.error('Error getting like status:', error);
    return [];
  }
}

// FingerprintJS instance (cached for reuse)
let fpPromise: ReturnType<typeof FingerprintJS.load> | null = null;

/**
 * Generate a browser fingerprint using FingerprintJS
 * Uses hardware/browser characteristics for robust identification
 * Caches result in localStorage for faster subsequent calls
 */
export async function generateFingerprint(): Promise<string> {
  // Check cache first for performance
  const stored = localStorage.getItem('visitor_fingerprint');
  if (stored) return stored;
  
  try {
    // Initialize FingerprintJS (only once)
    if (!fpPromise) {
      fpPromise = FingerprintJS.load();
    }
    
    const fp = await fpPromise;
    if (!fp) throw new Error('FingerprintJS failed to load');
    const result = await fp.get();
    const fingerprint = result.visitorId;
    
    // Cache for faster subsequent calls
  localStorage.setItem('visitor_fingerprint', fingerprint);
  return fingerprint;
  } catch (error) {
    console.error('Error generating fingerprint:', error);
    // Fallback to simple fingerprint if FingerprintJS fails
    const fallback = `fallback_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem('visitor_fingerprint', fallback);
    return fallback;
  }
}

/**
 * Get fingerprint synchronously (from cache only)
 * Returns null if not cached yet
 */
export function getCachedFingerprint(): string | null {
  return localStorage.getItem('visitor_fingerprint');
}

/**
 * Upload an image to Xano storage
 * Returns the image URL on success
 */
export async function uploadImage(
  file: File,
  sessionToken: string
): Promise<{ success: boolean; image_url?: string; error?: string }> {
  try {
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('image', file);
    formData.append('session_token', sessionToken);

    const response = await fetch(`${XANO_CONFIG.baseUrl}${XANO_ENDPOINTS.uploadImage}`, {
      method: 'POST',
      headers: {
        'X-Session-Token': sessionToken,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Upload response:', data);
    // Try url first, then image_url, then path
    const imageUrl = data.image_url || data.url || data.path;
    return {
      success: true,
      image_url: imageUrl,
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload image',
    };
  }
}

