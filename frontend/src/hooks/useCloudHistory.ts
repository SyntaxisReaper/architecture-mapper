import { useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Architecture } from '../types';

const PROMPT_VERSION = 'v1';

export function useCloudHistory(userId: string | undefined) {
  /** Save a newly generated architecture to Supabase */
  const saveArchitecture = useCallback(
    async (arch: Architecture): Promise<string | null> => {
      if (!isSupabaseConfigured || !userId) return null;

      // Build a short random share slug
      const slug = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

      const { data, error } = await supabase
        .from('architectures')
        .insert({
          user_id: userId,
          title: arch.title,
          project_type: arch.projectType,
          scale: arch.scale,
          json_data: arch,
          version: arch.version,
          prompt_version: PROMPT_VERSION,
          is_public: false,
          share_slug: slug,
        })
        .select('id')
        .single();

      if (error) {
        console.error('[saveArchitecture]', error.message);
        return null;
      }

      // Increment total_generated on user profile
      await supabase.rpc('increment_total_generated', { user_id_param: userId }).then(() => {});

      return data?.id ?? null;
    },
    [userId]
  );

  /** Update an existing architecture row (after refinement) */
  const updateArchitecture = useCallback(
    async (archId: string, arch: Architecture): Promise<void> => {
      if (!isSupabaseConfigured || !userId || !archId) return;

      await supabase
        .from('architectures')
        .update({
          title: arch.title,
          json_data: arch,
          version: arch.version,
          updated_at: new Date().toISOString(),
        })
        .eq('id', archId)
        .eq('user_id', userId);
    },
    [userId]
  );

  /** Log a refinement feedback message */
  const logFeedback = useCallback(
    async (archId: string, message: string): Promise<void> => {
      if (!isSupabaseConfigured || !userId || !archId) return;

      await supabase.from('feedback_log').insert({
        arch_id: archId,
        user_id: userId,
        message,
      });
    },
    [userId]
  );

  /** Fetch last 20 architectures for this user */
  const fetchHistory = useCallback(async (): Promise<
    { id: string; title: string; project_type: string; scale: string; created_at: string; version: number; share_slug: string; json_data: Architecture }[]
  > => {
    if (!isSupabaseConfigured || !userId) return [];

    const { data, error } = await supabase
      .from('architectures')
      .select('id, title, project_type, scale, created_at, version, share_slug, json_data')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('[fetchHistory]', error.message);
      return [];
    }

    return data ?? [];
  }, [userId]);

  /** Fetch last 8 feedback messages for a user (for prompt injection) */
  const fetchRecentFeedbacks = useCallback(async (): Promise<string[]> => {
    if (!isSupabaseConfigured || !userId) return [];

    const { data } = await supabase
      .from('feedback_log')
      .select('message')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(8);

    return (data ?? []).map((r: { message: string }) => r.message).reverse();
  }, [userId]);

  /** Make an architecture public and return its share slug */
  const makePublic = useCallback(
    async (archId: string): Promise<string | null> => {
      if (!isSupabaseConfigured || !userId) return null;

      const { data } = await supabase
        .from('architectures')
        .update({ is_public: true })
        .eq('id', archId)
        .eq('user_id', userId)
        .select('share_slug')
        .single();

      return data?.share_slug ?? null;
    },
    [userId]
  );

  /** Fetch a public architecture by share slug (no auth required) */
  const fetchBySlug = useCallback(async (slug: string): Promise<Architecture | null> => {
    if (!isSupabaseConfigured) return null;

    const { data } = await supabase
      .from('architectures')
      .select('json_data')
      .eq('share_slug', slug)
      .eq('is_public', true)
      .single();

    return (data?.json_data as Architecture) ?? null;
  }, []);

  return {
    saveArchitecture,
    updateArchitecture,
    logFeedback,
    fetchHistory,
    fetchRecentFeedbacks,
    makePublic,
    fetchBySlug,
  };
}
