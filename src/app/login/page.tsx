"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    const { error } = await supabaseBrowser.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setMessage(error.message);
    } else {
      window.location.href = "/";
    }
  }

  async function resetPassword() {
    setMessage("");

    const { error } = await supabaseBrowser.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}/reset-password`
      }
    );

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Password reset email sent.");
    }
  }

  return (
    <main>
      <div className="panel animate-fade-up">
        <h1>Log in</h1>

        <form onSubmit={signIn}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />

          <button type="submit">Log in</button>
        </form>

        <div style={{ marginTop: "24px" }}>
          <button
            type="button"
            onClick={() => (window.location.href = "/signup")}
            style={{
              backgroundColor: "transparent",
              color: "#111827",
              border: "1px solid #111827"
            }}
          >
            Create account
          </button>
        </div>

        <div style={{ marginTop: "16px" }}>
          <button
            type="button"
            onClick={resetPassword}
            style={{
              backgroundColor: "transparent",
              color: "#6b7280",
              border: "none",
              padding: 0,
              textTransform: "none",
              letterSpacing: "normal"
            }}
          >
            Forgot password?
          </button>
        </div>

        {message && <p style={{ marginTop: "16px" }}>{message}</p>}
      </div>
    </main>
  );
}