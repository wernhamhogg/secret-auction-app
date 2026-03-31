"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import Header from "@/components/Header";

type Lot = {
  lot_id: string;
  locked: boolean;
};

type AuctionResult = {
  winner_id: string | null;
  winning_bid: number | null;
  tie_break_applied: boolean;
};

export default function BidderPage() {
  const [lots, setLots] = useState<Lot[]>([]);
  const [results, setResults] = useState<Record<string, AuctionResult>>({});
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    async function load() {
      const { data } = await supabaseBrowser.auth.getUser();
      if (!data.user) {
        window.location.href = "/login";
        return;
      }

      setUserId(data.user.id);

      const { data: lotsData } = await supabaseBrowser
        .from("lots")
        .select("lot_id, locked")
        .order("lot_id");

      setLots(lotsData || []);

      const { data: auctionData } = await supabaseBrowser
        .from("auctions")
        .select("lot_id, winner_id, winning_bid, tie_break_applied");

      const map: Record<string, AuctionResult> = {};
      auctionData?.forEach(a => (map[a.lot_id] = a));
      setResults(map);
    }

    load();
  }, []);

  return (
    <main>
      <Header />

      <div className="panel">
        <h1>Lots</h1>

        {lots.map(lot => {
          const auction = results[lot.lot_id];
          const iWon =
            lot.locked &&
            auction &&
            auction.winner_id === userId;

          return (
            <div key={lot.lot_id} style={{ marginBottom: "24px" }}>
              <h2>{lot.lot_id}</h2>

              {lot.locked && auction && (
                iWon ? (
                  <p>
                    🏆 You won with{" "}
                    <strong>{auction.winning_bid}</strong>
                    {auction.tie_break_applied && (
                      <span style={{ marginLeft: "6px", color: "#6b7280" }}>
                        (tie resolved in favour of spoken bid)
                      </span>
                    )}
                  </p>
                ) : (
                  <p>❌ Auction ended — you did not win</p>
                )
              )}

              <hr />
            </div>
          );
        })}
      </div>
    </main>
  );
}