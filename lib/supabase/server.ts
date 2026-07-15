import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client for use inside route handlers.
 * Uses the service role key so it bypasses RLS deliberately for trusted
 * server-side operations (e.g. onboarding import writes); every query must
 * therefore filter by company_id explicitly instead of relying on RLS.
 * Returns null when not configured, so API routes can respond with a clear
 * "not configured" error instead of throwing.
 */
export function getSupabaseServiceClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;

  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}

export function isSupabaseServiceConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}
