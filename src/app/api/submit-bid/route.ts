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

  const { lotId, maxBid } = await req.json();

  // 1. Check if lot is locked
  const { data: lot } = await supabase
    .from("lots")
    .select("locked")
    .eq("lot_id", lotId)
    .single();

  if (lot?.locked) {
    return NextResponse.json(
      { error: "Auction has ended" },
      { status: 403 }
    );
  }

  // 2. Store bid
  await supabase.from("bids").insert({
    lot_id: lotId,
    bidder_id: user.id,
    max_bid: maxBid
  });

  return NextResponse.json({ status: "Bid stored" });
}