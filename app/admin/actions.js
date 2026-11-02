"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSessionClient } from "@/lib/supabase/session";

/**
 * Server Action untuk memproses login admin menggunakan Supabase Auth (email & password).
 * Menerima (prevState, formData) sesuai useActionState di app/admin/login/page.jsx.
 */
export async function masukAdmin(prevState, formData) {
  const email = formData?.get("email")?.toString().trim() || "";
  const password = formData?.get("password")?.toString() || "";

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  let pesanError = null;

  try {
    const supabase = await createSessionClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message === "Invalid login credentials") {
        pesanError = "Email atau password salah.";
      } else {
        pesanError = error.message || "Gagal masuk. Periksa kembali email dan password.";
      }
    }
  } catch (err) {
    pesanError = err.message || "Terjadi kesalahan saat menghubungkan ke layanan autentikasi.";
  }

  if (pesanError) {
    return { error: pesanError };
  }

  revalidatePath("/admin", "layout");
  redirect("/admin");
}

/**
 * Server Action untuk mengakhiri sesi admin (logout) lalu kembali ke halaman login.
 */
export async function keluarAdmin() {
  try {
    const supabase = await createSessionClient();
    await supabase.auth.signOut();
  } catch (err) {
    console.error("Gagal keluar:", err);
  }

  revalidatePath("/admin", "layout");
  redirect("/admin/login");
}

/**
 * Server Action untuk mengganti password admin yang sedang login.
 * Memvalidasi minimal 8 karakter dan kesamaan dengan konfirmasi password di server.
 */
export async function gantiPassword(prevState, formData) {
  const passwordBaru = (
    formData?.get("password_baru") ||
    formData?.get("password") ||
    ""
  )?.toString();
  const konfirmasiPassword = (
    formData?.get("konfirmasi_password") ||
    formData?.get("konfirmasi") ||
    ""
  )?.toString();

  if (!passwordBaru || !konfirmasiPassword) {
    return { error: "Password baru dan konfirmasi password wajib diisi." };
  }

  if (passwordBaru.length < 8) {
    return { error: "Password baru minimal 8 karakter." };
  }

  if (passwordBaru !== konfirmasiPassword) {
    return { error: "Password baru dan konfirmasi password tidak sama." };
  }

  try {
    const supabase = await createSessionClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        error: "Sesi telah berakhir atau Anda belum login. Silakan login kembali.",
      };
    }

    const { error } = await supabase.auth.updateUser({
      password: passwordBaru,
    });

    if (error) {
      return {
        error: error.message || "Gagal mengganti password. Silakan coba lagi.",
      };
    }

    revalidatePath("/admin/password");
    return { success: true, message: "Password berhasil diganti." };
  } catch (err) {
    return {
      error: err.message || "Terjadi kesalahan saat mengganti password.",
    };
  }
}
