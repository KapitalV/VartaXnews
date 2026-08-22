/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve credentials from environment variables or local admin settings
export function getSupabaseCredentials(): { url: string; anonKey: string } {
  const envUrl = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_URL) || '';
  const envKey = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_ANON_KEY) || '';

  const localUrl = (typeof window !== 'undefined' ? localStorage.getItem('varta_x_supabase_url') : null) || '';
  const localKey = (typeof window !== 'undefined' ? localStorage.getItem('varta_x_supabase_anon_key') : null) || '';

  const url = (envUrl || localUrl || '').trim();
  const anonKey = (envKey || localKey || '').trim();

  return { url, anonKey };
}

// Determine if valid Supabase credentials are provided
export const isSupabaseConfigured = (): boolean => {
  const { url, anonKey } = getSupabaseCredentials();
  return Boolean(
    url && 
    anonKey && 
    url.startsWith('https://') &&
    anonKey.length > 20
  );
};

let clientInstance: SupabaseClient | null = null;
let lastUrl = '';
let lastKey = '';

export function getSupabase(): SupabaseClient | null {
  const { url, anonKey } = getSupabaseCredentials();

  if (!url || !anonKey || !url.startsWith('https://') || anonKey.length <= 20) {
    return null;
  }

  // Re-instantiate if credentials changed
  if (!clientInstance || lastUrl !== url || lastKey !== anonKey) {
    lastUrl = url;
    lastKey = anonKey;
    clientInstance = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
  }

  return clientInstance;
}

export function saveSupabaseCredentials(url: string, anonKey: string): void {
  if (typeof window !== 'undefined') {
    if (url.trim()) {
      localStorage.setItem('varta_x_supabase_url', url.trim());
    } else {
      localStorage.removeItem('varta_x_supabase_url');
    }

    if (anonKey.trim()) {
      localStorage.setItem('varta_x_supabase_anon_key', anonKey.trim());
    } else {
      localStorage.removeItem('varta_x_supabase_anon_key');
    }
  }
  // Reset cached client instance to force reload
  clientInstance = null;
  lastUrl = '';
  lastKey = '';
}

export async function testSupabaseConnection(url?: string, anonKey?: string): Promise<{ success: boolean; message: string; count?: number }> {
  try {
    const testUrl = (url || getSupabaseCredentials().url).trim();
    const testKey = (anonKey || getSupabaseCredentials().anonKey).trim();

    if (!testUrl || !testKey || !testUrl.startsWith('https://') || testKey.length <= 20) {
      return {
        success: false,
        message: 'अमान्य Supabase URL या Anon API Key। कृपया सही क्रेडेंशियल दर्ज करें।'
      };
    }

    const testClient = createClient(testUrl, testKey);
    const { data, count, error } = await testClient.from('posts').select('*', { count: 'exact', head: true });

    if (error) {
      // If table doesn't exist yet, but connection succeeded
      if (error.code === '42P01') {
        return {
          success: false,
          message: 'Supabase से कनेक्शन बन गया है, परंतु "posts" टेबल नहीं मिली। कृपया Supabase SQL Editor में स्कीमा SQL रन करें।'
        };
      }
      return {
        success: false,
        message: `Supabase एरर (${error.code || 'ERR'}): ${error.message}`
      };
    }

    return {
      success: true,
      message: `✅ Supabase PostgreSQL लाइव कनेक्टेड! (डेटाबेस में ${count || 0} समाचार उपलब्ध हैं)`,
      count: count || 0
    };
  } catch (err: any) {
    return {
      success: false,
      message: `कनेक्शन विफलता: ${err.message || 'नेटवर्क या क्रेडेंशियल एरर'}`
    };
  }
}

export const supabase = getSupabase();

