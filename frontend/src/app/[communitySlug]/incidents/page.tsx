import { notFound } from "next/navigation";

type IncidentStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

interface Incident {
  id: string;
  title: string;
  description: string | null;
  status: IncidentStatus;
  priority: Priority;
  createdAt: string;
}

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const STATUS_LABEL: Record<IncidentStatus, string> = {
  OPEN: "Abierta", IN_PROGRESS: "En curso", RESOLVED: "Resuelta", CLOSED: "Cerrada",
};
const STATUS_BG: Record<IncidentStatus, string> = {
  OPEN: "var(--rl)", IN_PROGRESS: "var(--ol)", RESOLVED: "var(--gl)", CLOSED: "var(--bg)",
};
const STATUS_COLOR: Record<IncidentStatus, string> = {
  OPEN: "var(--red)", IN_PROGRESS: "var(--orange)", RESOLVED: "var(--green)", CLOSED: "var(--muted)",
};
const PRIORITY_DOT: Record<Priority, string> = {
  URGENT: "var(--red)", HIGH: "var(--orange)", MEDIUM: "var(--yellow)", LOW: "var(--green)",
};
const PRIORITY_LABEL: Record<Priority, string> = {
  URGENT: "Urgente", HIGH: "Alta", MEDIUM: "Normal", LOW: "Baja",
};

export default async function CommunityIncidentsPage({
  params,
}: {
  params: Promise<{ communitySlug: string }>;
}) {
  const { communitySlug } = await params;

  const res = await fetch(`${API}/public/${communitySlug}/incidents`, { cache: "no-store" });
  if (!res.ok) notFound();
  const { data: incidents }: { data: Incident[] } = await res.json();

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, letterSpacing: "-.5px", marginBottom: 3, color: "var(--ink)" }}>
          Incidencias
        </p>
        <p style={{ fontSize: 13, color: "var(--muted)" }}>
          {incidents.length} incidencia{incidents.length !== 1 ? "s" : ""} registrada{incidents.length !== 1 ? "s" : ""}
        </p>
      </div>

      {incidents.length === 0 ? (
        <div style={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: 12, padding: 40, textAlign: "center" }}>
          <p style={{ fontSize: 13, color: "var(--muted)" }}>Sin incidencias registradas.</p>
        </div>
      ) : (
        <div style={{ background: "var(--white)", borderRadius: 12, border: "1px solid var(--border)", overflow: "hidden" }}>
          {/* Table header */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 100px 120px", padding: "7px 16px", borderBottom: "1px solid var(--border)", background: "var(--bg)" }}>
            {["Incidencia", "Prioridad", "Estado", "Fecha"].map((h) => (
              <p key={h} style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".8px", textTransform: "uppercase", color: "var(--muted)" }}>
                {h}
              </p>
            ))}
          </div>

          {incidents.map((inc, i) => (
            <div
              key={inc.id}
              style={{
                display: "grid", gridTemplateColumns: "1fr 120px 100px 120px",
                alignItems: "center", padding: "11px 16px",
                borderBottom: i < incidents.length - 1 ? "1px solid var(--border)" : "none",
              }}
            >
              {/* Title + description */}
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: PRIORITY_DOT[inc.priority], flexShrink: 0 }} />
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {inc.title}
                  </p>
                </div>
                {inc.description && (
                  <p style={{ fontSize: 11, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 2, paddingLeft: 14 }}>
                    {inc.description}
                  </p>
                )}
              </div>

              {/* Priority */}
              <p style={{ fontSize: 12, color: "var(--ink2)" }}>{PRIORITY_LABEL[inc.priority]}</p>

              {/* Status badge */}
              <span style={{ fontSize: 11, fontWeight: 600, background: STATUS_BG[inc.status], color: STATUS_COLOR[inc.status], borderRadius: 20, padding: "2px 8px", display: "inline-block" }}>
                {STATUS_LABEL[inc.status]}
              </span>

              {/* Date */}
              <p style={{ fontSize: 12, color: "var(--muted)" }}>
                {new Date(inc.createdAt).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" }).replace(".", "")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
