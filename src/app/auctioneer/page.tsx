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

      // ✅ Load ALL lots (source of truth)
      const { data: lotsData } = await supabaseBrowser
        .from("lots")
        .select("lot_id, locked")
        .order("lot_id");

      setLots(lotsData || []);

      // ✅ Load auction results (may not exist yet)
      const { data: auctionData } = await supabaseBrowser
        .from("auctions")
        .select("lot_id, winner_id, winning_bid, tie_break_applied");

      const resultMap: Record<string, AuctionResult> = {};
      auctionData?.forEach(a => {
        resultMap[a.lot_id] = a;
      });
      setResults(resultMap);

      // ✅ Load display names
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
              style={{ marginBottom: "32px" }}
            >
              <h2>{lot.lot_id}</h2>

              {!lot.locked && (
                <p style={{ color: "#065f46" }}>
                  🟢 Auction open
                </p>
              )}

              {lot.locked && result ? (
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
              ) : null}

              <hr />
            </div>
          );
        })}
      </div>
    </main>
  );
}