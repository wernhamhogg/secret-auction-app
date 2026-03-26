"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function RolePage() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    async function loadRole() {
      const { data } = await supabaseBrowser.auth.getUser();
      if (!data.user) {
        window.location.href = "/login";
        return;
      }

      const { data: profile } = await supabaseBrowser
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      setRole(profile?.role || null);
    }

    loadRole();
  }, []);

  async function enterBidder() {
    const { data } = await supabaseBrowser.auth.getUser();
    if (!data.user) return;

    // ✅ Only set bidder if no role exists yet
    if (!role) {
      await supabaseBrowser
        .from("profiles")
        .update({ role: "bidder" })
        .eq("id", data.user.id);
    }

    window.location.href = "/bidder";
  }

  function enterAuctioneer() {
    // ✅ Never modify role here
    window.location.href = "/auctioneer";
  }

  return (
    <main>
      <div className="panel animate-fade-up">
        <h1>Choose your role</h1>

        <button onClick={enterBidder}>
          Enter as Bidder
        </button>

        <br /><br />

        <button onClick={enterAuctioneer}>
          Enter as Auctioneer
        </button>
      </div>
    </main>
  );
}