"use client";

import { supabaseBrowser } from "@/lib/supabase-browser";

export default function HomePage() {
  async function goToBidder() {
    const { data } = await supabaseBrowser.auth.getUser();

    if (!data.user) {
      window.location.href = "/login";
    } else {
      window.location.href = "/bidder";
    }
  }

  async function goToAuctioneer() {
    const { data } = await supabaseBrowser.auth.getUser();

    if (!data.user) {
      window.location.href = "/login";
    } else {
      window.location.href = "/auctioneer";
    }
  }

  return (
    <main>
      <h1>Welcome</h1>
      <p>Please choose your role:</p>

      <button onClick={goToBidder}>I am a Bidder</button>
      <br /><br />
      <button onClick={goToAuctioneer}>I am the Auctioneer</button>
    </main>
  );
}