"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Kpis {
  totalCommunities: number;
  openIncidents: number;
  totalDocuments: number;
  upcomingMeetings: number;
}

interface RecentIncident {
  id: string;
  title: string;
  status: string;
  priority: string;
  createdAt: string;
  community: { id: string; name: string; slug: string };
}

interface Community {
  id: string;
  name: string;
  slug: string;
  address: string;
  _count: { incidents: number; documents: number; meetings: number };
}

interface StatsData {
  kpis: Kpis;
  recentIncidents: RecentIncident[];
  communities: Community[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  OPEN: "Abierta", IN_PROGRESS: "En curso", RESOLVED: "Resuelta", CLOSED: "Cerrada",
};
const STATUS_COLOR: Record<string, string> = {
  OPEN: "var(--orange)", IN_PROGRESS: "var(--accent)", RESOLVED: "var(--green)", CLOSED: "var(--muted)",
};
const PRIORITY_COLOR: Record<string, string> = {
  URGENT: "var(--red)", HIGH: "var(--orange)", MEDIUM: "var(--muted)", LOW: "var(--muted)",
};
const PRIORITY_LABEL: Record<string, string> = {
  URGENT: "Urgente", HIGH: "Alta", MEDIUM: "Normal", LOW: "Baja",
};

function StatCard({
  label, value, sub, valueColor,
}: { label: string; value: number | string; sub: string; valueColor?: string }) {
  return (
    <div style={{ background: "var(--white)", borderRadius: 12, border: "1px solid var(--border)", padding: "15px 18px" }}>
      <p style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".8px", marginBottom: 4 }}>
        {label}
      </p>
      <p style={{ fontSize: 26, fontWeight: 700, color: valueColor ?? "var(--ink)", lineHeight: 1 }}>
        {value}
      </p>
      <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 3 }}>{sub}</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [data, setData] = useState<StatsData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get<{ data: StatsData }>("/stats")
      .then((res) => setData(res.data.data))
      .catch(() => setError("No se pudieron cargar los datos. Comprueba tu sesión."));
  }, []);

  const kpis = data?.kpis;

  return (
    <>
      {/* Topbar */}
      <div style={{ height: 54, background: "var(--white)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", padding: "0 22px", position: "sticky", top: 0, zIndex: 50 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>Dashboard</span>
      </div>

      {/* Content */}
      <div style={{ padding: "20px 22px" }}>
        <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, letterSpacing: "-.5px", marginBottom: 3, color: "var(--ink)" }}>
          Resumen general
        </p>
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 18 }}>
          Vista global de todas tus comunidades.
        </p>

        {error && (
          <div style={{ background: "var(--rl)", border: "1px solid #fca5a5", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "var(--red)", marginBottom: 18 }}>
            {error}
          </div>
        )}

        {/* KPI cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 18 }}>
          <StatCard label="Comunidades"        value={kpis?.totalCommunities  ?? "—"} sub="activas" />
          <StatCard label="Incidencias abiertas" value={kpis?.openIncidents   ?? "—"} sub="pendientes" valueColor={kpis?.openIncidents ? "var(--red)" : undefined} />
          <StatCard label="Documentos"          value={kpis?.totalDocuments   ?? "—"} sub="subidos" />
          <StatCard label="Próximas juntas"     value={kpis?.upcomingMeetings ?? "—"} sub="convocadas" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

          {/* Recent incidents */}
          <div style={{ background: "var(--white)", borderRadius: 12, border: "1px solid var(--border)", overflow: "hidden" }}>
            <div style={{ padding: "11px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>Últimas incidencias</span>
            </div>

            {!data ? (
              <p style={{ padding: "20px 16px", fontSize: 13, color: "var(--muted)", textAlign: "center" }}>Cargando…</p>
            ) : data.recentIncidents.length === 0 ? (
              <p style={{ padding: "20px 16px", fontSize: 13, color: "var(--muted)", textAlign: "center" }}>Sin incidencias.</p>
            ) : (
              data.recentIncidents.map((inc) => (
                <div key={inc.id} style={{ display: "flex", alignItems: "flex-start", gap: 11, padding: "11px 16px", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: PRIORITY_COLOR[inc.priority] ?? "var(--muted)", marginTop: 5, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {inc.title}
                    </p>
                    <p style={{ fontSize: 11, color: "var(--muted)" }}>{inc.community.name}</p>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: STATUS_COLOR[inc.status] ?? "var(--muted)", flexShrink: 0 }}>
                    {STATUS_LABEL[inc.status] ?? inc.status}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Communities list */}
          <div style={{ background: "var(--white)", borderRadius: 12, border: "1px solid var(--border)", overflow: "hidden" }}>
            <div style={{ padding: "11px 16px", borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>Comunidades</span>
            </div>

            {!data ? (
              <p style={{ padding: "20px 16px", fontSize: 13, color: "var(--muted)", textAlign: "center" }}>Cargando…</p>
            ) : data.communities.length === 0 ? (
              <p style={{ padding: "20px 16px", fontSize: 13, color: "var(--muted)", textAlign: "center" }}>Sin comunidades.</p>
            ) : (
              data.communities.slice(0, 6).map((comm) => (
                <div key={comm.id} style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 16px", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--al)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                    {comm.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {comm.name}
                    </p>
                    <p style={{ fontSize: 11, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {comm.address}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    {comm._count.incidents > 0 && (
                      <span style={{ fontSize: 10, fontWeight: 700, background: "var(--rl)", color: "var(--red)", borderRadius: 20, padding: "1px 7px" }}>
                        {comm._count.incidents}
                      </span>
                    )}
                    <span style={{ fontSize: 10, fontWeight: 700, background: "var(--bg)", color: "var(--muted)", borderRadius: 20, padding: "1px 7px" }}>
                      {comm._count.documents} docs
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </>
  );
}
