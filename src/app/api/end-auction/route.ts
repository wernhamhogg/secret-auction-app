import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const {
      data: { user }
    } = await supabase.auth.getUser(token);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "auctioneer") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { lotId, spokenBid } = await req.json();

    if (!lotId || typeof spokenBid !== "number") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // ✅ Lock the lot
    await supabase
      .from("lots")
      .update({ locked: true })
      .eq("lot_id", lotId);

    // ✅ Get highest sealed bid
    const { data: topBidRow } = await supabase
      .from("bids")
      .select("bidder_id, max_bid")
      .eq("lot_id", lotId)
      .order("max_bid", { ascending: false })
      .limit(1)
      .single();

    // ✅ No sealed bids at all → spoken bid wins
    if (!topBidRow) {
      await supabase.from("auctions").upsert({
        lot_id: lotId,
        winner_id: null,
        winning_bid: spokenBid,
        tie_break_applied: false
      });

      return NextResponse.json({
        status: "Auction ended",
        winner: "spoken",
        winningBid: spokenBid
      });
    }

    const highestSealedBid = topBidRow.max_bid;

    // ✅ CASE 1 — Sealed bid strictly higher
    if (highestSealedBid > spokenBid) {
      await supabase.from("auctions").upsert({
        lot_id: lotId,
        winner_id: topBidRow.bidder_id,
        winning_bid: highestSealedBid,
        tie_break_applied: false
      });

      return NextResponse.json({
        status: "Auction ended",
        winner: "sealed",
        winningBid: highestSealedBid
      });
    }

    // ✅ CASE 2 — Spoken bid strictly higher
    if (spokenBid > highestSealedBid) {
      await supabase.from("auctions").upsert({
        lot_id: lotId,
        winner_id: null,
        winning_bid: spokenBid,
        tie_break_applied: false
      });

      return NextResponse.json({
        status: "Auction ended",
        winner: "spoken",
        winningBid: spokenBid
      });
    }

    // ✅ CASE 3 — TIE → spoken bid wins, with explicit tie-break
    await supabase.from("auctions").upsert({
      lot_id: lotId,
      winner_id: null,
      winning_bid: spokenBid,
      tie_break_applied: true
    });

    return NextResponse.json({
      status: "Auction ended",
      winner: "spoken",
      winningBid: spokenBid,
      tieBreakApplied: true
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}