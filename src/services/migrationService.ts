/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import { getStoredPosts, getStoredTeam, getStoredVideos } from '../data';
import { fetchPosts } from './postService';
import { fetchTeamMembers } from './teamService';
import { fetchVideos } from './videoService';

export interface MigrationSummary {
  isConfigured: boolean;
  localPostsCount: number;
  localTeamCount: number;
  localVideosCount: number;
  remotePostsCount: number;
  remoteTeamCount: number;
  remoteVideosCount: number;
}

export async function checkMigrationStatus(): Promise<MigrationSummary> {
  const configured = isSupabaseConfigured();
  const localPosts = getStoredPosts();
  const localTeam = getStoredTeam();
  const localVideos = getStoredVideos();

  let remotePostsCount = 0;
  let remoteTeamCount = 0;
  let remoteVideosCount = 0;

  if (configured) {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { count: pCount } = await supabase.from('posts').select('*', { count: 'exact', head: true });
        const { count: tCount } = await supabase.from('team_members').select('*', { count: 'exact', head: true });
        const { count: vCount } = await supabase.from('videos').select('*', { count: 'exact', head: true });
        remotePostsCount = pCount || 0;
        remoteTeamCount = tCount || 0;
        remoteVideosCount = vCount || 0;
      } catch (e) {
        console.warn('Error checking remote counts:', e);
      }
    }
  }

  return {
    isConfigured: configured,
    localPostsCount: localPosts.length,
    localTeamCount: localTeam.length,
    localVideosCount: localVideos.length,
    remotePostsCount,
    remoteTeamCount,
    remoteVideosCount
  };
}

export async function syncLocalDataToSupabase(): Promise<{ 
  success: boolean; 
  syncedPosts: number; 
  syncedTeam: number; 
  syncedVideos: number; 
  error?: string 
}> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      syncedPosts: 0,
      syncedTeam: 0,
      syncedVideos: 0,
      error: 'Supabase URL और Anon Key अभी .env या Netlify Environment Variables में सेट नहीं हैं।'
    };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, syncedPosts: 0, syncedTeam: 0, syncedVideos: 0, error: 'Supabase client unavailable' };
  }

  try {
    let syncedPosts = 0;
    let syncedTeam = 0;
    let syncedVideos = 0;

    // 1. Sync Posts
    const localPosts = getStoredPosts();
    for (const p of localPosts) {
      const { error } = await supabase.from('posts').upsert({
        id: p.id,
        title: p.title,
        content: p.content,
        category: p.category,
        image_url: p.imageUrl,
        author_name: p.authorName,
        author_role: p.authorRole,
        is_breaking: p.isBreaking,
        views: p.views,
        likes: p.likes,
        created_at: p.createdAt,
        status: 'published'
      }, { onConflict: 'id' });

      if (!error) syncedPosts++;
    }

    // 2. Sync Team
    const localTeam = getStoredTeam();
    for (let i = 0; i < localTeam.length; i++) {
      const m = localTeam[i];
      const { error } = await supabase.from('team_members').upsert({
        id: m.id,
        name: m.name,
        role: m.role,
        image_url: m.imageUrl,
        bio: m.bio,
        phone: m.phone || null,
        email: m.email || null,
        display_order: i + 1,
        is_active: true
      }, { onConflict: 'id' });

      if (!error) syncedTeam++;
    }

    // 3. Sync Videos
    const localVideos = getStoredVideos();
    for (const v of localVideos) {
      const { error } = await supabase.from('videos').upsert({
        id: v.id,
        title: v.title,
        description: v.description,
        video_url: v.videoUrl,
        category: v.category,
        duration: v.duration,
        author_name: v.authorName,
        is_live: v.isLive || false,
        views: v.views,
        likes: v.likes,
        created_at: v.createdAt
      }, { onConflict: 'id' });

      if (!error) syncedVideos++;
    }

    return {
      success: true,
      syncedPosts,
      syncedTeam,
      syncedVideos
    };
  } catch (err: any) {
    return {
      success: false,
      syncedPosts: 0,
      syncedTeam: 0,
      syncedVideos: 0,
      error: err.message || 'Data synchronization failed'
    };
  }
}
