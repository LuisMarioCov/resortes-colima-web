import { createClient } from "@supabase/supabase-js";

/** Cliente anon en servidor (RSC / Route Handlers públicos). Fail-soft si faltan env. */
export function createPublicServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
