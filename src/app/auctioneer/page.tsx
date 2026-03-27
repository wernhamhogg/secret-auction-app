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
  const [checkMessages, setCheckMessages] = useState<Record<string, string>>({});
  const [ending, setEnding] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabaseBrowser.auth.getUser();
      if (!userData.user) {
        window.location.href = "/login";
        return;
      }

      // ✅ Role check
      const { data: profile } = await supabaseBrowser
        .from("profiles")
        .select("role")
        .eq("id", userData.user.id)
        .single();

      if (profile?.role !== "auctioneer") {
        window.location.href = "/";
        return;
      }

      // ✅ Lots = source of truth
      const { data: lotsData } = await supabaseBrowser
        .from("lots")
        .select("lot_id, locked")
        .order("lot_id");

      setLots(lotsData || []);

      // ✅ Auction results (only shown after end)
      const { data: auctionData } = await supabaseBrowser
        .from("auctions")
        .select("lot_id, winner_id, winning_bid, tie_break_applied");

      const resultMap: Record<string, AuctionResult> = {};
      auctionData?.forEach(a => {
        resultMap[a.lot_id] = a;
      });
      setResults(resultMap);

      // ✅ Display names
      const { data: profileData } = await supabaseBrowser
        .from("profiles")
        .select("id, display_name");

      const profileMap: Record<string, string> = {};
      profileData?.forEach((p: Profile) => {
        profileMap[p.id] = p.display_name;
      });

      setProfiles(profileMap);
    }

    load();
  }, []);

  async function checkBid(lotId: string) {
    const spokenBid = Number(spokenBids[lotId]);
    if (!spokenBid) return;

    const session = await supabaseBrowser.auth.getSession();
    const token = session.data.session?.access_token;

    const res = await fetch("/api/check-bid", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        lotId,
        spokenBid
      })
    });

    const data = await res.json();

    setCheckMessages(prev => ({
      ...prev,
      [lotId]: data.hasHigherSealedBid
        ? "There is a higher sealed bid"
        : "Spoken bid is currently the highest"
    }));
  }

  async function endAuction(lotId: string) {
    setEnding(lotId);

    const session = await supabaseBrowser.auth.getSession();
    const token = session.data.session?.access_token;

    await fetch("/api/end-auction", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ lotId })
    });

    window.location.reload();
  }

  return (
    <main>
      <Header />

      <div className="panel animate-fade-up">
        <h1>Auctioneer</h1>

        {lots.map(lot => {
          const result = results[lot.lot_id];

          return (
            <div
              key={lot.lot_id}
              className="hover-lift"
              style={{ marginBottom: "36px" }}
            >
              <h2>{lot.lot_id}</h2>

              {!lot.locked && (
                <>
                  <label>Current spoken bid</label>
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

                  <button
                    onClick={() => checkBid(lot.lot_id)}
                    style={{ marginLeft: "8px" }}
                  >
                    Check bid
                  </button>

                  {checkMessages[lot.lot_id] && (
                    <p style={{ marginTop: "8px" }}>
                      {checkMessages[lot.lot_id]}
                    </p>
                  )}

                  <button
                    onClick={() => endAuction(lot.lot_id)}
                    disabled={ending === lot.lot_id}
                    style={{ marginTop: "12px" }}
                  >
                    {ending === lot.lot_id
                      ? "Ending auction…"
                      : "End auction"}
                  </button>
                </>
              )}

              {lot.locked && result && (
                result.winner_id ? (
                  <p>
                    Winner:{" "}
                    <strong>
                      {profiles[result.winner_id] || "Unknown"}
                    </strong>{" "}
                    — <strong>{result.winning_bid}</strong>
                    {result.tie_break_applied && (
                      <span
                        style={{
                          marginLeft: "8px",
                          color: "#6b7280",
                          fontSize: "0.85rem"
                        }}
                      >
                        (tie‑break applied)
                      </span>
                    )}
                  </p>
                ) : (
                  <p>No bids placed</p>
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