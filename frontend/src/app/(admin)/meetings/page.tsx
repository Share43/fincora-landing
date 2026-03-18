"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

type MeetingStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED";
type MeetingType = "ORDINARY" | "EXTRAORDINARY";

interface Meeting {
  id: string;
  title: string;
  description: string | null;
  date: string;
  location: string | null;
  type: MeetingType;
  status: MeetingStatus;
  agenda: string | null;
  minutes: string | null;
  community: { id: string; name: string; slug: string };
}

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<MeetingStatus, string> = {
  SCHEDULED: "Convocada", COMPLETED: "Completada", CANCELLED: "Cancelada",
};
const STATUS_BG: Record<MeetingStatus, string> = {
  SCHEDULED: "var(--al)", COMPLETED: "var(--gl)", CANCELLED: "var(--bg)",
};
const STATUS_COLOR: Record<MeetingStatus, string> = {
  SCHEDULED: "var(--accent)", COMPLETED: "var(--green)", CANCELLED: "var(--muted)",
};
const TYPE_LABEL: Record<MeetingType, string> = {
  ORDINARY: "Ordinaria", EXTRAORDINARY: "Extraordinaria",
};
const TYPE_BG: Record<MeetingType, string> = {
  ORDINARY: "var(--bg)", EXTRAORDINARY: "var(--pl)",
};
const TYPE_COLOR: Record<MeetingType, string> = {
  ORDINARY: "var(--muted)", EXTRAORDINARY: "var(--purple)",
};

const FILTERS: { label: string; value: string }[] = [
  { label: "Todas", value: "all" },
  { label: "Convocadas", value: "SCHEDULED" },
  { label: "Completadas", value: "COMPLETED" },
  { label: "Canceladas", value: "CANCELLED" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    setLoading(true);
    const params = activeFilter !== "all" ? `?status=${activeFilter}` : "";
    api
      .get<{ data: Meeting[] }>(`/meetings${params}`)
      .then((res) => setMeetings(res.data.data))
      .catch(() => setError("No se pudieron cargar las juntas."))
      .finally(() => setLoading(false));
  }, [activeFilter]);

  return (
    <>
      {/* Topbar */}
      <div style={{ height: 54, background: "var(--white)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 22px", position: "sticky", top: 0, zIndex: 50 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>Juntas</span>
        <button style={{ padding: "6px 13px", borderRadius: 8, fontSize: 12, fontWeight: 600, background: "var(--accent)", color: "#fff", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
          + Convocar junta
        </button>
      </div>

      <div style={{ padding: "20px 22px" }}>
        <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, letterSpacing: "-.5px", marginBottom: 3, color: "var(--ink)" }}>
          Juntas
        </p>
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 14 }}>
          {loading ? "Cargando…" : `${meetings.length} junta${meetings.length !== 1 ? "s" : ""}`}
        </p>

        {/* Filter bar */}
        <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              style={{
                padding: "5px 12px", borderRadius: 7, fontSize: 12, fontWeight: 500,
                cursor: "pointer", fontFamily: "inherit", transition: "all .12s",
                border: activeFilter === f.value ? "1px solid var(--accent)" : "1px solid var(--border)",
                background: activeFilter === f.value ? "var(--accent)" : "var(--white)",
                color: activeFilter === f.value ? "#fff" : "var(--ink2)",
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
          <div style={{ display: "grid", gridTemplateColumns: "56px 1fr 160px 110px 110px 110px", padding: "7px 16px", borderBottom: "1px solid var(--border)", background: "var(--bg)" }}>
            {["Fecha", "Junta", "Comunidad", "Tipo", "Estado", "Lugar"].map((h) => (
              <p key={h} style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".8px", textTransform: "uppercase", color: "var(--muted)" }}>
                {h}
              </p>
            ))}
          </div>

          {loading && (
            <p style={{ padding: "24px 16px", fontSize: 13, color: "var(--muted)", textAlign: "center" }}>Cargando…</p>
          )}

          {!loading && meetings.length === 0 && !error && (
            <p style={{ padding: "24px 16px", fontSize: 13, color: "var(--muted)", textAlign: "center" }}>
              No hay juntas para este filtro.
            </p>
          )}

          {meetings.map((m, i) => {
            const d = new Date(m.date);
            const day = d.toLocaleDateString("es-ES", { day: "2-digit" });
            const mon = d.toLocaleDateString("es-ES", { month: "short" }).replace(".", "");
            const isPast = d < new Date();

            return (
              <div
                key={m.id}
                style={{
                  display: "grid", gridTemplateColumns: "56px 1fr 160px 110px 110px 110px",
                  alignItems: "center", padding: "11px 16px",
                  borderBottom: i < meetings.length - 1 ? "1px solid var(--border)" : "none",
                  cursor: "pointer", transition: "background .1s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {/* Date block */}
                <div style={{ width: 36, height: 36, borderRadius: 8, background: isPast ? "var(--bg)" : "var(--al)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: isPast ? "var(--muted)" : "var(--accent)", lineHeight: 1 }}>{day}</span>
                  <span style={{ fontSize: 8, fontWeight: 700, color: isPast ? "var(--muted)" : "var(--accent)", textTransform: "uppercase" }}>{mon}</span>
                </div>

                {/* Title */}
                <div style={{ minWidth: 0, paddingLeft: 4 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {m.title}
                  </p>
                  {m.description && (
                    <p style={{ fontSize: 11, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 1 }}>
                      {m.description}
                    </p>
                  )}
                </div>

                {/* Community */}
                <p style={{ fontSize: 12, color: "var(--ink2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {m.community.name.replace("Comunidad ", "")}
                </p>

                {/* Type badge */}
                <span style={{ fontSize: 11, fontWeight: 600, background: TYPE_BG[m.type], color: TYPE_COLOR[m.type], borderRadius: 20, padding: "2px 8px", display: "inline-block" }}>
                  {TYPE_LABEL[m.type]}
                </span>

                {/* Status badge */}
                <span style={{ fontSize: 11, fontWeight: 600, background: STATUS_BG[m.status], color: STATUS_COLOR[m.status], borderRadius: 20, padding: "2px 8px", display: "inline-block" }}>
                  {STATUS_LABEL[m.status]}
                </span>

                {/* Location */}
                <p style={{ fontSize: 11, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {m.location ?? "—"}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
