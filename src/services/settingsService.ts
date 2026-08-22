/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import { resolveImageUrl } from '../utils/imageHelper';

export interface SiteSettings {
  channelLogo: string;
  anshPhoto: string;
  siteName: string;
  tagline: string;
  phone: string;
  email: string;
}

export async function fetchSiteSettings(): Promise<Partial<SiteSettings>> {
  const supabase = getSupabase();

  if (supabase && isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*');

      if (!error && data && data.length > 0) {
        const settings: Partial<SiteSettings> = {};
        data.forEach(row => {
          if (row.key === 'channel_logo') {
            settings.channelLogo = resolveImageUrl(row.value);
          } else if (row.key === 'ansh_photo') {
            settings.anshPhoto = resolveImageUrl(row.value);
          }
        });
        return settings;
      }
    } catch (err) {
      console.warn('Error fetching site settings from Supabase:', err);
    }
  }

  const logoStored = localStorage.getItem('varta_channel_logo');
  const anshStored = localStorage.getItem('varta_ansh_photo');

  return {
    channelLogo: resolveImageUrl(logoStored || '/input_file_0.png'),
    anshPhoto: resolveImageUrl(anshStored || '/input_file_6.png'),
    siteName: 'वार्ता एक्स न्यूज़ मीडिया लाइव',
    tagline: 'सत्य, साहस और सटीक ग्राउंड रिपोर्टिंग',
    phone: '+91 6393874723',
    email: 'editor@vartaxnews.com'
  };
}

export async function updateSetting(key: string, value: any): Promise<void> {
  const supabase = getSupabase();

  if (supabase && isSupabaseConfigured()) {
    try {
      await supabase
        .from('site_settings')
        .upsert({
          key,
          value: JSON.stringify(value),
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' });
    } catch (err) {
      console.warn(`Error updating setting ${key} in Supabase:`, err);
    }
  }

  if (key === 'channel_logo') {
    try {
      localStorage.setItem('varta_channel_logo', typeof value === 'string' ? value : JSON.stringify(value));
    } catch {}
  } else if (key === 'ansh_photo') {
    try {
      localStorage.setItem('varta_ansh_photo', typeof value === 'string' ? value : JSON.stringify(value));
    } catch {}
  }
}
