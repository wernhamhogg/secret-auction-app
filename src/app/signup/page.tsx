"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function createAccount(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // 1️⃣ Create auth user
    const { data, error: signUpError } =
      await supabaseBrowser.auth.signUp({
        email,
        password
      });

    if (signUpError || !data.user) {
      setError(signUpError?.message || "Failed to create account");
      setLoading(false);
      return;
    }

    // 2️⃣ Create / update profile with display name
    const { error: profileError } = await supabaseBrowser
      .from("profiles")
      .upsert({
        id: data.user.id,
        display_name: displayName,
        role: "bidder" // default role
      });

    if (profileError) {
      setError("Account created, but profile setup failed");
      setLoading(false);
      return;
    }

    // 3️⃣ Go to role selection
    window.location.href = "/role";
  }

  return (
    <main>
      <div className="panel animate-fade-up">
        <h1>Create account</h1>

        <form onSubmit={createAccount}>
          <label>Display name</label>
          <input
            type="text"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            required
          />

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

          <button type="submit" disabled={loading}>
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        {error && <p style={{ marginTop: "16px" }}>{error}</p>}
      </div>
    </main>
  );
}