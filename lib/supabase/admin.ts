import { createClient as createServerClient } from "./server";

/**
 * صلاحية الأدمن تُفحص في قاعدة البيانات لا في التطبيق.
 * bh_is_admin() تقرأ إيميل الجلسة من الـ JWT وتقارنه بجدول bh_admins.
 * حتى لو تلاعب أحد بالواجهة، Postgres يرفض الكتابة.
 * لا نحتاج أي مفتاح خدمة سرّي — وهذا يقلّل ما يمكن تسريبه.
 */
export async function getAdminEmail(): Promise<string | null> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return null;

  const { data, error } = await supabase.rpc("bh_is_admin");
  if (error || data !== true) return null;

  return user.email;
}
