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

    // ✅ Verify user
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Invalid user" }, { status: 401 });
    }

    // ✅ Confirm auctioneer role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "auctioneer") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { lotId } = await req.json();
    if (!lotId) {
      return NextResponse.json({ error: "Missing lotId" }, { status: 400 });
    }

    // ✅ Lock the lot
    await supabase
      .from("lots")
      .update({ locked: true })
      .eq("lot_id", lotId);

    // ✅ Get highest bid value
    const { data: topBidRow } = await supabase
      .from("bids")
      .select("max_bid")
      .eq("lot_id", lotId)
      .order("max_bid", { ascending: false })
      .limit(1)
      .single();

    if (!topBidRow) {
      // No bids
      await supabase.from("auctions").upsert({
        lot_id: lotId,
        winner_id: null,
        winning_bid: null,
        tie_break_applied: false
      });

      return NextResponse.json({ status: "Auction ended — no bids" });
    }

    const topBid = topBidRow.max_bid;

    // ✅ Get all tied bids
    const { data: tiedBids } = await supabase
      .from("bids")
      .select("bidder_id, max_bid")
      .eq("lot_id", lotId)
      .eq("max_bid", topBid);

    if (!tiedBids || tiedBids.length === 0) {
      return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
    }

    let winner;
    let winningBid;
    let tieBreakApplied = false;

    if (tiedBids.length === 1) {
      winner = tiedBids[0];
      winningBid = winner.max_bid;
    } else {
      // ✅ Random tie-break
      const randomIndex = Math.floor(Math.random() * tiedBids.length);
      winner = tiedBids[randomIndex];
      winningBid = winner.max_bid + 5;
      tieBreakApplied = true;
    }

    // ✅ Persist result ONCE
    await supabase.from("auctions").upsert({
      lot_id: lotId,
      winner_id: winner.bidder_id,
      winning_bid: winningBid,
      tie_break_applied: tieBreakApplied
    });

    return NextResponse.json({
      status: "Auction ended",
      winner: winner.bidder_id,
      winningBid,
      tieBreakApplied
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}