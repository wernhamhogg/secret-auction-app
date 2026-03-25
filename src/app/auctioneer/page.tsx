"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function AuctioneerPage() {
  const [allowed, setAllowed] = useState(false);
  const [lotId, setLotId] = useState("");
  const [currentBid, setCurrentBid] = useState("");
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    async function checkAccess() {
      const { data } = await supabaseBrowser.auth.getUser();

      if (!data.user) {
        window.location.href = "/login";
        return;
      }

      const res = await fetch("/api/my-role");
      const roleData = await res.json();

      if (roleData.role !== "auctioneer") {
        window.location.href = "/";
        return;
      }

      setAllowed(true);
    }

    checkAccess();
  }, []);

  async function checkBid(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/check-bid", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lotId,
        currentBid: Number(currentBid)
      })
    });

    const data = await res.json();

    setResult(
      data.higherSecretBid
        ? "❌ There exists a higher secret bid"
        : "✅ You are the high bidder"
    );
  }

  if (!allowed) {
    return <p>Checking access…</p>;
  }

  return (
    <main>
      <h1>Auctioneer</h1>

      <form onSubmit={checkBid}>
        <div>
          <label>Lot ID</label><br />
          <input value={lotId} onChange={e => setLotId(e.target.value)} />
        </div>

        <div>
          <label>Current Bid</label><br />
          <input
            type="number"
            value={currentBid}
            onChange={e => setCurrentBid(e.target.value)}
          />
        </div>

        <button type="submit">Check Bid</button>
      </form>

      {result && <p>{result}</p>}
    </main>
  );
}