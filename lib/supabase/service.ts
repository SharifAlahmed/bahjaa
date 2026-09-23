import 'server-only';
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * عميل Supabase بمفتاح الخدمة — يتجاوز RLS.
 * لا يُستدعى إلا من server actions مؤمَّنة (guard() مطلوب قبل استدعائه).
 */
export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
