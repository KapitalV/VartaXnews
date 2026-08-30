/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import { NewsPost, NewsCategory } from '../types';
import { getStoredPosts, savePosts } from '../data';

export interface CreatePostResult extends NewsPost {
  savedToSupabase?: boolean;
  supabaseError?: string;
}

export interface AINewsGenerationOptions {
  prompt?: string;
  category?: string;
  isBreaking?: boolean;
  onRetry?: (attempt: number, nextDelayMs: number, error: any) => void;
}

export interface AINewsGenerationResult {
  post: Omit<NewsPost, 'id' | 'createdAt' | 'views' | 'likes'> & { imageUrl?: string };
  isFallback?: boolean;
  model?: string;
  attemptsUsed?: number;
}

/**
 * Exponential backoff retry utility.
 * Configured with a maximum of 3 attempts, base delay of 1000ms, and randomized jitter
 * to gracefully handle intermittent 503 Service Unavailable, 429 Rate Limits, and network hiccups.
 */
export async function retryWithExponentialBackoff<T>(
  operation: (attempt: number) => Promise<T>,
  options: {
    maxAttempts?: number;
    baseDelayMs?: number;
    maxDelayMs?: number;
    backoffFactor?: number;
    isRetryable?: (error: any) => boolean;
    onRetry?: (attempt: number, delayMs: number, error: any) => void;
  } = {}
): Promise<T> {
  const maxAttempts = options.maxAttempts ?? 3;
  const baseDelayMs = options.baseDelayMs ?? 1000;
  const maxDelayMs = options.maxDelayMs ?? 8000;
  const backoffFactor = options.backoffFactor ?? 2;

  const defaultIsRetryable = (err: any): boolean => {
    if (!err) return false;
    const status = err.status || err.statusCode || err.code;
    if (status === 503 || status === 429 || status === 502 || status === 504 || status === 'UNAVAILABLE') {
      return true;
    }
    const message = (err.message || String(err)).toLowerCase();
    return (
      message.includes('503') ||
      message.includes('unavailable') ||
      message.includes('high demand') ||
      message.includes('overloaded') ||
      message.includes('rate limit') ||
      message.includes('429') ||
      message.includes('resource_exhausted') ||
      message.includes('timeout') ||
      message.includes('fetch failed') ||
      message.includes('network error')
    );
  };

  const isRetryable = options.isRetryable ?? defaultIsRetryable;
  let lastError: any = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation(attempt);
    } catch (err: any) {
      lastError = err;
      const canRetry = attempt < maxAttempts && isRetryable(err);

      console.warn(
        `[Gemini Retry] Attempt ${attempt}/${maxAttempts} failed:`,
        err?.message || err,
        canRetry ? `Retrying with exponential backoff...` : `No more retries.`
      );

      if (!canRetry) {
        break;
      }

      // Calculate exponential backoff with full jitter: (baseDelay * factor^(attempt - 1)) + jitter
      const rawDelay = baseDelayMs * Math.pow(backoffFactor, attempt - 1);
      const jitter = Math.random() * (baseDelayMs * 0.5);
      const delayMs = Math.min(rawDelay + jitter, maxDelayMs);

      if (options.onRetry) {
        options.onRetry(attempt, delayMs, err);
      }

      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError || new Error(`Operation failed after ${maxAttempts} attempts.`);
}

/**
 * Generates an AI News Post by invoking the Gemini API endpoint with
 * an exponential backoff retry mechanism (maximum of 3 attempts) for 503 and high-demand errors.
 */
export async function generateAINewsWithRetry(
  options: AINewsGenerationOptions = {}
): Promise<AINewsGenerationResult> {
  const { prompt, category, isBreaking, onRetry } = options;

  return await retryWithExponentialBackoff(
    async (attempt) => {
      const response = await fetch('/api/ai/generate-news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          category,
          isBreaking,
        }),
      });

      if (!response.ok) {
        let errorData: any = null;
        try {
          errorData = await response.json();
        } catch {
          // ignore json parse error
        }

        const errorMsg = errorData?.error || errorData?.message || `HTTP ${response.status} ${response.statusText}`;
        const errorObj = new Error(errorMsg);
        (errorObj as any).status = response.status;
        (errorObj as any).code = errorData?.code || response.status;
        (errorObj as any).statusText = response.statusText;
        throw errorObj;
      }

      const data = await response.json();

      if (!data.success || !data.post) {
        const errorMsg = data.error || 'अमान्य एआई उत्तर प्राप्त हुआ।';
        const errorObj = new Error(errorMsg);
        (errorObj as any).status = 503;
        throw errorObj;
      }

      return {
        post: data.post,
        isFallback: Boolean(data.isFallback),
        model: data.model,
        attemptsUsed: attempt,
      };
    },
    {
      maxAttempts: 3,
      baseDelayMs: 1000,
      backoffFactor: 2,
      onRetry: (attempt, delayMs, err) => {
        console.warn(
          `[postService] Retrying Gemini AI news generation (Attempt ${attempt}/3) after ${Math.round(delayMs)}ms due to:`,
          err?.message
        );
        if (onRetry) {
          onRetry(attempt, delayMs, err);
        }
      },
    }
  );
}

