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
      {/* HERO */}
      <div
        style={{
          position: "relative",
          borderRadius: "16px",
          overflow: "hidden"
        }}
      >
        {/* Desktop image */}
        <div className="hero-desktop">
          <Image
            src="/landing-desktop.png"
            alt="Blind auction"
            width={1408}
            height={768}
            priority
            style={{ width: "100%", height: "auto", display: "block" }}
          />
        </div>

        {/* Mobile image */}
        <div className="hero-mobile">
          <Image
            src="/landing-mobile.png"
            alt="Blind auction"
            width={768}
            height={1408}
            priority
            style={{ width: "100%", height: "auto", display: "block" }}
          />
        </div>

        {/* Overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.8) 100%)"
          }}
        />

        {/* Text overlay (desktop + mobile text) */}
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
              fontSize: "clamp(1.8rem, 6vw, 3rem)",
              fontWeight: 700,
              letterSpacing: "0.06em",
              marginBottom: "12px",
              textShadow: "0 2px 12px rgba(0,0,0,0.7)"
            }}
          >
            BBA BLIND AUCTION
          </h1>

          <p
            style={{
              fontSize: "clamp(1rem, 3.5vw, 1.15rem)",
              fontWeight: 500,
              color: "#f9fafb", // ✅ lighter for readability
              marginBottom: "28px",
              maxWidth: "640px",
              textShadow: "0 2px 10px rgba(0,0,0,0.7)"
            }}
          >
            FOR THOSE NOT MAN ENOUGH TO TAKE PART IN PERSON
          </p>

          {/* Desktop-only CTA */}
          <button
            onClick={enterAuction}
            className="cta-desktop"
            style={{
              alignSelf: "flex-start",
              backgroundColor: "#ffffff",
              color: "#111827",
              padding: "14px 32px",
              fontSize: "0.85rem",
              fontWeight: 600,
              letterSpacing: "0.12em",
              borderRadius: "999px",
              textTransform: "uppercase"
            }}
          >
            Enter the auction
          </button>
        </div>
      </div>

      {/* Mobile-only CTA BELOW image */}
      <div className="cta-mobile" style={{ marginTop: "24px" }}>
        <button
          onClick={enterAuction}
          style={{
            width: "100%",
            backgroundColor: "#111827",
            color: "#ffffff",
            padding: "16px 0",
            fontSize: "0.85rem",
            fontWeight: 600,
            letterSpacing: "0.12em",
            borderRadius: "999px",
            textTransform: "uppercase"
          }}
        >
          Enter the auction
        </button>
      </div>
    </main>
  );
}