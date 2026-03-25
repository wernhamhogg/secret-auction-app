"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function BidderPage() {
  const [lotId, setLotId] = useState("");
  const [maxBid, setMaxBid] = useState("");
  const [message, setMessage] = useState("");

  // Redirect to login if not logged in
  useEffect(() => {
    supabaseBrowser.auth.getUser().then(({ data }) => {
      if (!data.user) {
        window.location.href = "/login";
      }
    });
  }, []);

  async function submitBid(e: React.FormEvent) {
    e.preventDefault();

    // 1. Get the current session
    const session = await supabaseBrowser.auth.getSession();
    const token = session.data.session?.access_token;

    // 2. Send bid to API with auth token
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
    setMessage(data.status || data.error || "Done");
  }

  return (
    <main>
      <h1>Submit Secret Bid</h1>

      <form onSubmit={submitBid}>
        <div>
          <label>Lot ID</label><br />
          <input
            value={lotId}
            onChange={e => setLotId(e.target.value)}
            required
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