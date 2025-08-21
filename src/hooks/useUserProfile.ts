import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  epic_id: string | null;
  epic_username: string | null;
  discord_id: string | null;
  discord_username: string | null;
  snipes: number;
  balance: number;
}

export function useUserProfile(user: User | null) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrCreateProfile = async () => {
    if (!user) {
      setProfile(null);
      return;
    }
    setLoading(true);
    setError(null);

    // Try to fetch
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    if (error && error.code === 'PGRST116') {
      // Not found, create
      const { data: newData, error: insertError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          discord_id: user.user_metadata?.provider_id || null,
          discord_username: user.user_metadata?.full_name || user.email || null,
          snipes: 0,
          balance: 0.00
        })
        .select()
        .single();
      if (insertError) {
        setError(insertError.message);
        setProfile(null);
      } else {
        setProfile(newData as UserProfile);
      }
    } else if (error) {
      setError(error.message);
      setProfile(null);
    } else {
      setProfile(data as UserProfile);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrCreateProfile();
  }, [user]);

  const refreshProfile = () => {
    fetchOrCreateProfile();
  };

  return { profile, loading, error, refreshProfile };
}
