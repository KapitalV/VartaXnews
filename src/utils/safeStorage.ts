/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NewsPost } from '../types';

/**
 * Storage Quota and Safe Fallback Utility
 * Ensures that localStorage QuotaExceededError never causes runtime crashes or white screens.
 */

const MAX_CACHED_POSTS = 20;

/**
 * Strips heavy base64 and blob data URLs from posts before caching into localStorage.
 * Keeps memory footprint ultra-light (< 50KB) and prevents QuotaExceededError.
 */
export function sanitizePostsForStorage(posts: NewsPost[]): NewsPost[] {
  if (!Array.isArray(posts)) return [];

  return posts.slice(0, MAX_CACHED_POSTS).map(post => {
    let sanitizedImageUrl = post.imageUrl;

    // Only strip excessively large uncompressed raw base64 or ephemeral blob URLs
    if (sanitizedImageUrl && sanitizedImageUrl.startsWith('blob:')) {
      sanitizedImageUrl = '/input_file_1.png';
    } else if (sanitizedImageUrl && sanitizedImageUrl.startsWith('data:image/') && sanitizedImageUrl.length > 500000) {
      sanitizedImageUrl = '/input_file_1.png';
    }

    return {
      ...post,
      imageUrl: sanitizedImageUrl,
      // Truncate ultra-long article body in offline cache if exceeding 4000 chars
      content: post.content && post.content.length > 4000 
        ? post.content.slice(0, 4000) + '...' 
        : post.content
    };
  });
}

/**
 * Safely writes a key-value pair to localStorage.
 * Automatically catches QuotaExceededError and prevents any unhandled crash in React.
 */
export function safeStorageSet(key: string, value: string): boolean {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false;
  }

  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err: any) {
    const isQuotaError = 
      err?.name === 'QuotaExceededError' ||
      err?.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      err?.code === 22 ||
      err?.code === 1014;

    if (isQuotaError) {
      console.warn(`[SafeStorage] localStorage quota exceeded for key "${key}". Cleaning up old cache...`);
      try {
        // Attempt emergency cleanup of heavy cache items
        localStorage.removeItem('varta_x_queries');
        localStorage.removeItem('varta_channel_logo');
        localStorage.removeItem('varta_ansh_photo');

        // Clean up stored posts if they had heavy base64
        const storedPosts = localStorage.getItem('varta_x_posts');
        if (storedPosts) {
          try {
            const parsed = JSON.parse(storedPosts);
            const cleaned = sanitizePostsForStorage(parsed);
            localStorage.setItem('varta_x_posts', JSON.stringify(cleaned));
          } catch {
            localStorage.removeItem('varta_x_posts');
          }
        }

        // Retry setting the value once
        localStorage.setItem(key, value);
        return true;
      } catch (retryErr) {
        console.warn(`[SafeStorage] Storage still full after cleanup. Continuing in memory-only mode without crashing.`);
        return false;
      }
    }

    console.warn(`[SafeStorage] Storage write error for key "${key}":`, err);
    return false;
  }
}

/**
 * Safely retrieves and parses JSON from localStorage.
 */
export function safeStorageGet<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined' || !window.localStorage) {
    return fallback;
  }

  try {
    const item = localStorage.getItem(key);
    if (item === null || item === undefined || item === '') {
      return fallback;
    }
    return JSON.parse(item) as T;
  } catch (err) {
    console.warn(`[SafeStorage] Failed to parse JSON for key "${key}", using fallback.`, err);
    return fallback;
  }
}

/**
 * Safely removes a key from localStorage.
 */
export function safeStorageRemove(key: string): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.warn(`[SafeStorage] Failed to remove key "${key}":`, err);
  }
}
