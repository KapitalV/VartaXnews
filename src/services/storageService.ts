/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import { optimizeImageForStorage } from '../utils/imageHelper';

export type StorageBucket = 'varta-news' | 'varta-logos' | 'varta-team' | 'varta-media';

/**
 * Upload an image file to Supabase Storage with automatic compression and CDN URL generation.
 * If Supabase is not configured or upload fails, it falls back gracefully to an optimized lightweight image.
 */
export async function uploadMediaFile(
  file: File | Blob, 
  bucket: StorageBucket = 'varta-media', 
  prefix: string = 'media'
): Promise<{ url: string; path?: string; error?: string }> {
  try {
    // 1. Optimize and compress before uploading
    const compressedDataUrl = await optimizeImageForStorage(file, 1280, 0.82);
    
    const supabase = getSupabase();
    if (!supabase || !isSupabaseConfigured()) {
      // Fallback to optimized data URL in local preview mode
      return { url: compressedDataUrl };
    }

    // Convert compressed base64 to Blob
    const res = await fetch(compressedDataUrl);
    const blob = await res.blob();

    const timestamp = Date.now();
    const cleanFileName = `${prefix}_${timestamp}.jpg`;
    const filePath = `${prefix}/${cleanFileName}`;

    // Target bucket order (requested bucket first, fallback to varta-media / varta-news)
    const bucketsToTry: StorageBucket[] = Array.from(new Set([bucket, 'varta-media', 'varta-news', 'varta-team', 'varta-logos']));

    let lastError: string | undefined = undefined;

    for (const targetBucket of bucketsToTry) {
      try {
        const { data, error } = await supabase.storage
          .from(targetBucket)
          .upload(filePath, blob, {
            contentType: 'image/jpeg',
            upsert: true,
          });

        if (!error && data?.path) {
          const { data: publicUrlData } = supabase.storage
            .from(targetBucket)
            .getPublicUrl(data.path);

          if (publicUrlData?.publicUrl) {
            return {
              url: publicUrlData.publicUrl,
              path: data.path
            };
          }
        } else if (error) {
          lastError = error.message;
        }
      } catch (uploadCatch: any) {
        lastError = uploadCatch.message;
      }
    }

    console.warn(`[StorageService] Supabase Storage upload warning across buckets: ${lastError}`);
    return { url: compressedDataUrl, error: lastError };
  } catch (err: any) {
    console.error('[StorageService] Storage upload exception:', err);
    return {
      url: '/input_file_0.png',
      error: err.message || 'Image upload failed'
    };
  }
}
