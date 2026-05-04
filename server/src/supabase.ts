import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const isSupabaseConfigured = !!(supabaseUrl && supabaseServiceKey);

export const supabaseAdmin = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null;

export async function saveArchitectureToDB(params: {
  userId: string;
  arch: object;
  title: string;
  projectType: string;
  scale: string;
  version: number;
  shareSlug: string;
  promptVersion: string;
}): Promise<string | null> {
  if (!supabaseAdmin) return null;
  const { data, error } = await supabaseAdmin
    .from('architectures')
    .insert({
      user_id: params.userId,
      title: params.title,
      project_type: params.projectType,
      scale: params.scale,
      json_data: params.arch,
      version: params.version,
      prompt_version: params.promptVersion,
      share_slug: params.shareSlug,
      is_public: false,
    })
    .select('id')
    .single();
  if (error) { console.error('[saveArchitectureToDB]', error.message); return null; }
  return data?.id ?? null;
}

export async function updateArchitectureInDB(params: {
  archId: string;
  userId: string;
  arch: object;
  version: number;
}): Promise<void> {
  if (!supabaseAdmin) return;
  await supabaseAdmin
    .from('architectures')
    .update({ json_data: params.arch, version: params.version })
    .eq('id', params.archId)
    .eq('user_id', params.userId);
}

export async function logFeedbackToDB(params: {
  archId: string;
  userId: string;
  message: string;
}): Promise<void> {
  if (!supabaseAdmin) return;
  await supabaseAdmin.from('feedback_log').insert({
    arch_id: params.archId,
    user_id: params.userId,
    message: params.message,
  });
}

export async function getRecentFeedbacks(userId: string): Promise<string[]> {
  if (!supabaseAdmin) return [];
  const { data } = await supabaseAdmin
    .from('feedback_log')
    .select('message')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(8);
  return ((data ?? []) as { message: string }[]).map((r) => r.message).reverse();
}

export async function getHistoryFromDB(userId: string) {
  if (!supabaseAdmin) return [];
  const { data } = await supabaseAdmin
    .from('architectures')
    .select('id, title, project_type, scale, created_at, version, share_slug, json_data')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);
  return data ?? [];
}

export async function verifyUserToken(token: string): Promise<string | null> {
  if (!supabaseAdmin) return null;
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user.id;
}
