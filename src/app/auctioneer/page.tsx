"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function AuctioneerPage() {
  const [allowed, setAllowed] = useState(false);
  const [lotId, setLotId] = useState("");
  const [currentBid, setCurrentBid] = useState("");
  const [result, setResult] = useState<string | null>(null);

  // Check login and role on page load
  useEffect(() => {
    async function checkAccess() {
      // Must be logged in
      const { data: userData } = await supabaseBrowser.auth.getUser();
      if (!userData.user) {
        window.location.href = "/login";
        return;
      }

      // Get access token
      const session = await supabaseBrowser.auth.getSession();
      const token = session.data.session?.access_token;

      // Ask server for role
      const res = await fetch("/api/my-role", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

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
          <label>Lot ID</label>
          <br />
          <input
            value={lotId}
            onChange={(e) => setLotId(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Current Bid</label>
          <br />
          <input
            type="number"
            value={currentBid}
            onChange={(e) => setCurrentBid(e.target.value)}
            required
          />
        </div>

        <button type="submit">Check Bid</button>
      </form>

      {result && <p>{result}</p>}
    </main>
  );
}