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

  // Must be auctioneer
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "auctioneer") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { lotId } = await req.json();

  const { data: auction } = await supabase
    .from("auctions")
    .select("winner_id, winning_bid")
    .eq("lot_id", lotId)
    .single();

  if (!auction) {
    return NextResponse.json({ error: "Auction not ended" });
  }

  const { data: winnerProfile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", auction.winner_id)
    .single();

  return NextResponse.json({
    displayName: winnerProfile?.display_name,
    winningBid: auction.winning_bid
  });
}