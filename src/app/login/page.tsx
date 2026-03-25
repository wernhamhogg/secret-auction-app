"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  async function signIn(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await supabaseBrowser.auth.signInWithOtp({
      email
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Check your email for the login link.");
    }
  }

  return (
    <main>
      <h1>Login</h1>

      <form onSubmit={signIn}>
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <button type="submit">Send Login Link</button>
      </form>

      {message && <p>{message}</p>}
    </main>
  );
}