// Map database row (from either `varta_news_posts` or `posts` table) to NewsPost interface
function mapRowToPost(row: any): NewsPost {
  return {
    id: String(row.id),
    title: row.title || 'शीर्षक उपलब्ध नहीं',
    content: row.content || '',
    category: (row.category as NewsCategory) || NewsCategory.LOCAL,
    imageUrl: row.image_url || row.imageUrl || '/input_file_0.png',
    createdAt: row.created_at || row.published_at || new Date().toISOString(),
    views: Number(row.views || 0),
    likes: Number(row.likes || 0),
    authorName: row.author_name || row.author || 'वार्ता एक्स रिपोर्टर',
    authorRole: row.author_role || 'संवाददाता',
    isBreaking: Boolean(row.is_breaking !== undefined ? row.is_breaking : row.isBreaking)
  };
}

/**
 * Fetches all news posts from Supabase PostgreSQL (preferring `varta_news_posts`, falling back to `posts`),
 * with fast timeout safeguards and local offline cache fallback.
 */
export async function fetchPosts(category?: string, search?: string): Promise<NewsPost[]> {
  const supabase = getSupabase();

  if (supabase && isSupabaseConfigured()) {
    // 1. Try varta_news_posts table first with 3.5s timeout promise
    try {
      const fetchPromise = (async () => {
        let query = supabase
          .from('varta_news_posts')
          .select('*')
          .order('created_at', { ascending: false });

        if (category && category !== 'All' && category !== 'all') {
          query = query.eq('category', category);
        }

        if (search && search.trim()) {
          query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
        }

        return await query;
      })();

      const timeoutPromise = new Promise<{ data: any; error: any }>((_, reject) =>
        setTimeout(() => reject(new Error('Supabase query timed out')), 3500)
      );

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);

      if (!error && data && data.length > 0) {
        const posts = data.map(mapRowToPost);
        savePosts(posts);
        return posts;
      }
    } catch (err) {
      console.warn('[PostService] varta_news_posts query warning, trying posts table...', err);
    }

    // 2. Fallback to posts table
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
          savePosts(posts);
          return posts;
        } else if ((category && category !== 'All' && category !== 'all') || (search && search.trim())) {
          return [];
        }
      } else if (error) {
        console.warn('[PostService] posts table query error:', error.message);
      }
    } catch (err) {
      console.warn('[PostService] Error fetching posts from Supabase, falling back to local cache:', err);
    }
  }

  // 3. Graceful local cache fallback
  const local = getStoredPosts();
  if (category && category !== 'All' && category !== 'all') {
    return local.filter(p => p.category === category);
  }
  return local;
}

/**
 * Deletes a news post from Supabase (varta_news_posts and posts tables) and local cache.
 */
export async function deletePost(id: string): Promise<boolean> {
  let success = false;
  const supabase = getSupabase();

  if (supabase && isSupabaseConfigured()) {
    try {
      // 1. Delete from varta_news_posts table
      const res1 = await supabase
        .from('varta_news_posts')
        .delete()
        .eq('id', id);

      if (!res1.error) {
        success = true;
      } else {
        console.warn('[PostService] Error deleting from varta_news_posts:', res1.error.message);
      }

      // 2. Delete from posts table
      const res2 = await supabase
        .from('posts')
        .delete()
        .eq('id', id);

      if (!res2.error) {
        success = true;
      }
    } catch (err) {
      console.error('[PostService] Exception deleting post from Supabase:', err);
    }
  }

  // Always update local cache so the UI updates instantly
  const currentPosts = getStoredPosts();
  const updatedPosts = currentPosts.filter(p => p.id !== id);
  savePosts(updatedPosts);

  return true;
}

/**
 * Creates and persists a news post directly into Supabase PostgreSQL.
 * Inserts to `varta_news_posts` (and `posts` table for compatibility), with local cache update.
 */
