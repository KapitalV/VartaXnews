/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Clean up any deprecated localStorage keys from previous versions
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('varta_x_supabase_url');
    localStorage.removeItem('varta_x_supabase_anon_key');
    localStorage.removeItem('varta_supabase_config');
  } catch {
    // Ignore storage access issues in restricted iframes
  }
}

// Single singleton Supabase client instance and runtime config storage
let clientInstance: SupabaseClient | null = null;
let runtimeUrl = '';
let runtimeAnonKey = '';
let isHydratingRuntime = false;

/**
 * Retrieves environment-injected or runtime-fetched Supabase configuration.
 * In production Vite builds, these come directly from import.meta.env, window.__VARTA_ENV__,
 * or runtime /api/config response.
 */
export function getSupabaseEnvConfig(): { url: string; anonKey: string } {
  const env = (typeof import.meta !== 'undefined' ? (import.meta as any).env : {}) || {};
  const winEnv = (typeof window !== 'undefined' ? (window as any).__VARTA_ENV__ : {}) || {};

  const url = (env.VITE_SUPABASE_URL || winEnv.VITE_SUPABASE_URL || runtimeUrl || '').trim();
  const anonKey = (env.VITE_SUPABASE_ANON_KEY || winEnv.VITE_SUPABASE_ANON_KEY || runtimeAnonKey || '').trim();

  return { url, anonKey };
}

/**
 * Checks whether Supabase has been properly configured via build environment variables or runtime.
 */
export const isSupabaseConfigured = (): boolean => {
  const { url, anonKey } = getSupabaseEnvConfig();
  return Boolean(
    url && 
    anonKey && 
    url.startsWith('https://') &&
    anonKey.length > 20
  );
};

/**
 * Hydrates Supabase credentials asynchronously from the server /api/config endpoint
 * if not baked in at build time.
 */
export async function initSupabaseRuntimeConfig(): Promise<boolean> {
  if (isSupabaseConfigured()) {
    return true;
  }

  if (isHydratingRuntime) {
    return false;
  }

  if (typeof window === 'undefined') {
    return false;
  }

  isHydratingRuntime = true;

  try {
    const res = await fetch('/api/config', { cache: 'no-store' });
    if (!res.ok) {
      isHydratingRuntime = false;
      return false;
    }

    const data = await res.json();
    if (data?.supabaseUrl && data?.supabaseAnonKey) {
      runtimeUrl = data.supabaseUrl.trim();
      runtimeAnonKey = data.supabaseAnonKey.trim();

      // Reset client instance so it rebuilds with runtime credentials
      clientInstance = null;

      if (isSupabaseConfigured()) {
        const client = getSupabase();
        if (client) {
          window.dispatchEvent(new CustomEvent('varta_supabase_ready', {
            detail: { url: runtimeUrl }
          }));
          isHydratingRuntime = false;
          return true;
        }
      }
    }
  } catch (err) {
    // Fail silently, fallback to safe local storage
  }

  isHydratingRuntime = false;
  return false;
}

// Auto-trigger runtime hydration on browser load if build env vars were missing
if (typeof window !== 'undefined' && !isSupabaseConfigured()) {
  initSupabaseRuntimeConfig();
}

/**
 * Returns a safely masked version of the Supabase Project URL for debugging / UI display.
 * Never exposes API keys or full project paths.
 */
export function getMaskedSupabaseUrl(): string {
  const { url } = getSupabaseEnvConfig();
  if (!url) return 'Not Configured';
  try {
    const parsed = new URL(url);
    const host = parsed.hostname;
    if (host.length > 12) {
      const start = host.slice(0, 6);
      const end = host.slice(-8);
      return `https://${start}***${end}`;
    }
    return `https://${host}`;
  } catch {
    return 'https://***.supabase.co';
  }
}

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!clientInstance) {
    const { url, anonKey } = getSupabaseEnvConfig();
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

export interface SupabaseHealthCheckResult {
  success: boolean;
  message: string;
  isConfigured: boolean;
  maskedUrl?: string;
  postsCount: number;
  teamCount: number;
  videosCount: number;
  error?: string;
}

/**
 * Performs a comprehensive health check and live count retrieval from Supabase PostgreSQL.
 */
export async function testSupabaseConnection(): Promise<SupabaseHealthCheckResult> {
  const isConfigured = isSupabaseConfigured();
  const maskedUrl = getMaskedSupabaseUrl();

  if (!isConfigured) {
    return {
      success: false,
      isConfigured: false,
      maskedUrl,
      postsCount: 0,
      teamCount: 0,
      videosCount: 0,
      message: 'Supabase पर्यावरण वेरिएबल्स (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY) उपलब्ध नहीं हैं। सिस्टम वर्तमान में सुरक्षित ऑफलाइन कैश मोड में चल रहा है।',
      error: 'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY build environment variables.'
    };
  }

  const client = getSupabase();
  if (!client) {
    return {
      success: false,
      isConfigured: true,
      maskedUrl,
      postsCount: 0,
      teamCount: 0,
      videosCount: 0,
      message: 'Supabase क्लाइंट प्रारंभ नहीं हो सका। कृपया URL और Anon Key की जांच करें।',
      error: 'Client initialization failed'
    };
  }

  try {
    // 1. Fetch count from varta_news_posts, fallback to posts
    let postsCount = 0;
    const { count: vartaPostsCount, error: vartaPostsErr } = await client
      .from('varta_news_posts')
      .select('*', { count: 'exact', head: true });

    if (!vartaPostsErr && typeof vartaPostsCount === 'number') {
      postsCount = vartaPostsCount;
    } else {
      const { count: legacyPostsCount, error: legacyErr } = await client
        .from('posts')
        .select('*', { count: 'exact', head: true });
      if (!legacyErr && typeof legacyPostsCount === 'number') {
        postsCount = legacyPostsCount;
      }
    }

    // 2. Fetch count from team_members
    let teamCount = 0;
    const { count: tCount, error: tErr } = await client
      .from('team_members')
      .select('*', { count: 'exact', head: true });
    if (!tErr && typeof tCount === 'number') {
      teamCount = tCount;
    }

    // 3. Fetch count from videos
    let videosCount = 0;
    const { count: vCount, error: vErr } = await client
      .from('videos')
      .select('*', { count: 'exact', head: true });
    if (!vErr && typeof vCount === 'number') {
      videosCount = vCount;
    }

    return {
      success: true,
      isConfigured: true,
      maskedUrl,
      postsCount,
      teamCount,
      videosCount,
      message: `🟢 Supabase Live PostgreSQL कनेक्टेड! (${postsCount} समाचार, ${teamCount} रिपोर्टर, ${videosCount} वीडियो बुलेटिन)`
    };
  } catch (err: any) {
    return {
      success: false,
      isConfigured: true,
      maskedUrl,
      postsCount: 0,
      teamCount: 0,
      videosCount: 0,
      message: `🔴 Supabase कनेक्शन विफल: ${err.message || 'नेटवर्क त्रुटि'}`,
      error: err.message || 'Unknown network error'
    };
  }
}

export const supabase = getSupabase();
