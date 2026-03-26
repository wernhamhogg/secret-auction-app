import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");

    // ✅ Service role client (bypasses RLS)
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

    const { lotId, maxBid } = await req.json();

    if (!lotId || typeof maxBid !== "number") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // ✅ Check if bid already exists
    const { data: existingBid } = await supabase
      .from("bids")
      .select("id")
      .eq("lot_id", lotId)
      .eq("bidder_id", user.id)
      .single();

    if (existingBid) {
      // ✅ EXPLICIT UPDATE (no conditions)
      const { error: updateError } = await supabase
        .from("bids")
        .update({ max_bid: maxBid })
        .eq("id", existingBid.id);

      if (updateError) {
        return NextResponse.json(
          { error: updateError.message },
          { status: 500 }
        );
      }
    } else {
      // ✅ INSERT FIRST BID
      const { error: insertError } = await supabase.from("bids").insert({
        lot_id: lotId,
        bidder_id: user.id,
        max_bid: maxBid
      });

      if (insertError) {
        return NextResponse.json(
          { error: insertError.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ status: "Bid saved" });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}