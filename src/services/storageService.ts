/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import { optimizeImageForStorage } from '../utils/imageHelper';

export type StorageBucket = 'varta-news' | 'varta-logos' | 'varta-team' | 'varta-media';

/**
 * Upload an image file to Supabase Storage with automatic compression and CDN URL generation.
 * If Supabase is not configured, it compresses and returns an optimized data URL.
 */
export async function uploadMediaFile(
  file: File | Blob, 
  bucket: StorageBucket, 
  prefix: string = 'media'
): Promise<{ url: string; path?: string; error?: string }> {
  try {
    // 1. Optimize and compress before uploading
    const compressedDataUrl = await optimizeImageForStorage(file, 1280, 0.82);
    
    const supabase = getSupabase();
    if (!supabase || !isSupabaseConfigured()) {
      // Fallback to optimized data URL when working in local preview mode
      return { url: compressedDataUrl };
    }

    // Convert compressed base64 to Blob
    const res = await fetch(compressedDataUrl);
    const blob = await res.blob();

    const timestamp = Date.now();
    const cleanFileName = `${prefix}_${timestamp}.jpg`;
    const filePath = `${prefix}/${cleanFileName}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, blob, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) {
      console.warn(`Supabase Storage upload error for ${bucket}:`, error.message);
      // Return compressed data URL as graceful fallback
      return { url: compressedDataUrl, error: error.message };
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return {
      url: publicUrlData.publicUrl,
      path: data.path
    };
  } catch (err: any) {
    console.error('Storage upload exception:', err);
    return {
      url: '/input_file_0.png',
      error: err.message || 'Image upload failed'
    };
  }
}
