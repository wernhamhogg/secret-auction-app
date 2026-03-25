"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import Header from "@/components/Header";

export default function BidderPage() {
  const [lotId, setLotId] = useState("lot-1");
  const [maxBid, setMaxBid] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    supabaseBrowser.auth.getUser().then(({ data }) => {
      if (!data.user) {
        window.location.href = "/login";
      }
    });
  }, []);

  async function submitBid(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

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
        maxBid: Number(maxBid)
      })
    });

    const data = await res.json();

    setMessage(data.status || data.error);
  }

  return (
    <main>
      <Header />

      <h1>Bidder</h1>

      <form onSubmit={submitBid}>
        <div>
          <label>Lot ID</label><br />
          <input
            value={lotId}
            onChange={e => setLotId(e.target.value)}
          />
        </div>

        <div>
          <label>Max Bid</label><br />
          <input
            type="number"
            value={maxBid}
            onChange={e => setMaxBid(e.target.value)}
            required
          />
        </div>

        <button type="submit">Submit Bid</button>
      </form>

      {message && <p>{message}</p>}
    </main>
  );
}