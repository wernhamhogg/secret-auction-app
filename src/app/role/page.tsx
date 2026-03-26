"use client";

import { supabaseBrowser } from "@/lib/supabase-browser";

export default function RolePage() {
  async function chooseBidder() {
    const { data } = await supabaseBrowser.auth.getUser();
    if (!data.user) {
      window.location.href = "/login";
      return;
    }

    await supabaseBrowser
      .from("profiles")
      .update({ role: "bidder" })
      .eq("id", data.user.id);

    window.location.href = "/bidder";
  }

  async function goAuctioneer() {
    // 🚫 Do NOT set role here
    window.location.href = "/auctioneer";
  }

  return (
    <main>
      <div className="panel animate-fade-up">
        <h1>Choose your role</h1>

        <button onClick={chooseBidder}>
          Enter as Bidder
        </button>

        <br /><br />

        <button onClick={goAuctioneer}>
          Enter as Auctioneer
        </button>
      </div>
    </main>
  );
}