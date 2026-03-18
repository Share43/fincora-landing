"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

type IncidentStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
type Priority = "URGENT" | "HIGH" | "MEDIUM" | "LOW";

interface Incident {
  id: string;
  title: string;
  description: string;
  status: IncidentStatus;
  priority: Priority;
  createdAt: string;
  community: { id: string; name: string; slug: string };
}

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<IncidentStatus, string> = {
  OPEN: "Abierta", IN_PROGRESS: "En curso", RESOLVED: "Resuelta", CLOSED: "Cerrada",
};
const STATUS_BG: Record<IncidentStatus, string> = {
  OPEN: "var(--ol)", IN_PROGRESS: "var(--al)", RESOLVED: "var(--gl)", CLOSED: "var(--bg)",
};
const STATUS_COLOR: Record<IncidentStatus, string> = {
  OPEN: "var(--orange)", IN_PROGRESS: "var(--accent)", RESOLVED: "var(--green)", CLOSED: "var(--muted)",
};
const PRIORITY_COLOR: Record<Priority, string> = {
  URGENT: "var(--red)", HIGH: "var(--orange)", MEDIUM: "#94a3b8", LOW: "#cbd5e1",
};
const PRIORITY_LABEL: Record<Priority, string> = {
  URGENT: "Urgente", HIGH: "Alta", MEDIUM: "Normal", LOW: "Baja",
};

const FILTERS: { label: string; value: string }[] = [
  { label: "Todas", value: "all" },
  { label: "Abiertas", value: "OPEN" },
  { label: "En curso", value: "IN_PROGRESS" },
  { label: "Resueltas", value: "RESOLVED" },
  { label: "Cerradas", value: "CLOSED" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    setLoading(true);
    const params = activeFilter !== "all" ? `?status=${activeFilter}` : "";
    api
      .get<{ data: Incident[] }>(`/incidents${params}`)
      .then((res) => setIncidents(res.data.data))
      .catch(() => setError("No se pudieron cargar las incidencias."))
      .finally(() => setLoading(false));
  }, [activeFilter]);

  return (
    <>
      {/* Topbar */}
      <div style={{ height: 54, background: "var(--white)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 22px", position: "sticky", top: 0, zIndex: 50 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>Incidencias</span>
        <button style={{ padding: "6px 13px", borderRadius: 8, fontSize: 12, fontWeight: 600, background: "var(--accent)", color: "#fff", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
          + Nueva incidencia
        </button>
      </div>

      <div style={{ padding: "20px 22px" }}>
        <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, letterSpacing: "-.5px", marginBottom: 3, color: "var(--ink)" }}>
          Incidencias
        </p>
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 14 }}>
          {loading ? "Cargando…" : `${incidents.length} incidencia${incidents.length !== 1 ? "s" : ""}`}
        </p>

        {/* Filter bar */}
        <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              style={{
                padding: "5px 12px",
                borderRadius: 7,
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "inherit",
                border: activeFilter === f.value ? "1px solid var(--accent)" : "1px solid var(--border)",
                background: activeFilter === f.value ? "var(--accent)" : "var(--white)",
                color: activeFilter === f.value ? "#fff" : "var(--ink2)",
                transition: "all .12s",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {error && (
          <div style={{ background: "var(--rl)", border: "1px solid #fca5a5", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "var(--red)", marginBottom: 14 }}>
            {error}
          </div>
        )}

        {/* Table */}
        <div style={{ background: "var(--white)", borderRadius: 12, border: "1px solid var(--border)", overflow: "hidden" }}>
          {/* Header */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 160px 90px 90px 110px", padding: "7px 16px", borderBottom: "1px solid var(--border)", background: "var(--bg)" }}>
            {["Incidencia", "Comunidad", "Estado", "Prioridad", "Apertura"].map((h) => (
              <p key={h} style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".8px", textTransform: "uppercase", color: "var(--muted)" }}>
                {h}
              </p>
            ))}
          </div>

          {loading && (
            <p style={{ padding: "24px 16px", fontSize: 13, color: "var(--muted)", textAlign: "center" }}>
              Cargando…
            </p>
          )}

          {!loading && incidents.length === 0 && !error && (
            <p style={{ padding: "24px 16px", fontSize: 13, color: "var(--muted)", textAlign: "center" }}>
              No hay incidencias para este filtro.
            </p>
          )}

          {incidents.map((inc, i) => (
            <div
              key={inc.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 160px 90px 90px 110px",
                alignItems: "center",
                padding: "11px 16px",
                borderBottom: i < incidents.length - 1 ? "1px solid var(--border)" : "none",
                cursor: "pointer",
                transition: "background .1s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {/* Title */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10, minWidth: 0 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: PRIORITY_COLOR[inc.priority], marginTop: 5, flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {inc.title}
                  </p>
                  <p style={{ fontSize: 11, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 1 }}>
                    {inc.description.slice(0, 80)}{inc.description.length > 80 ? "…" : ""}
                  </p>
                </div>
              </div>

              {/* Community */}
              <p style={{ fontSize: 12, color: "var(--ink2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {inc.community.name.replace("Comunidad ", "")}
              </p>

              {/* Status badge */}
              <span style={{ fontSize: 11, fontWeight: 600, background: STATUS_BG[inc.status], color: STATUS_COLOR[inc.status], borderRadius: 20, padding: "2px 8px", display: "inline-block" }}>
                {STATUS_LABEL[inc.status]}
              </span>

              {/* Priority badge */}
              <span style={{ fontSize: 11, fontWeight: 600, color: PRIORITY_COLOR[inc.priority] }}>
                {PRIORITY_LABEL[inc.priority]}
              </span>

              {/* Date */}
              <p style={{ fontSize: 12, color: "var(--muted)" }}>
                {new Date(inc.createdAt).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
