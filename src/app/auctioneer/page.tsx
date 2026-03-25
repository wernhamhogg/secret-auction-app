"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

type Lot = {
  lot_id: string;
  locked: boolean;
};

export default function AuctioneerPage() {
  const [allowed, setAllowed] = useState(false);
  const [lots, setLots] = useState<Lot[]>([]);
  const [selectedLot, setSelectedLot] = useState<string>("");
  const [currentBid, setCurrentBid] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [winner, setWinner] = useState<{
    displayName: string;
    winningBid: number;
  } | null>(null);
  const [displayName, setDisplayName] = useState<string>("");

  // Initial load: auth, role, lots, display name
  useEffect(() => {
    async function init() {
      // Must be logged in
      const { data: userData } = await supabaseBrowser.auth.getUser();
      if (!userData.user) {
        window.location.href = "/login";
        return;
      }

      // Load display name
      const { data: profile } = await supabaseBrowser
        .from("profiles")
        .select("display_name, role")
        .eq("id", userData.user.id)
        .single();

      if (profile?.role !== "auctioneer") {
        window.location.href = "/";
        return;
      }

      setDisplayName(profile.display_name || "Auctioneer");

      // Load lots
      const { data: lotsData } = await supabaseBrowser
        .from("lots")
        .select("lot_id, locked")
        .order("lot_id");

      setLots(lotsData || []);
      setSelectedLot(lotsData?.[0]?.lot_id || "");

      setAllowed(true);
    }

    init();
  }, []);

  async function logout() {
    await supabaseBrowser.auth.signOut();
    window.location.href = "/";
  }

  async function checkBid(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);
    setStatusMessage(null);

    const session = await supabaseBrowser.auth.getSession();
    const token = session.data.session?.access_token;

    const res = await fetch("/api/check-bid", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        lotId: selectedLot,
        currentBid: Number(currentBid)
      })
    });

    const data = await res.json();

    if (data.error) {
      setStatusMessage(data.error);
      return;
    }

    setResult(
      data.higherSecretBid
        ? "❌ There exists a higher secret bid"
        : "✅ You are the high bidder"
    );
  }

  async function endAuction() {
    setStatusMessage(null);
    setWinner(null);

    const confirmEnd = window.confirm(
      `End auction for ${selectedLot}? This cannot be undone.`
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
      body: JSON.stringify({ lotId: selectedLot })
    });

    const data = await res.json();
    setStatusMessage(data.status || data.error);
  }

  async function showWinner() {
    setWinner(null);
    setStatusMessage(null);

    const session = await supabaseBrowser.auth.getSession();
    const token = session.data.session?.access_token;

    const res = await fetch("/api/get-winner", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ lotId: selectedLot })
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
      <header style={{ marginBottom: "20px" }}>
        <strong>Logged in as:</strong> {displayName}
        <br />
        <button onClick={logout}>Log out</button>
      </header>

      <h1>Auctioneer</h1>

      <div>
        <label>Select Lot</label><br />
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