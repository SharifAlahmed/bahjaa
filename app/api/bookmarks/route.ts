import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET — كل bookmarks للمستخدم الحالي
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data } = await supabase
    .from("bh_bookmarks")
    .select("summary_id, status")
    .eq("user_id", user.id);

  return NextResponse.json(data || []);
}

// POST — upsert bookmark (يحدّث الـ status إذا كان موجوداً)
export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { summary_id, status } = await req.json();
  if (!summary_id || !["want_to_read", "liked"].includes(status)) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const { error } = await supabase
    .from("bh_bookmarks")
    .upsert(
      { user_id: user.id, summary_id, status },
      { onConflict: "user_id,summary_id" }
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// DELETE — حذف bookmark
export async function DELETE(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { summary_id } = await req.json();
  if (!summary_id) return NextResponse.json({ error: "bad request" }, { status: 400 });

  const { error } = await supabase
    .from("bh_bookmarks")
    .delete()
    .eq("user_id", user.id)
    .eq("summary_id", summary_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