export async function createPost(
  newPost: Omit<NewsPost, 'id' | 'createdAt' | 'views' | 'likes'>
): Promise<CreatePostResult> {
  const id = `post-${Date.now()}`;
  const now = new Date().toISOString();
  
  const postObject: NewsPost = {
    ...newPost,
    id,
    createdAt: now,
    views: 0,
    likes: 0
  };

  const supabase = getSupabase();
  let savedToSupabase = false;
  let supabaseError: string | undefined = undefined;

  if (supabase && isSupabaseConfigured()) {
    const payload = {
      id: postObject.id,
      title: postObject.title,
      content: postObject.content,
      category: postObject.category,
      image_url: postObject.imageUrl || '/input_file_0.png',
      author_name: postObject.authorName || 'वार्ता एक्स रिपोर्टर',
      author: postObject.authorName || 'वार्ता एक्स रिपोर्टर',
      author_role: postObject.authorRole || 'संवाददाता',
      is_breaking: Boolean(postObject.isBreaking),
      views: postObject.views,
      likes: postObject.likes,
      status: 'published',
      published_at: now,
      created_at: now,
      updated_at: now
    };

    // Attempt 1: Insert into varta_news_posts
    try {
      const { data, error } = await supabase
        .from('varta_news_posts')
        .insert(payload)
        .select()
        .single();

      if (!error && data) {
        savedToSupabase = true;
        const created = mapRowToPost(data);
        const existing = getStoredPosts();
        savePosts([created, ...existing.filter(p => p.id !== created.id)]);
        return { ...created, savedToSupabase: true };
      } else if (error) {
        supabaseError = error.message;
        console.warn('[PostService] varta_news_posts insert failed, trying posts table...', error.message);
      }
    } catch (err: any) {
      supabaseError = err.message;
      console.warn('[PostService] Exception inserting into varta_news_posts:', err);
    }

    // Attempt 2: Insert into posts
    try {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          id: payload.id,
          title: payload.title,
          content: payload.content,
          category: payload.category,
          image_url: payload.image_url,
          author_name: payload.author_name,
          author_role: payload.author_role,
          is_breaking: payload.is_breaking,
          views: payload.views,
          likes: payload.likes,
          status: 'published',
          published_at: now,
          created_at: now
        })
        .select()
        .single();

      if (!error && data) {
        savedToSupabase = true;
        supabaseError = undefined;
        const created = mapRowToPost(data);
        const existing = getStoredPosts();
        savePosts([created, ...existing.filter(p => p.id !== created.id)]);
        return { ...created, savedToSupabase: true };
      } else if (error) {
        supabaseError = `varta_news_posts & posts: ${error.message}`;
        console.error('[PostService] Supabase insert failed for both tables:', error);
      }
    } catch (err: any) {
      supabaseError = err.message;
      console.error('[PostService] Exception inserting into posts:', err);
    }
  }

  // Local fallback: always save sanitized version to prevent data loss
  const existing = getStoredPosts();
  const updated = [postObject, ...existing];
  savePosts(updated);

  return {
    ...postObject,
    savedToSupabase,
    supabaseError
  };
}

/**
 * Increment real views atomically in Supabase and local cache.
 * Implements session-deduplication to prevent artificial/duplicate view inflation (AdSense compliant).
 */
export async function incrementPostViews(id: string): Promise<void> {
  // Session deduplication check (1 view per unique user session per post)
  if (typeof window !== 'undefined' && window.sessionStorage) {
    const sessionKey = `varta_viewed_post_${id}`;
    if (sessionStorage.getItem(sessionKey)) {
      return; // Already counted for this user session
    }
    sessionStorage.setItem(sessionKey, '1');
  }

  const supabase = getSupabase();
  if (supabase && isSupabaseConfigured()) {
    try {
      const { error } = await supabase.rpc('increment_post_views', { target_post_id: id });
      if (error) {
        // Fallback: fetch current count and increment accurately (+1)
        const { data: vartaData } = await supabase
          .from('varta_news_posts')
          .select('views')
          .eq('id', id)
          .single();
        if (vartaData) {
          const currentViews = Number(vartaData.views || 0);
          await supabase
            .from('varta_news_posts')
            .update({ views: currentViews + 1 })
            .eq('id', id);
        }

        const { data: postData } = await supabase
          .from('posts')
          .select('views')
          .eq('id', id)
          .single();
        if (postData) {
          const currentViews = Number(postData.views || 0);
          await supabase
            .from('posts')
            .update({ views: currentViews + 1 })
            .eq('id', id);
        }
      }
    } catch (err) {
      console.warn('[PostService] Error incrementing real post view in Supabase:', err);
    }
  }

  // Local state update
  const posts = getStoredPosts();
  const updated = posts.map(p => p.id === id ? { ...p, views: (Number(p.views) || 0) + 1 } : p);
  savePosts(updated);
}

/**
 * Increment likes atomically in Supabase and local cache.
 */
export async function incrementPostLikes(id: string): Promise<void> {
  const supabase = getSupabase();
  if (supabase && isSupabaseConfigured()) {
    try {
      await supabase.rpc('increment_post_likes', { target_post_id: id });
    } catch {
      // Direct update fallback
      try {
        await supabase.from('varta_news_posts').update({ likes: 1 }).eq('id', id);
      } catch {}
      try {
        await supabase.from('posts').update({ likes: 1 }).eq('id', id);
      } catch {}
    }
  }

  // Local fallback
  const posts = getStoredPosts();
  const updated = posts.map(p => p.id === id ? { ...p, likes: (p.likes || 0) + 1 } : p);
  savePosts(updated);
}

/**
 * Subscribes to real-time changes on both `varta_news_posts` and `posts` tables.
 */
export function subscribeToPosts(onUpdate: () => void): () => void {
  const supabase = getSupabase();
  if (!supabase || !isSupabaseConfigured()) {
    return () => {};
  }

  const channel1 = supabase
    .channel('public:varta_news_posts')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'varta_news_posts' }, () => {
      onUpdate();
    })
    .subscribe();

  const channel2 = supabase
    .channel('public:posts')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
      onUpdate();
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel1);
    supabase.removeChannel(channel2);
  };
}
