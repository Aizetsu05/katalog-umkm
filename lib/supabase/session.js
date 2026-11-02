import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Membuat client Supabase sesi admin menggunakan SUPABASE_URL dan SUPABASE_PUBLISHABLE_KEY
 * serta cookie untuk mengelola sesi admin (login, logout, ganti password, aksi admin).
 */
export async function createSessionClient() {
  const cookieStore = await cookies();
  const supabaseUrl = (process.env.SUPABASE_URL || "").replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
  const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(
      "SUPABASE_URL atau SUPABASE_PUBLISHABLE_KEY belum diatur di environment variable."
    );
  }

  return createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Mutasi cookie diabaikan jika dipanggil dari Server Component
        }
      },
    },
  });
}

