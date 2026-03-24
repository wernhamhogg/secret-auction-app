import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { lotId, bidderId, maxBid } = await req.json();

  await supabase.from("bids").insert({
    lot_id: lotId,
    bidder_id: bidderId,
    max_bid: maxBid
  });

  return NextResponse.json({ status: "Bid stored" });
}