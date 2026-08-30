/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import { safeStorageSet, safeStorageGet } from '../utils/safeStorage';

export interface CommentItem {
  id?: string;
  name: string;
  text: string;
  date: string;
}

export async function fetchComments(postId: string): Promise<CommentItem[]> {
  const supabase = getSupabase();

  if (supabase && isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (!error && data && data.length > 0) {
        const comments = data.map(c => ({
          id: c.id,
          name: c.author_name,
          text: c.content,
          date: c.created_at
        }));
        safeStorageSet(`comments_${postId}`, JSON.stringify(comments.slice(0, 10)));
        return comments;
      }
    } catch (err) {
      console.warn('Error fetching comments from Supabase:', err);
    }
  }

  // Local fallback
  const key = `comments_${postId}`;
  const stored = safeStorageGet<CommentItem[]>(key, []);
  if (Array.isArray(stored) && stored.length > 0) {
    return stored;
  }

  // Seed default initial comments
  return [
    { name: 'राम प्रकाश पाठक', text: 'सच्ची और सटीक रिपोर्टिंग! वार्ता एक्स न्यूज़ को बधाई।', date: new Date(Date.now() - 3600000 * 3).toISOString() },
    { name: 'दीपक शर्मा', text: 'राधा रानी मंदिर और कटेरा देहात की निष्पक्ष कवरेज के लिए अंश भैया का धन्यवाद।', date: new Date(Date.now() - 3600000 * 1.5).toISOString() }
  ];
}

export async function addComment(
  postId: string, 
  authorName: string, 
  content: string
): Promise<CommentItem> {
  const now = new Date().toISOString();
  const newComment: CommentItem = {
    name: authorName,
    text: content,
    date: now
  };

  const supabase = getSupabase();
  if (supabase && isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          author_name: authorName,
          content: content,
          status: 'approved'
        })
        .select()
        .single();

      if (!error && data) {
        return {
          id: data.id,
          name: data.author_name,
          text: data.content,
          date: data.created_at
        };
      } else if (error) {
        console.warn('Supabase comment insert warning:', error.message);
      }
    } catch (err) {
      console.warn('Error saving comment to Supabase:', err);
    }
  }

  // Local fallback
  const key = `comments_${postId}`;
  const existing = safeStorageGet<CommentItem[]>(key, []);
  const updated = [...existing, newComment].slice(0, 15);
  safeStorageSet(key, JSON.stringify(updated));

  return newComment;
}

export function subscribeToComments(postId: string, onUpdate: () => void): () => void {
  const supabase = getSupabase();
  if (!supabase || !isSupabaseConfigured()) {
    return () => {};
  }

  const channel = supabase
    .channel(`public:comments:${postId}`)
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'comments',
      filter: `post_id=eq.${postId}`
    }, () => {
      onUpdate();
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
