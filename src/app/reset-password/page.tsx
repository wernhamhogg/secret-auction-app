"use client";

import { useState, useEffect } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Supabase automatically sets the session
    // when user arrives via reset link
  }, []);

  async function updatePassword(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    const { error } = await supabaseBrowser.auth.updateUser({
      password
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Password updated successfully.");
    }
  }

  return (
    <main>
      <h1>Reset Password</h1>

      <form onSubmit={updatePassword}>
        <div>
          <label>New Password</label><br />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit">Set New Password</button>
      </form>

      {message && <p>{message}</p>}
    </main>
  );
}