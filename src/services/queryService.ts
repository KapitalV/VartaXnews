/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import { ContactRequest } from '../types';
import { safeStorageSet, safeStorageGet } from '../utils/safeStorage';

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
  const existing = safeStorageGet<ContactRequest[]>('varta_x_queries', []);
  const updated = [newQuery, ...existing].slice(0, 20);
  safeStorageSet('varta_x_queries', JSON.stringify(updated));

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

  return safeStorageGet<ContactRequest[]>('varta_x_queries', []);
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

  const queries = safeStorageGet<ContactRequest[]>('varta_x_queries', []);
  const updated = queries.filter(q => q.id !== id);
  safeStorageSet('varta_x_queries', JSON.stringify(updated));
}
