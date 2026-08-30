/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import { TeamMember } from '../types';
import { getStoredTeam, saveTeam } from '../data';

function mapRowToTeamMember(row: any): TeamMember {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    imageUrl: row.image_url || '/input_file_0.png',
    bio: row.bio || '',
    phone: row.phone || undefined,
    email: row.email || undefined
  };
}

export async function fetchTeamMembers(): Promise<TeamMember[]> {
  const supabase = getSupabase();

  if (supabase && isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (!error && data && data.length > 0) {
        const team = data.map(mapRowToTeamMember);
        saveTeam(team);
        return team;
      }
    } catch (err) {
      console.warn('Error fetching team from Supabase:', err);
    }
  }

  return getStoredTeam();
}

export async function saveTeamMembers(team: TeamMember[]): Promise<void> {
  saveTeam(team);

  const supabase = getSupabase();
  if (supabase && isSupabaseConfigured()) {
    try {
      // First, get all remote ids
      const { data: remoteData } = await supabase
        .from('team_members')
        .select('id');

      if (remoteData && remoteData.length > 0) {
        const currentIds = new Set(team.map(m => m.id));
        const toDeleteIds = remoteData.map((r: any) => r.id).filter((id: string) => !currentIds.has(id));
        if (toDeleteIds.length > 0) {
          await supabase
            .from('team_members')
            .delete()
            .in('id', toDeleteIds);
        }
      }

      for (let i = 0; i < team.length; i++) {
        const member = team[i];
        await supabase
          .from('team_members')
          .upsert({
            id: member.id,
            name: member.name,
            role: member.role,
            image_url: member.imageUrl,
            bio: member.bio,
            phone: member.phone || null,
            email: member.email || null,
            display_order: i + 1,
            is_active: true,
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' });
      }
    } catch (err) {
      console.warn('Error upserting team to Supabase:', err);
    }
  }
}

export async function deleteTeamMember(id: string): Promise<void> {
  const current = getStoredTeam().filter(m => m.id !== id);
  saveTeam(current);

  const supabase = getSupabase();
  if (supabase && isSupabaseConfigured()) {
    try {
      await supabase
        .from('team_members')
        .delete()
        .eq('id', id);
    } catch (err) {
      console.warn('Error deleting team member from Supabase:', err);
    }
  }
}

export function subscribeToTeam(onUpdate: () => void): () => void {
  const supabase = getSupabase();
  if (!supabase || !isSupabaseConfigured()) {
    return () => {};
  }

  const channel = supabase
    .channel('public:team_members')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'team_members' }, () => {
      onUpdate();
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
