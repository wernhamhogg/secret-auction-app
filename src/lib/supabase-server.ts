import { createClient } from "@supabase/supabase-js";

export function createSupabaseServerClient(accessToken?: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      global: {
        headers: accessToken
          ? { Authorization: `Bearer ${accessToken}` }
          : {}
      }
    }
  );
}