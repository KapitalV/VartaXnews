/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import { NewsPost, NewsCategory } from '../types';
import { getStoredPosts, savePosts } from '../data';

// Map database row to client NewsPost interface
function mapRowToPost(row: any): NewsPost {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    category: (row.category as NewsCategory) || NewsCategory.LOCAL,
    imageUrl: row.image_url || '/input_file_0.png',
    createdAt: row.created_at || row.published_at || new Date().toISOString(),
    views: Number(row.views || 0),
    likes: Number(row.likes || 0),
    authorName: row.author_name || 'वार्ता एक्स रिपोर्टर',
    authorRole: row.author_role || 'संवाददाता',
    isBreaking: Boolean(row.is_breaking)
  };
}

export async function fetchPosts(category?: string, search?: string): Promise<NewsPost[]> {
  const supabase = getSupabase();

  if (supabase && isSupabaseConfigured()) {
    try {
      let query = supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (category && category !== 'All' && category !== 'all') {
        query = query.eq('category', category);
      }

      if (search && search.trim()) {
        query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
      }

      const { data, error } = await query;

      if (!error && data) {
        if (data.length > 0) {
          const posts = data.map(mapRowToPost);
          // Cache to client storage for offline PWA viewing
          savePosts(posts);
          return posts;
        } else if ((category && category !== 'All' && category !== 'all') || (search && search.trim())) {
          return [];
        }
      }
    } catch (err) {
      console.warn('Error fetching posts from Supabase, falling back to local cache:', err);
    }
  }

  // Graceful local cache fallback
  const local = getStoredPosts();
  if (category && category !== 'All' && category !== 'all') {
    return local.filter(p => p.category === category);
  }
  return local;
}

export async function createPost(
  newPost: Omit<NewsPost, 'id' | 'createdAt' | 'views' | 'likes'>
): Promise<NewsPost> {
  const id = `post-${Date.now()}`;
  const now = new Date().toISOString();
  
  const postObject: NewsPost = {
    ...newPost,
    id,
    createdAt: now,
    views: Math.floor(Math.random() * 40) + 10,
    likes: 0
  };

  const supabase = getSupabase();
  if (supabase && isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          id: postObject.id,
          title: postObject.title,
          content: postObject.content,
          category: postObject.category,
          image_url: postObject.imageUrl,
          author_name: postObject.authorName,
          author_role: postObject.authorRole,
          is_breaking: postObject.isBreaking,
          views: postObject.views,
          likes: postObject.likes,
          status: 'published',
          published_at: now,
          created_at: now
        })
        .select()
        .single();

      if (!error && data) {
        const created = mapRowToPost(data);
        const existing = getStoredPosts();
        savePosts([created, ...existing.filter(p => p.id !== created.id)]);
        return created;
      } else if (error) {
        console.warn('Supabase post creation error:', error.message);
      }
    } catch (err) {
      console.warn('Supabase post creation exception:', err);
    }
  }

  // Sync to local cache
  const existing = getStoredPosts();
  const updated = [postObject, ...existing];
  savePosts(updated);
  return postObject;
}

export async function incrementPostViews(id: string): Promise<void> {
  const supabase = getSupabase();
  if (supabase && isSupabaseConfigured()) {
    try {
      await supabase.rpc('increment_post_views', { target_post_id: id });
      return;
    } catch (e) {
      // Fallback
    }
  }

  // Local fallback
  const posts = getStoredPosts();
  const updated = posts.map(p => p.id === id ? { ...p, views: p.views + 1 } : p);
  savePosts(updated);
}

export async function incrementPostLikes(id: string): Promise<void> {
  const supabase = getSupabase();
  if (supabase && isSupabaseConfigured()) {
    try {
      await supabase.rpc('increment_post_likes', { target_post_id: id });
      return;
    } catch (e) {
      // Fallback
    }
  }

  // Local fallback
  const posts = getStoredPosts();
  const updated = posts.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p);
  savePosts(updated);
}

export function subscribeToPosts(onUpdate: () => void): () => void {
  const supabase = getSupabase();
  if (!supabase || !isSupabaseConfigured()) {
    return () => {};
  }

  const channel = supabase
    .channel('public:posts')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
      onUpdate();
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
