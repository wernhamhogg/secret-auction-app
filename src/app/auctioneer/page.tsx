"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import Header from "@/components/Header";

type Lot = {
  lot_id: string;
  locked: boolean;
};

export default function AuctioneerPage() {
  const [lots, setLots] = useState<Lot[]>([]);
  const [selectedLot, setSelectedLot] = useState("");
  const [currentBid, setCurrentBid] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [winner, setWinner] = useState<any>(null);

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

      const { data: lotsData } = await supabaseBrowser
        .from("lots")
        .select("lot_id, locked")
        .order("lot_id");

      setLots(lotsData || []);
      setSelectedLot(lotsData?.[0]?.lot_id || "");
    }

    load();
  }, []);

  async function withToken(fn: (token: string) => Promise<void>) {
    const session = await supabaseBrowser.auth.getSession();
    const token = session.data.session?.access_token;
    if (token) await fn(token);
  }

  return (
    <main>
      <Header />

      <div className="panel animate-fade-up">
        <h1>Auctioneer</h1>

        <label>Select lot</label>
        <select
          value={selectedLot}
          onChange={e => setSelectedLot(e.target.value)}
        >
          {lots.map(lot => (
            <option key={lot.lot_id} value={lot.lot_id}>
              {lot.lot_id} {lot.locked ? "(ended)" : ""}
            </option>
          ))}
        </select>

        <button
          onClick={() =>
            withToken(token =>
              fetch("/api/end-auction", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ lotId: selectedLot })
              }).then(() => setStatus("Auction ended"))
            )
          }
        >
          End auction
        </button>

        <hr />

        <input
          type="number"
          placeholder="Current bid"
          value={currentBid}
          onChange={e => setCurrentBid(e.target.value)}
        />

        <button
          onClick={() =>
            withToken(token =>
              fetch("/api/check-bid", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                  lotId: selectedLot,
                  currentBid: Number(currentBid)
                })
              })
                .then(r => r.json())
                .then(d =>
                  setResult(
                    d.higherSecretBid
                      ? "Higher secret bid exists"
                      : "You are the high bidder"
                  )
                )
            )
          }
        >
          Check bid
        </button>

        <hr />

        <button
          onClick={() =>
            withToken(token =>
              fetch("/api/get-winner", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ lotId: selectedLot })
              })
                .then(r => r.json())
                .then(setWinner)
            )
          }
        >
          Show winner
        </button>

        {result && <p>{result}</p>}
        {status && <p>{status}</p>}
        {winner && (
          <p>
            Winner: <strong>{winner.displayName}</strong> – {winner.winningBid}
          </p>
        )}
      </div>
    </main>
  );
}