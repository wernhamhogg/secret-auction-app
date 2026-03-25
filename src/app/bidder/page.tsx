"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function BidderPage() {
  const [lotId, setLotId] = useState("lot-1");
  const [maxBid, setMaxBid] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  // Require login
  useEffect(() => {
    async function checkLogin() {
      const { data } = await supabaseBrowser.auth.getUser();
      if (!data.user) {
        window.location.href = "/login";
      }
    }

    checkLogin();
  }, []);

  async function saveDisplayName() {
    setMessage(null);

    const session = await supabaseBrowser.auth.getSession();
    const token = session.data.session?.access_token;

    const res = await fetch("/api/set-display-name", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ displayName })
    });

    const data = await res.json();

    if (data.error) {
      setMessage(data.error);
    } else {
      setMessage("✅ Display name saved");
    }
  }

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

    if (data.error) {
      setMessage(data.error);
    } else {
      setMessage("✅ Bid submitted");
    }
  }

  return (
    <main>
      <h1>Bidder</h1>

      <section>
        <h3>Your Display Name</h3>

        <input
          placeholder="e.g. Alice / Paddle 12"
          value={displayName}
          onChange={e => setDisplayName(e.target.value)}
        />

        <br /><br />

        <button onClick={saveDisplayName}>
          Save Display Name
        </button>
      </section>

      <hr />

      <section>
        <h3>Submit Secret Bid</h3>

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

        <button onClick={submitBid}>
          Submit Bid
        </button>
      </section>

      <br />

      {message && <p>{message}</p>}
    </main>
  );
}