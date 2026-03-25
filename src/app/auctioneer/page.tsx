"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function AuctioneerPage() {
  const [allowed, setAllowed] = useState(false);
  const [lotId, setLotId] = useState("lot-1");
  const [currentBid, setCurrentBid] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [winner, setWinner] = useState<{
    displayName: string;
    winningBid: number;
  } | null>(null);

  // Check login and role
  useEffect(() => {
    async function checkAccess() {
      const { data } = await supabaseBrowser.auth.getUser();
      if (!data.user) {
        window.location.href = "/login";
        return;
      }

      const session = await supabaseBrowser.auth.getSession();
      const token = session.data.session?.access_token;

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

  async function endAuction() {
    setStatusMessage(null);
    setWinner(null);

    const confirmEnd = window.confirm(
      "Are you sure you want to end the auction?"
    );
    if (!confirmEnd) return;

    const session = await supabaseBrowser.auth.getSession();
    const token = session.data.session?.access_token;

    const res = await fetch("/api/end-auction", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ lotId })
    });

    const data = await res.json();
    setStatusMessage(data.status || data.error);
  }

  async function checkBid(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);

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

  async function showWinner() {
    setWinner(null);

    const session = await supabaseBrowser.auth.getSession();
    const token = session.data.session?.access_token;

    const res = await fetch("/api/get-winner", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ lotId })
    });

    const data = await res.json();

    if (data.error) {
      setStatusMessage(data.error);
    } else {
      setWinner(data);
    }
  }

  if (!allowed) {
    return <p>Checking access…</p>;
  }

  return (
    <main>
      <h1>Auctioneer</h1>

      <div>
        <label>Lot ID</label><br />
        <input
          value={lotId}
          onChange={e => setLotId(e.target.value)}
        />
      </div>

      <br />

      <button onClick={endAuction}>End Auction</button>
      <br /><br />

      <form onSubmit={checkBid}>
        <label>Current Bid</label><br />
        <input
          type="number"
          value={currentBid}
          onChange={e => setCurrentBid(e.target.value)}
          required
        />
        <br />
        <button type="submit">Check Bid</button>
      </form>

      <br />

      <button onClick={showWinner}>Show Winner</button>

      <br /><br />

      {result && <p>{result}</p>}
      {statusMessage && <p>{statusMessage}</p>}

      {winner && (
        <div>
          <h3>Winner</h3>
          <p>
            <strong>{winner.displayName}</strong><br />
            Winning Bid: {winner.winningBid}
          </p>
        </div>
      )}
    </main>
  );
}