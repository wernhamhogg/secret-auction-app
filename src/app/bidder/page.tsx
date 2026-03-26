"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import Header from "@/components/Header";

type Lot = {
  lot_id: string;
  locked: boolean;
};

export default function BidderPage() {
  const [lots, setLots] = useState<Lot[]>([]);
  const [myBids, setMyBids] = useState<Record<string, number>>({});
  const [bidInputs, setBidInputs] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabaseBrowser.auth.getUser();
      if (!userData.user) {
        window.location.href = "/login";
        return;
      }

      const { data: lotsData } = await supabaseBrowser
        .from("lots")
        .select("lot_id, locked")
        .order("lot_id");

      setLots(lotsData || []);

      const { data: bidsData } = await supabaseBrowser
        .from("bids")
        .select("lot_id, max_bid")
        .eq("bidder_id", userData.user.id);

      const map: Record<string, number> = {};
      bidsData?.forEach(b => (map[b.lot_id] = b.max_bid));
      setMyBids(map);
    }

    load();
  }, []);

  async function submitBid(lotId: string) {
    setMessage(null);

    const session = await supabaseBrowser.auth.getSession();
    const token = session.data.session?.access_token;

    const res = await fetch("/api/submit-bid", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        lotId,
        maxBid: Number(bidInputs[lotId])
      })
    });

    const data = await res.json();
    setMessage(data.status || data.error);

    if (!data.error) {
      setMyBids(prev => ({
        ...prev,
        [lotId]: Number(bidInputs[lotId])
      }));
    }
  }

  return (
    <main>
      <Header />

      <div className="panel animate-fade-up">
        <h1>Available Lots</h1>

        {lots.map(lot => (
          <div
            key={lot.lot_id}
            className="hover-lift"
            style={{ marginBottom: "28px" }}
          >
            <h2>{lot.lot_id}</h2>

            {lot.locked ? (
              <p>🔒 Auction ended</p>
            ) : (
              <>
                <input
                  type="number"
                  placeholder="Your max bid"
                  value={bidInputs[lot.lot_id] || ""}
                  onChange={e =>
                    setBidInputs(prev => ({
                      ...prev,
                      [lot.lot_id]: e.target.value
                    }))
                  }
                />

                <button onClick={() => submitBid(lot.lot_id)}>
                  Submit bid
                </button>
              </>
            )}

            {myBids[lot.lot_id] !== undefined && (
              <p>
                Your bid: <strong>{myBids[lot.lot_id]}</strong>
              </p>
            )}

            <hr />
          </div>
        ))}

        {message && <p>{message}</p>}
      </div>
    </main>
  );
}