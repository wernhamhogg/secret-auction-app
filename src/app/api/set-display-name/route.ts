import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const supabase = createSupabaseServerClient(
    authHeader.replace("Bearer ", "")
  );

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Invalid user" }, { status: 401 });
  }

  const { displayName } = await req.json();

  if (!displayName || displayName.length < 2) {
    return NextResponse.json(
      { error: "Display name too short" },
      { status: 400 }
    );
  }

  await supabase
    .from("profiles")
    .update({ display_name: displayName })
    .eq("id", user.id);

  return NextResponse.json({ status: "ok" });
}