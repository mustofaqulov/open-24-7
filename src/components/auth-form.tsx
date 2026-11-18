"use client";
import { PageArtwork } from "@/components/page-artwork";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useT } from "./locale";
export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const { t } = useT();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch(
        `/api/v1/auth/${mode === "login" ? "login" : "register"}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, displayName }),
        },
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error?.message || "Could not continue");
      router.push("/profile");
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="page-shell">
      <div className="container auth-illustrated">
        <form className="panel auth-card" onSubmit={submit}>
          <h1>{mode === "login" ? t.signIn : t.signUp}</h1>
          <p>{t.slogan}</p>
          {mode === "register" && (
            <div className="field">
              <label htmlFor="display-name">{t.name}</label>
              <input
                id="display-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                minLength={2}
                maxLength={80}
                autoComplete="name"
              />
            </div>
          )}
          <div className="field">
            <label htmlFor="email">{t.email}</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="field">
            <label htmlFor="password">{t.password}</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={mode === "register" ? 12 : 1}
              autoComplete={
                mode === "register" ? "new-password" : "current-password"
              }
            />
          </div>
          {error && (
            <p className="notice error-notice" role="alert">
              {error}
            </p>
          )}
          <button className="button" type="submit" disabled={busy}>
            {busy ? t.pleaseWait : mode === "login" ? t.signIn : t.signUp}
          </button>
          <div className="auth-note">
            {mode === "login" ? (
              <span>
                {t.newHere} <Link href="/signup">{t.signUp}</Link>
              </span>
            ) : (
              <span>
                {t.alreadyRegistered} <Link href="/login">{t.signIn}</Link>
              </span>
            )}
          </div>
        </form>
        <PageArtwork subject="business" />
      </div>
    </div>
  );
}
