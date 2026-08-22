/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import { ContactRequest } from '../types';

export async function submitContactQuery(
  query: Omit<ContactRequest, 'id' | 'createdAt'>
): Promise<{ success: boolean; error?: string }> {
  const id = `query-${Date.now()}`;
  const now = new Date().toISOString();
  const newQuery: ContactRequest = {
    ...query,
    id,
    createdAt: now
  };

  const supabase = getSupabase();
  if (supabase && isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from('contact_queries')
        .insert({
          id: newQuery.id,
          name: newQuery.name,
          phone: newQuery.phone,
          email: newQuery.email,
          message: newQuery.message,
          status: 'unread',
          created_at: now
        });

      if (!error) {
        return { success: true };
      }
      console.warn('Supabase query submit error:', error.message);
    } catch (err: any) {
      console.warn('Supabase query submit exception:', err);
    }
  }

  // Local fallback
  try {
    const stored = localStorage.getItem('varta_x_queries');
    const existing = stored ? JSON.parse(stored) : [];
    localStorage.setItem('varta_x_queries', JSON.stringify([newQuery, ...existing]));
  } catch {
    // ignore
  }

  return { success: true };
}

export async function fetchContactQueries(): Promise<ContactRequest[]> {
  const supabase = getSupabase();

  if (supabase && isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('contact_queries')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map(q => ({
          id: q.id,
          name: q.name,
          phone: q.phone,
          email: q.email || 'नदारद',
          message: q.message,
          createdAt: q.created_at
        }));
      }
    } catch (err) {
      console.warn('Error fetching queries from Supabase:', err);
    }
  }

  const stored = localStorage.getItem('varta_x_queries');
  return stored ? JSON.parse(stored) : [];
}

export async function deleteContactQuery(id: string): Promise<void> {
  const supabase = getSupabase();
  if (supabase && isSupabaseConfigured()) {
    try {
      await supabase.from('contact_queries').delete().eq('id', id);
    } catch (err) {
      console.warn('Error deleting query from Supabase:', err);
    }
  }

  const stored = localStorage.getItem('varta_x_queries');
  if (stored) {
    const queries = JSON.parse(stored);
    const updated = queries.filter((q: any) => q.id !== id);
    localStorage.setItem('varta_x_queries', JSON.stringify(updated));
  }
}
