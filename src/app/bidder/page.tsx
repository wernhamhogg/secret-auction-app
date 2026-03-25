"use client";

import { useState } from "react";

export default function BidderPage() {
  const [lotId, setLotId] = useState("");
  const [bidderId, setBidderId] = useState("");
  const [maxBid, setMaxBid] = useState("");
  const [message, setMessage] = useState("");

  async function submitBid(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/submit-bid", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lotId,
        bidderId,
        maxBid: Number(maxBid)
      })
    });

    const data = await res.json();
    setMessage(data.status);
  }

  return (
    <main>
      <h1>Submit Secret Bid</h1>

      <form onSubmit={submitBid}>
        <div>
          <label>Lot ID</label><br />
          <input value={lotId} onChange={e => setLotId(e.target.value)} />
        </div>

        <div>
          <label>Bidder ID</label><br />
          <input value={bidderId} onChange={e => setBidderId(e.target.value)} />
        </div>

        <div>
          <label>Max Bid</label><br />
          <input
            type="number"
            value={maxBid}
            onChange={e => setMaxBid(e.target.value)}
          />
        </div>

        <button type="submit">Submit Bid</button>
      </form>

      {message && <p>{message}</p>}
    </main>
  );
}