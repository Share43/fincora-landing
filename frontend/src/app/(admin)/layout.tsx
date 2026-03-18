"use client";

import Link from "next/link";


const NAV = [
  { href: "/dashboard", icon: "▦", label: "Dashboard" },
  { href: "/communities", icon: "⌂", label: "Comunidades" },
  { href: "/incidents", icon: "⚠", label: "Incidencias" },
  { href: "/documents", icon: "☰", label: "Documentos" },
  { href: "/meetings", icon: "◷", label: "Juntas" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside
        style={{
          width: 224,
          background: "var(--ink)",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 100,
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: "16px 18px",
            borderBottom: "1px solid rgba(255,255,255,.07)",
          }}
        >
          <span
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: 19,
              color: "#fff",
            }}
          >
            Fin<span style={{ color: "#60a5fa" }}>cora</span>
          </span>
          <small
            style={{
              display: "block",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 11,
              color: "rgba(255,255,255,.3)",
              fontWeight: 400,
              marginTop: 1,
            }}
          >
            Panel administrador
          </small>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: "12px 10px" }}>
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              color: "rgba(255,255,255,.25)",
              padding: "0 8px",
              marginBottom: 8,
            }}
          >
            General
          </p>
          {NAV.map(({ href, icon, label }) => (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                padding: "7px 9px",
                borderRadius: 8,
                color: "rgba(255,255,255,.55)",
                fontSize: 13,
                fontWeight: 500,
                textDecoration: "none",
                marginBottom: 1,
                transition: "background .12s, color .12s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,.07)";
                (e.currentTarget as HTMLAnchorElement).style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,.55)";
              }}
            >
              <span style={{ fontSize: 14, width: 18, textAlign: "center" }}>{icon}</span>
              {label}
            </Link>
          ))}
        </nav>

        {/* User chip */}
        <div style={{ padding: "10px", borderTop: "1px solid rgba(255,255,255,.07)" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              padding: "8px 9px",
              borderRadius: 8,
              background: "rgba(255,255,255,.05)",
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "var(--accent)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'DM Serif Display', serif",
                fontSize: 12,
                flexShrink: 0,
              }}
            >
              A
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                Administrador
              </p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,.3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                admin@fincora.es
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────── */}
      <main style={{ marginLeft: 224, flex: 1, display: "flex", flexDirection: "column" }}>
        {children}
      </main>
    </div>
  );
}
