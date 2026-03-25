"use client";

import { useState } from "react";

export default function AuctioneerPage() {
  const [lotId, setLotId] = useState("");
  const [currentBid, setCurrentBid] = useState("");
  const [result, setResult] = useState<string | null>(null);

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

  return (
    <main>
      <h1>Auctioneer Check</h1>

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