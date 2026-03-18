"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Community {
  id: string;
  name: string;
  slug: string;
  address: string;
  publicToken: string;
  openIncidents: number;
  _count: { incidents: number; documents: number; meetings: number; residents: number };
  createdAt: string;
}

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get<{ data: Community[] }>("/communities")
      .then((res) => setCommunities(res.data.data))
      .catch(() => setError("No se pudieron cargar las comunidades."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      {/* Topbar */}
      <div style={{ height: 54, background: "var(--white)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 22px", position: "sticky", top: 0, zIndex: 50 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>Comunidades</span>
        <button style={{ padding: "6px 13px", borderRadius: 8, fontSize: 12, fontWeight: 600, background: "var(--accent)", color: "#fff", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
          + Nueva comunidad
        </button>
      </div>

      <div style={{ padding: "20px 22px" }}>
        <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, letterSpacing: "-.5px", marginBottom: 3, color: "var(--ink)" }}>
          Comunidades
        </p>
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 18 }}>
          {loading ? "Cargando…" : `${communities.length} comunidades gestionadas`}
        </p>

        {error && (
          <div style={{ background: "var(--rl)", border: "1px solid #fca5a5", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "var(--red)", marginBottom: 18 }}>
            {error}
          </div>
        )}

        {/* List */}
        <div style={{ background: "var(--white)", borderRadius: 12, border: "1px solid var(--border)", overflow: "hidden" }}>
          {/* Header row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px 80px 80px 100px", gap: 0, padding: "7px 16px", borderBottom: "1px solid var(--border)", background: "var(--bg)" }}>
            {["Comunidad", "Vecinos", "Incid.", "Docs", "Juntas", "Estado"].map((h) => (
              <p key={h} style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".8px", textTransform: "uppercase", color: "var(--muted)" }}>
                {h}
              </p>
            ))}
          </div>

          {loading && (
            <p style={{ padding: "24px 16px", fontSize: 13, color: "var(--muted)", textAlign: "center" }}>
              Cargando comunidades…
            </p>
          )}

          {!loading && communities.length === 0 && !error && (
            <p style={{ padding: "24px 16px", fontSize: 13, color: "var(--muted)", textAlign: "center" }}>
              Sin comunidades todavía.
            </p>
          )}

          {communities.map((comm, i) => (
            <div
              key={comm.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 80px 80px 80px 80px 100px",
                alignItems: "center",
                padding: "11px 16px",
                borderBottom: i < communities.length - 1 ? "1px solid var(--border)" : "none",
                cursor: "pointer",
                transition: "background .1s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {/* Name + address */}
              <div style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--al)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                  {comm.name.replace("Comunidad ", "").charAt(0)}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {comm.name}
                  </p>
                  <p style={{ fontSize: 11, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {comm.address}
                  </p>
                </div>
              </div>

              {/* Vecinos */}
              <p style={{ fontSize: 13, color: "var(--ink2)" }}>{comm._count.residents}</p>

              {/* Incidencias */}
              <div>
                {comm.openIncidents > 0 ? (
                  <span style={{ fontSize: 11, fontWeight: 700, background: "var(--rl)", color: "var(--red)", borderRadius: 20, padding: "2px 8px" }}>
                    {comm.openIncidents} abiertas
                  </span>
                ) : (
                  <span style={{ fontSize: 11, fontWeight: 600, background: "var(--gl)", color: "var(--green)", borderRadius: 20, padding: "2px 8px" }}>
                    0
                  </span>
                )}
              </div>

              {/* Documentos */}
              <p style={{ fontSize: 13, color: "var(--ink2)" }}>{comm._count.documents}</p>

              {/* Juntas */}
              <p style={{ fontSize: 13, color: "var(--ink2)" }}>{comm._count.meetings}</p>

              {/* Portal público */}
              <a
                href={`/${comm.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{ fontSize: 11, fontWeight: 600, color: "var(--accent)", textDecoration: "none", background: "var(--al)", borderRadius: 6, padding: "3px 9px", display: "inline-block" }}
              >
                Ver portal →
              </a>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
