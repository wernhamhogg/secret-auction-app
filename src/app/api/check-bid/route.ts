import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        }
      }
    }
  );

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
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