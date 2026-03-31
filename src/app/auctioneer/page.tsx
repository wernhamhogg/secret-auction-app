"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import Header from "@/components/Header";

type Lot = {
  lot_id: string;
  locked: boolean;
};

type AuctionResult = {
  lot_id: string;
  winner_id: string | null;
  winning_bid: number | null;
  tie_break_applied: boolean;
};

type Profile = {
  id: string;
  display_name: string;
};

export default function AuctioneerPage() {
  const [lots, setLots] = useState<Lot[]>([]);
  const [results, setResults] = useState<Record<string, AuctionResult>>({});
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [spokenBids, setSpokenBids] = useState<Record<string, string>>({});
  const [ending, setEnding] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabaseBrowser.auth.getUser();
      if (!data.user) {
        window.location.href = "/login";
        return;
      }

      const { data: profile } = await supabaseBrowser
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (profile?.role !== "auctioneer") {
        window.location.href = "/";
        return;
      }

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

      const { data: profileData } = await supabaseBrowser
        .from("profiles")
        .select("id, display_name");

      const pMap: Record<string, string> = {};
      profileData?.forEach((p: Profile) => (pMap[p.id] = p.display_name));
      setProfiles(pMap);
    }

    load();
  }, []);

  async function endAuction(lotId: string) {
    const spokenBid = Number(spokenBids[lotId]);
    if (!spokenBid) return;

    setEnding(lotId);

    const session = await supabaseBrowser.auth.getSession();
    const token = session.data.session?.access_token;

    await fetch("/api/end-auction", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ lotId, spokenBid })
    });

    window.location.reload();
  }

  return (
    <main>
      <Header />

      <div className="panel">
        <h1>Auctioneer</h1>

        {lots.map(lot => {
          const result = results[lot.lot_id];

          return (
            <div key={lot.lot_id} style={{ marginBottom: "32px" }}>
              <h2>{lot.lot_id}</h2>

              {!lot.locked && (
                <>
                  <label>Spoken bid</label>
                  <input
                    type="number"
                    value={spokenBids[lot.lot_id] || ""}
                    onChange={e =>
                      setSpokenBids(prev => ({
                        ...prev,
                        [lot.lot_id]: e.target.value
                      }))
                    }
                  />

                  <button onClick={() => endAuction(lot.lot_id)}>
                    End auction
                  </button>
                </>
              )}

              {lot.locked && result && (
                <p>
                  Winner:{" "}
                  <strong>
                    {result.winner_id
                      ? profiles[result.winner_id]
                      : "In‑room bid"}
                  </strong>{" "}
                  — <strong>{result.winning_bid}</strong>
                  {result.tie_break_applied && (
                    <span style={{ marginLeft: "8px", color: "#6b7280" }}>
                      (tie resolved in favour of spoken bid)
                    </span>
                  )}
                </p>
              )}

              <hr />
            </div>
          );
        })}
      </div>
    </main>
  );
}