"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function AuctioneerPage() {
  const [allowed, setAllowed] = useState(false);
  const [lotId, setLotId] = useState("");
  const [currentBid, setCurrentBid] = useState("");
  const [result, setResult] = useState<string | null>(null);

  // Check login + role on page load
  useEffect(() => {
    async function checkAccess() {
      // 1. Must be logged in
      const { data } = await supabaseBrowser.auth.getUser();
      if (!data.user) {
        window.location.href = "/login";
        return;
      }

      // 2. Get session token
      const session = await supabaseBrowser.auth.getSession();
      const token = session.data.session?.access_token;

      // 3. Ask server what role this user has
      const res = await fetch("/api/my-role", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const roleData = await res.json();

      // 4. Only auctioneers allowed
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

    // 1. Get session token
    const session = await supabaseBrowser.auth.getSession();
    const token = session.data.session?.access_token;

    // 2. Call protected API
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

    const data =