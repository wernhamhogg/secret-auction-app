"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function Header() {
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const { data } = await supabaseBrowser.auth.getUser();
      if (!data.user) return;

      const { data: profile } = await supabaseBrowser
        .from("profiles")
        .select("display_name")
        .eq("id", data.user.id)
        .single();

      setDisplayName(profile?.display_name || "User");
    }

    loadProfile();
  }, []);

  async function logout() {
    await supabaseBrowser.auth.signOut();
    window.location.href = "/";
  }

  return (
    <header style={{ marginBottom: "20px" }}>
      {displayName && (
        <>
          <span>Logged in as: <strong>{displayName}</strong></span>
          <br />
          <button onClick={logout}>Log out</button>
        </>
      )}
    </header>
  );
}