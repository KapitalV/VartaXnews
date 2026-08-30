/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import { VideoBulletin } from '../types';
import { getStoredVideos, saveVideos } from '../data';

function mapRowToVideo(row: any): VideoBulletin {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    videoUrl: row.video_url,
    views: Number(row.views || 0),
    likes: Number(row.likes || 0),
    createdAt: row.created_at || new Date().toISOString(),
    category: row.category || 'Local',
    duration: row.duration || '03:30',
    authorName: row.author_name || 'वार्ता एक्स ब्यूरो',
    isLive: Boolean(row.is_live)
  };
}

export async function fetchVideos(): Promise<VideoBulletin[]> {
  const supabase = getSupabase();

  if (supabase && isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const list = data.map(mapRowToVideo);
        saveVideos(list);
        return list;
      }
    } catch (err) {
      console.warn('Error fetching videos from Supabase:', err);
    }
  }

  return getStoredVideos();
}

export async function createVideo(
  newVideo: Omit<VideoBulletin, 'id' | 'createdAt' | 'views' | 'likes'>
): Promise<VideoBulletin> {
  const id = `vid-${Date.now()}`;
  const now = new Date().toISOString();

  const videoObject: VideoBulletin = {
    ...newVideo,
    id,
    createdAt: now,
    views: 0,
    likes: 0
  };

  const supabase = getSupabase();
  if (supabase && isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('videos')
        .insert({
          id: videoObject.id,
          title: videoObject.title,
          description: videoObject.description,
          video_url: videoObject.videoUrl,
          category: videoObject.category,
          duration: videoObject.duration,
          author_name: videoObject.authorName,
          is_live: videoObject.isLive || false,
          views: 0,
          likes: 0,
          created_at: now
        })
        .select()
        .single();

      if (!error && data) {
        return mapRowToVideo(data);
      }
    } catch (err) {
      console.warn('Error saving video to Supabase:', err);
    }
  }

  const existing = getStoredVideos();
  const updated = [videoObject, ...existing];
  saveVideos(updated);
  return videoObject;
}

export async function incrementVideoViews(id: string): Promise<void> {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    const sessionKey = `varta_viewed_vid_${id}`;
    if (sessionStorage.getItem(sessionKey)) {
      return;
    }
    sessionStorage.setItem(sessionKey, '1');
  }

  const supabase = getSupabase();
  if (supabase && isSupabaseConfigured()) {
    try {
      const { data } = await supabase.from('videos').select('views').eq('id', id).single();
      if (data) {
        const cur = Number(data.views || 0);
        await supabase.from('videos').update({ views: cur + 1 }).eq('id', id);
      }
    } catch (err) {
      console.warn('[VideoService] Error incrementing real video views:', err);
    }
  }

  const existing = getStoredVideos();
  const updated = existing.map(v => v.id === id ? { ...v, views: (Number(v.views) || 0) + 1 } : v);
  saveVideos(updated);
}

export async function deleteVideo(id: string): Promise<void> {
  const updated = getStoredVideos().filter(v => v.id !== id);
  saveVideos(updated);

  const supabase = getSupabase();
  if (supabase && isSupabaseConfigured()) {
    try {
      await supabase.from('videos').delete().eq('id', id);
    } catch (err) {
      console.warn('Error deleting video from Supabase:', err);
    }
  }
}

export function subscribeToVideos(onUpdate: () => void): () => void {
  const supabase = getSupabase();
  if (!supabase || !isSupabaseConfigured()) {
    return () => {};
  }

  const channel = supabase
    .channel('public:videos')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'videos' }, () => {
      onUpdate();
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
