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

  // Check role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "auctioneer") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { lotId } = await req.json();

  // 1. Lock the lot
  await supabase
    .from("lots")
    .update({ locked: true })
    .eq("lot_id", lotId);

  // 2. Find highest secret bid
  const { data: bids } = await supabase
    .from("bids")
    .select("bidder_id, max_bid")
    .eq("lot_id", lotId)
    .order("max_bid", { ascending: false })
    .limit(1);

  const winningBid = bids?.[0];

  if (!winningBid) {
    return NextResponse.json({ status: "No bids placed" });
  }

  // 3. Store winner
  await supabase.from("auctions").upsert({
    lot_id: lotId,
    winner_id: winningBid.bidder_id,
    winning_bid: winningBid.max_bid,
    ended_at: new Date().toISOString()
  });

  return NextResponse.json({
    status: "Auction ended",
    winningBid: winningBid.max_bid
  });
}