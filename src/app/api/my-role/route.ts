import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader) {
    return NextResponse.json({ role: null });
  }

  const supabase = createSupabaseServerClient(
    authHeader.replace("Bearer ", "")
  );

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ role: null });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return NextResponse.json({ role: profile?.role });
}