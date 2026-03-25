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

  async function signUp(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    const { error } = await supabaseBrowser.auth.signUp({
      email,
      password
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Account created. You can now log in.");
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
      <h1>Login</h1>

      <form>
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

        <button onClick={signIn}>Log In</button>
        <br /><br />
        <button onClick={signUp}>Create Account</button>
        <br /><br />
        <button type="button" onClick={resetPassword}>
          Forgot password?
        </button>
      </form>

      {message && <p>{message}</p>}
    </main>
  );
}