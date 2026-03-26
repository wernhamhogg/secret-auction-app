"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import Header from "@/components/Header";

type Auction = {
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
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabaseBrowser.auth.getUser();
      if (!userData.user) {
        window.location.href = "/login";
        return;
      }

      const { data: profile } = await supabaseBrowser
        .from("profiles")
        .select("role")
        .eq("id", userData.user.id)
        .single();

      if (profile?.role !== "auctioneer") {
        window.location.href = "/";
        return;
      }

      const { data: auctionData } = await supabaseBrowser
        .from("auctions")
        .select("lot_id, winner_id, winning_bid, tie_break_applied")
        .order("lot_id");

      setAuctions(auctionData || []);

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
        <h1>Auction Results</h1>

        {auctions.map(a => (
          <div
            key={a.lot_id}
            className="hover-lift"
            style={{ marginBottom: "32px" }}
          >
            <h2>{a.lot_id}</h2>

            {a.winner_id ? (
              <p>
                Winner:{" "}
                <strong>
                  {profiles[a.winner_id] || "Unknown"}
                </strong>{" "}
                — <strong>{a.winning_bid}</strong>
                {a.tie_break_applied && (
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
            )}

            <hr />
          </div>
        ))}
      </div>
    </main>
  );
}