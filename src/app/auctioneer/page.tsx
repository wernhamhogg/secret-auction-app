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
      <div
        style={{
          position: "relative",
          borderRadius: "16px",
          overflow: "hidden"
        }}
      >
        <Image
          src="/landing.png"
          alt="Blind auction"
          width={1408}
          height={768}
          priority
          style={{
            width: "100%",
            height: "auto",
            display: "block"
          }}
        />

        {/* Overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.75) 100%)"
          }}
        />

        {/* Content */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: "clamp(20px, 6vw, 48px)",
            color: "#ffffff"
          }}
        >
          <h1
            style={{
              fontSize: "clamp(1.8rem, 5vw, 3rem)",
              fontWeight: 700,
              letterSpacing: "0.05em",
              marginBottom: "12px",
              textShadow: "0 2px 10px rgba(0,0,0,0.6)"
            }}
          >
            BBA BLIND AUCTION
          </h1>

          <p
            style={{
              fontSize: "clamp(0.95rem, 3vw, 1.15rem)",
              fontWeight: 500,
              color: "#f9fafb",
              marginBottom: "28px",
              maxWidth: "640px",
              textShadow: "0 2px 8px rgba(0,0,0,0.6)"
            }}
          >
            FOR THOSE NOT MAN ENOUGH TO TAKE PART IN PERSON
          </p>

          <button
            onClick={enterAuction}
            style={{
              alignSelf: "flex-start",
              backgroundColor: "#ffffff",
              color: "#111827",
              padding: "14px 32px",
              fontSize: "0.85rem",
              fontWeight: 600,
              letterSpacing: "0.12em",
              borderRadius: "999px",
              textTransform: "uppercase",
              transition: "all 0.25s ease"
            }}
          >
            Enter the auction
          </button>
        </div>
      </div>
    </main>
  );
}