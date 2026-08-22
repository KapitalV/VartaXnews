/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getSupabase, isSupabaseConfigured } from '../lib/supabase';

export interface AdminProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'super_admin' | 'editor' | 'reporter';
  phone?: string;
  avatar_url?: string;
}

const DEFAULT_SUPER_ADMIN: AdminProfile = {
  id: 'super-admin-01',
  email: 'editor@vartaxnews.com',
  full_name: 'हृद्यांश (अंश) गुप्ता',
  role: 'super_admin',
  phone: '6393874723',
  avatar_url: '/input_file_6.png'
};

const TEAM_CREDENTIALS: Record<string, AdminProfile> = {
  '6393874723': DEFAULT_SUPER_ADMIN,
  'aloneboyansh9780@gmail.com': DEFAULT_SUPER_ADMIN,
  'editor@vartaxnews.com': DEFAULT_SUPER_ADMIN,
  'vn-admin-001': DEFAULT_SUPER_ADMIN,
  'team-1': DEFAULT_SUPER_ADMIN,
  'admin': DEFAULT_SUPER_ADMIN,
  '9876543210': {
    id: 'team-2',
    email: 'ankesh@vartaxnews.com',
    full_name: 'अंकेश गुप्ता (कटेरा ग्राउंड रिपोर्टर)',
    role: 'reporter',
    phone: '9876543210',
    avatar_url: '/input_file_7.png'
  },
  'vn-kat-002': {
    id: 'team-2',
    email: 'ankesh@vartaxnews.com',
    full_name: 'अंकेश गुप्ता (कटेरा ग्राउंड रिपोर्टर)',
    role: 'reporter',
    phone: '9876543210',
    avatar_url: '/input_file_7.png'
  },
  'ankesh@vartaxnews.com': {
    id: 'team-2',
    email: 'ankesh@vartaxnews.com',
    full_name: 'अंकेश गुप्ता (कटेरा ग्राउंड रिपोर्टर)',
    role: 'reporter',
    phone: '9876543210',
    avatar_url: '/input_file_7.png'
  },
  'team-2': {
    id: 'team-2',
    email: 'ankesh@vartaxnews.com',
    full_name: 'अंकेश गुप्ता (कटेरा ग्राउंड रिपोर्टर)',
    role: 'reporter',
    phone: '9876543210',
    avatar_url: '/input_file_7.png'
  },
  '9876543211': {
    id: 'team-3',
    email: 'hemant@vartaxnews.com',
    full_name: 'हेमंत राजपूत (कटेरा देहात रिपोर्टर)',
    role: 'reporter',
    phone: '9876543211',
    avatar_url: '/input_file_4.png'
  },
  'vn-deh-003': {
    id: 'team-3',
    email: 'hemant@vartaxnews.com',
    full_name: 'हेमंत राजपूत (कटेरा देहात रिपोर्टर)',
    role: 'reporter',
    phone: '9876543211',
    avatar_url: '/input_file_4.png'
  },
  'hemant@vartaxnews.com': {
    id: 'team-3',
    email: 'hemant@vartaxnews.com',
    full_name: 'हेमंत राजपूत (कटेरा देहात रिपोर्टर)',
    role: 'reporter',
    phone: '9876543211',
    avatar_url: '/input_file_4.png'
  },
  'team-3': {
    id: 'team-3',
    email: 'hemant@vartaxnews.com',
    full_name: 'हेमंत राजपूत (कटेरा देहात रिपोर्टर)',
    role: 'reporter',
    phone: '9876543211',
    avatar_url: '/input_file_4.png'
  }
};

export async function loginAdmin(
  identifier: string, 
  password: string
): Promise<{ success: boolean; profile?: AdminProfile; error?: string }> {
  const trimmedId = identifier.trim();
  const normalizedId = trimmedId.toLowerCase().replace(/[\s\-\+]/g, '').replace(/^91/, '');
  const rawIdLower = trimmedId.toLowerCase();
  const trimmedPass = password.trim();

  const supabase = getSupabase();

  // If Supabase is connected, attempt Supabase Auth first
  if (supabase && isSupabaseConfigured()) {
    try {
      const emailToUse = trimmedId.includes('@') 
        ? trimmedId 
        : `reporter_${normalizedId || trimmedId}@vartaxnews.internal`;

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password: trimmedPass,
      });

      if (!authError && authData?.user) {
        // Fetch user profile from PostgreSQL
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        const profile: AdminProfile = profileData ? {
          id: profileData.id,
          email: profileData.email || authData.user.email || '',
          full_name: profileData.full_name || 'वार्ता एक्स रिपोर्टर',
          role: profileData.role || 'reporter',
          phone: profileData.phone,
          avatar_url: profileData.avatar_url
        } : {
          id: authData.user.id,
          email: authData.user.email || '',
          full_name: 'वार्ता एक्स रिपोर्टर',
          role: 'reporter',
          avatar_url: '/input_file_0.png'
        };

        return { success: true, profile };
      }
    } catch (err: any) {
      console.warn('Supabase Auth attempt note:', err);
    }
  }

  // Check stored custom admin password or default password
  const storedPassword = (typeof window !== 'undefined' ? localStorage.getItem('varta_x_admin_password') : null) || 'Ansh@2012';
  const storedPhone = (typeof window !== 'undefined' ? localStorage.getItem('varta_x_admin_phone') : null) || '6393874723';
  const normalizedStoredPhone = storedPhone.replace(/[\s\-\+]/g, '').replace(/^91/, '');

  const isPasswordCorrect = (
    trimmedPass === 'Ansh@2012' || 
    trimmedPass === storedPassword
  );

  if (isPasswordCorrect) {
    // Check if ID matches stored phone or any team member ID
    if (
      normalizedId === normalizedStoredPhone ||
      normalizedId === '6393874723' ||
      rawIdLower === 'aloneboyansh9780@gmail.com' ||
      rawIdLower === 'editor@vartaxnews.com' ||
      rawIdLower === 'vn-admin-001' ||
      rawIdLower === 'team-1' ||
      rawIdLower === 'admin'
    ) {
      return {
        success: true,
        profile: DEFAULT_SUPER_ADMIN
      };
    }

    // Check other team reporter credentials
    const matchedProfile = TEAM_CREDENTIALS[normalizedId] || TEAM_CREDENTIALS[rawIdLower];
    if (matchedProfile) {
      return {
        success: true,
        profile: matchedProfile
      };
    }
  }

  return {
    success: false,
    error: 'गलत रिपोर्टर आईडी या प्रेस पासवर्ड!'
  };
}

export async function logoutAdmin(): Promise<void> {
  const supabase = getSupabase();
  if (supabase && isSupabaseConfigured()) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Error signing out from Supabase:', e);
    }
  }
}

export async function getActiveSession(): Promise<AdminProfile | null> {
  const supabase = getSupabase();
  if (supabase && isSupabaseConfigured()) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          return profile as AdminProfile;
        }
        return {
          id: session.user.id,
          email: session.user.email || '',
          full_name: session.user.user_metadata?.full_name || 'वार्ता एक्स रिपोर्टर',
          role: session.user.user_metadata?.role || 'reporter',
          avatar_url: session.user.user_metadata?.avatar_url || '/input_file_0.png'
        };
      }
    } catch (e) {
      console.warn('Failed to retrieve active Supabase session:', e);
    }
  }
  return null;
}
