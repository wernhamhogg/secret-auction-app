"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  async function signUp(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    const { data, error } = await supabaseBrowser.auth.signUp({
      email,
      password
    });

    if (error || !data.user) {
      setMessage(error?.message || "Signup failed");
      return;
    }

    // Save display name to profiles
    await supabaseBrowser
      .from("profiles")
      .update({ display_name: displayName })
      .eq("id", data.user.id);

    window.location.href = "/";
  }

  return (
    <main>
      <h1>Create Account</h1>

      <form onSubmit={signUp}>
        <div>
          <label>Email</label><br />
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Password</label><br />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Display Name</label><br />
          <input
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            placeholder="e.g. Alice / Paddle 12"
            required
          />
        </div>

        <button type="submit">Create Account</button>
      </form>

      {message && <p>{message}</p>}
    </main>
  );
}