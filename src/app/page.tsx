"use client";

import { supabaseBrowser } from "@/lib/supabase-browser";

export default function RolePage() {
  async function go(path: string) {
    const { data } = await supabaseBrowser.auth.getUser();

    if (!data.user) {
      window.location.href = "/login";
      return;
    }

    window.location.href = path;
  }

  return (
    <main>
      <div className="card">
        <h1>Choose your role</h1>

        <p>
          Please select how you would like to participate in the auction.
        </p>

        <button onClick={() => go("/bidder")}>
          Enter as Bidder
        </button>

        <br /><br />

        <button onClick={() => go("/auctioneer")}>
          Enter as Auctioneer
        </button>
      </div>
    </main>
  );
}