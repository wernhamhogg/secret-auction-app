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

    // ✅ Ensure auctioneer
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

    // ✅ Boolean comparison ONLY
    const { data: higherBid } = await supabase
      .from("bids")
      .select("id")
      .eq("lot_id", lotId)
      .gt("max_bid", spokenBid)
      .limit(1)
      .single();

    return NextResponse.json({
      hasHigherSealedBid: !!higherBid
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}