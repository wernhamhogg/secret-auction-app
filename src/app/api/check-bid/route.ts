import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { lotId, currentBid } = await req.json();

  const { data } = await supabase
    .from("bids")
    .select("max_bid")
    .eq("lot_id", lotId);

  const higherBidExists = data?.some(
    (bid) => Number(bid.max_bid) > Number(currentBid)
  );

  return NextResponse.json({
    higherSecretBid: higherBidExists
  });
}