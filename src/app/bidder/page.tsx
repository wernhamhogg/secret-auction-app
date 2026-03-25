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
    async function loadData() {
      const { data: userData } = await supabaseBrowser.auth.getUser();
      if (!userData.user) {
        window.location.href = "/login";
        return;
      }

      // Load lots
      const { data: lotsData } = await supabaseBrowser
        .from("lots")
        .select("lot_id, locked");

      setLots(lotsData || []);

      // Load user's existing bids
      const { data: bidsData } = await supabaseBrowser
        .from("bids")
        .select("lot_id, max_bid")
        .eq("bidder_id", userData.user.id);

      const bidMap: Record<string, number> = {};
      bidsData?.forEach(b => {
        bidMap[b.lot_id] = b.max_bid;
      });

      setMyBids(bidMap);
    }

    loadData();
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

    if (data.error) {
      setMessage(data.error);
    } else {
      setMessage(`✅ Bid submitted for ${lotId}`);
      setMyBids(prev => ({
        ...prev,
        [lotId]: Number(bidInputs[lotId])
      }));
    }
  }

  return (
    <main>
      <Header />

      <h1>Available Lots</h1>

      {lots.map(lot => (
        <div key={lot.lot_id} style={{ border: "1px solid #ccc", padding: 10, marginBottom: 10 }}>
          <h3>{lot.lot_id}</h3>

          {lot.locked ? (
            <p>🔒 Auction ended</p>
          ) : (
            <>
              <div>
                <label>Your max bid</label><br />
                <input
                  type="number"
                  value={bidInputs[lot.lot_id] || ""}
                  onChange={e =>
                    setBidInputs(prev => ({
                      ...prev,
                      [lot.lot_id]: e.target.value
                    }))
                  }
                />
              </div>

              <button onClick={() => submitBid(lot.lot_id)}>
                Submit Bid
              </button>
            </>
          )}

          {myBids[lot.lot_id] !== undefined && (
            <p>
              ✅ Your submitted bid: <strong>{myBids[lot.lot_id]}</strong>
            </p>
          )}
        </div>
      ))}

      {message && <p>{message}</p>}
    </main>
  );
}