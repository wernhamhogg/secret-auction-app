"use client";

import { supabaseBrowser } from "@/lib/supabase-browser";

export default function RolePage() {
  async function chooseRole(role: "bidder" | "auctioneer") {
    const { data } = await supabaseBrowser.auth.getUser();

    if (!data.user) {
      window.location.href = "/login";
      return;
    }

    // ✅ Persist role choice
    await supabaseBrowser
      .from("profiles")
      .update({ role })
      .eq("id", data.user.id);

    // ✅ Navigate to role page
    window.location.href =
      role === "auctioneer" ? "/auctioneer" : "/bidder";
  }

  return (
    <main>
      <div className="panel animate-fade-up hover-lift">
        <h1>Choose your role</h1>

        <p>
          Select how you would like to participate in the auction.
        </p>

        <button onClick={() => chooseRole("bidder")}>
          Enter as Bidder
        </button>

        <br /><br />

        <button onClick={() => chooseRole("auctioneer")}>
          Enter as Auctioneer
        </button>
      </div>
    </main>
  );
}