"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError("Correo o contraseña incorrectos.");
        return;
      }

      localStorage.setItem("fincora_token", data.token);
      router.push("/dashboard");
    } catch {
      setError("No se pudo conectar con el servidor. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      {/* Logo */}
      <div className="text-center mb-8">
        <h1
          style={{ fontFamily: "'DM Serif Display', serif", color: "var(--ink)" }}
          className="text-3xl mb-1"
        >
          Fin<span style={{ color: "var(--accent)" }}>cora</span>
        </h1>
        <p style={{ color: "var(--muted)" }} className="text-xs">
          Panel de administración
        </p>
      </div>

      {/* Card */}
      <div
        style={{
          background: "var(--white)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          padding: "28px 28px 24px",
        }}
      >
        <h2 style={{ color: "var(--ink)", fontWeight: 700, fontSize: 16, marginBottom: 20 }}>
          Bienvenido de nuevo
        </h2>

        {/* Error banner */}
        {error && (
          <div
            style={{
              background: "var(--rl)",
              border: "1px solid #fca5a5",
              borderRadius: 8,
              padding: "9px 12px",
              fontSize: 13,
              color: "var(--red)",
              marginBottom: 16,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              style={{ color: "var(--ink2)", fontSize: 12, fontWeight: 600 }}
              className="block mb-1.5"
            >
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              placeholder="admin@fincora.es"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                border: "1px solid var(--border)",
                borderRadius: 9,
                padding: "8px 12px",
                fontSize: 13,
                color: "var(--ink)",
                background: "var(--white)",
                outline: "none",
                fontFamily: "inherit",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="password"
                style={{ color: "var(--ink2)", fontSize: 12, fontWeight: 600 }}
              >
                Contraseña
              </label>
            </div>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                border: "1px solid var(--border)",
                borderRadius: 9,
                padding: "8px 12px",
                fontSize: 13,
                color: "var(--ink)",
                background: "var(--white)",
                outline: "none",
                fontFamily: "inherit",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              background: loading ? "#93c5fd" : "var(--accent)",
              color: "#fff",
              border: "none",
              borderRadius: 9,
              padding: "9px 0",
              fontSize: 13,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              marginTop: 4,
              boxShadow: loading ? "none" : "0 4px 14px rgba(37,99,235,.25)",
              transition: "background .15s",
            }}
          >
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>
      </div>

      {/* Footer */}
      <p style={{ color: "var(--muted)", fontSize: 12, textAlign: "center", marginTop: 16 }}>
        ¿Nuevo en Fincora?{" "}
        <Link
          href="/register"
          style={{ color: "var(--accent)", fontWeight: 600, textDecoration: "none" }}
        >
          Crea tu cuenta
        </Link>
      </p>
    </div>
  );
}
