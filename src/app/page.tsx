"use client";

import Image from "next/image";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function HomePage() {
  async function enterAuction() {
    const { data } = await supabaseBrowser.auth.getUser();

    if (!data.user) {
      window.location.href = "/login";
    } else {
      window.location.href = "/role";
    }
  }

  return (
    <main>
      <div className="card">
        <h1>Confidential Auction Platform</h1>

        <p>
          A secure, sealed‑bid auction environment designed for
          professional and private use.
        </p>

        <div style={{ margin: "32px 0" }}>
          <Image
            src="/landing.png"
            alt="Auction illustration"
            width={1408}
            height={768}
            priority
            style={{
              width: "100%",
              height: "auto",
              borderRadius: "8px"
            }}
          />
        </div>

        <button onClick={enterAuction}>
          Enter the auction
        </button>
      </div>
    </main>
  );
}