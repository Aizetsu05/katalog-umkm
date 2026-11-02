import { createClient } from "@supabase/supabase-js";

/**
 * Membuat client Supabase untuk sisi server menggunakan SUPABASE_URL dan SUPABASE_SECRET_KEY.
 * Digunakan untuk operasi server-side seperti membaca data publik (katalog dan detail produk)
 * yang melewati aturan Row Level Security (RLS).
 */
export function createServerClient() {
  const supabaseUrl = (process.env.SUPABASE_URL || "").replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseSecretKey) {
    throw new Error(
      "SUPABASE_URL atau SUPABASE_SECRET_KEY belum diatur di environment variable."
    );
  }

  return createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export { createServerClient as createClient };

