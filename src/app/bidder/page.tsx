"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import Header from "@/components/Header";

type Lot = {
  lot_id: string;
  locked: boolean;
};

type AuctionResult = {
  winner_id: string;
  winning_bid: number;
};

export default function BidderPage() {
  const [lots, setLots] = useState<Lot[]>([]);
  const [myBids, setMyBids] = useState<Record<string, number>>({});
  const [results, setResults] = useState<Record<string, AuctionResult>>({});
  const [bidInputs, setBidInputs] = useState<Record<string, string>>({});
  const [userId, setUserId] = useState<string>("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabaseBrowser.auth.getUser();
      if (!userData.user) {
        window.location.href = "/login";
        return;
      }

      setUserId(userData.user.id);

      const { data: lotsData } = await supabaseBrowser
        .from("lots")
        .select("lot_id, locked")
        .order("lot_id");

      setLots(lotsData || []);

      const { data: bidsData } = await supabaseBrowser
        .from("bids")
        .select("lot_id, max_bid")
        .eq("bidder_id", userData.user.id);

      const bidMap: Record<string, number> = {};
      bidsData?.forEach(b => (bidMap[b.lot_id] = b.max_bid));
      setMyBids(bidMap);

      const { data: auctionData } = await supabaseBrowser
        .from("auctions")
        .select("lot_id, winner_id, winning_bid");

      const resultMap: Record<string, AuctionResult> = {};
      auctionData?.forEach(a => {
        resultMap[a.lot_id] = {
          winner_id: a.winner_id,
          winning_bid: a.winning_bid
        };
      });
      setResults(resultMap);
    }

    load();
  }, []);

  async function submitBid(lotId: string) {
    setMessage(null);
    setError(null);

    const value = Number(bidInputs[lotId]);

    if (!value || value < 0) {
      setError("Please enter a valid bid amount");
      return;
    }

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
        maxBid: value
      })
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      setError(data.error || "Failed to submit bid");
      return;
    }

    // ✅ Optimistically update UI
    setMyBids(prev => ({
      ...prev,
      [lotId]: value
    }));

    setMessage("Bid updated successfully");
  }

  return (
    <main>
      <Header />

      <div className="panel animate-fade-up">
        <h1>Lots</h1>

        {message && (
          <p style={{ color: "#065f46", marginBottom: "16px" }}>
            ✅ {message}
          </p>
        )}

        {error && (
          <p style={{ color: "#b91c1c", marginBottom: "16px" }}>
            ⚠️ {error}
          </p>
        )}

        {lots.map(lot => {
          const auction = results[lot.lot_id];
          const myBid = myBids[lot.lot_id];

          const iWon =
            lot.locked &&
            auction &&
            auction.winner_id === userId;

          return (
            <div
              key={lot.lot_id}
              className="hover-lift"
              style={{ marginBottom: "32px" }}
            >
              <h2>{lot.lot_id}</h2>

              {!lot.locked && (
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

              {myBid !== undefined && (
                <p>
                  Your bid: <strong>{myBid}</strong>
                </p>
              )}

              {lot.locked && auction && (
                <div style={{ marginTop: "12px" }}>
                  {iWon ? (
                    <p>
                      🏆 <strong>You won</strong> with a bid of{" "}
                      <strong>{auction.winning_bid}</strong>
                    </p>
                  ) : (
                    <p>❌ Auction ended — you did not win</p>
                  )}
                </div>
              )}

              <hr />
            </div>
          );
        })}
      </div>
    </main>
  );
}