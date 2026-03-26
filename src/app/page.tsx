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
        {/* Background image */}
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

        {/* Dark overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.75) 100%)"
          }}
        />

        {/* Content overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: "48px",
            color: "#ffffff"
          }}
        >
          <h1
            style={{
              fontSize: "3rem",
              fontWeight: 700,
              letterSpacing: "0.05em",
              marginBottom: "14px",
              textShadow: "0 2px 10px rgba(0,0,0,0.6)"
            }}
          >
            BBA BLIND AUCTION
          </h1>

          <p
            style={{
              fontSize: "1.15rem",
              fontWeight: 500,
              color: "#f9fafb",
              marginBottom: "36px",
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
              padding: "14px 30px",
              fontSize: "0.95rem",
              fontWeight: 600,
              letterSpacing: "0.1em",
              borderRadius: "999px",
              textTransform: "uppercase",
              transition: "all 0.25s ease"
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = "#111827";
              e.currentTarget.style.color = "#ffffff";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = "#ffffff";
              e.currentTarget.style.color = "#111827";
            }}
          >
            Enter the auction
          </button>
        </div>
      </div>
    </main>
  );
}