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

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "auctioneer") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { lotId, currentBid } = await req.json();

  const { data } = await supabase
    .from("bids")
    .select("max_bid")
    .eq("lot_id", lotId);

  const higherSecretBid = data?.some(
    bid => Number(bid.max_bid) > Number(currentBid)
  );

  return NextResponse.json({ higherSecretBid });
}