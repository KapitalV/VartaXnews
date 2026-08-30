import { LocalAd } from '../types';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';

const LOCAL_STORAGE_KEY = 'varta_local_ads';

export function getStoredLocalAds(): LocalAd[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveStoredLocalAds(ads: LocalAd[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(ads));
    window.dispatchEvent(new CustomEvent('varta_ads_updated', { detail: ads }));
  } catch (err) {
    console.error('Error saving local ads:', err);
  }
}

export async function fetchActiveLocalAds(): Promise<LocalAd[]> {
  const supabase = getSupabase();
  if (supabase && isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('local_ads')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped: LocalAd[] = data.map((d: any) => ({
          id: d.id,
          clientName: d.client_name || d.clientName || 'प्रायोजक',
          bannerUrl: d.banner_url || d.bannerUrl || '',
          targetUrl: d.target_url || d.targetUrl || '',
          phone: d.phone || '',
          slot: d.slot || 'article_modal',
          tickerText: d.ticker_text || d.tickerText || '',
          isActive: Boolean(d.is_active ?? d.isActive ?? true),
          startDate: d.start_date || d.startDate,
          endDate: d.end_date || d.endDate,
          createdAt: d.created_at || d.createdAt || new Date().toISOString()
        }));
        saveStoredLocalAds(mapped);
        return mapped;
      }
    } catch (e) {
      console.warn('Supabase local_ads fetch fallback:', e);
    }
  }

  return getStoredLocalAds();
}

export async function saveLocalAd(adData: Omit<LocalAd, 'id' | 'createdAt'> & { id?: string }): Promise<LocalAd> {
  const id = adData.id || `ad_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const newAd: LocalAd = {
    ...adData,
    id,
    createdAt: now
  };

  const existing = getStoredLocalAds();
  const index = existing.findIndex(a => a.id === id);
  let updatedList: LocalAd[];
  if (index >= 0) {
    updatedList = [...existing];
    updatedList[index] = { ...existing[index], ...newAd };
  } else {
    updatedList = [newAd, ...existing];
  }
  saveStoredLocalAds(updatedList);

  const supabase = getSupabase();
  if (supabase && isSupabaseConfigured()) {
    try {
      await supabase.from('local_ads').upsert({
        id: newAd.id,
        client_name: newAd.clientName,
        banner_url: newAd.bannerUrl,
        target_url: newAd.targetUrl || '',
        phone: newAd.phone || '',
        slot: newAd.slot,
        ticker_text: newAd.tickerText || '',
        is_active: newAd.isActive,
        start_date: newAd.startDate || null,
        end_date: newAd.endDate || null,
        created_at: newAd.createdAt
      });
    } catch (e) {
      console.warn('Supabase ad sync error:', e);
    }
  }

  return newAd;
}

export async function toggleLocalAdStatus(id: string, isActive: boolean): Promise<void> {
  const existing = getStoredLocalAds();
  const updated = existing.map(a => a.id === id ? { ...a, isActive } : a);
  saveStoredLocalAds(updated);

  const supabase = getSupabase();
  if (supabase && isSupabaseConfigured()) {
    try {
      await supabase.from('local_ads').update({ is_active: isActive }).eq('id', id);
    } catch (e) {
      console.warn('Error toggling ad status in supabase:', e);
    }
  }
}

export async function deleteLocalAd(id: string): Promise<void> {
  const existing = getStoredLocalAds();
  const updated = existing.filter(a => a.id !== id);
  saveStoredLocalAds(updated);

  const supabase = getSupabase();
  if (supabase && isSupabaseConfigured()) {
    try {
      await supabase.from('local_ads').delete().eq('id', id);
    } catch (e) {
      console.warn('Error deleting ad from supabase:', e);
    }
  }
}
