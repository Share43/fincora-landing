import { notFound } from "next/navigation";

type MeetingStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED";
type MeetingType = "ORDINARY" | "EXTRAORDINARY";

interface Meeting {
  id: string;
  title: string;
  description: string | null;
  type: MeetingType;
  status: MeetingStatus;
  date: string;
  location: string | null;
  agenda: string | null;
}

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

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

export default async function CommunityMeetingsPage({
  params,
}: {
  params: Promise<{ communitySlug: string }>;
}) {
  const { communitySlug } = await params;

  const res = await fetch(`${API}/public/${communitySlug}/meetings`, { cache: "no-store" });
  if (!res.ok) notFound();
  const { data: meetings }: { data: Meeting[] } = await res.json();

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, letterSpacing: "-.5px", marginBottom: 3, color: "var(--ink)" }}>
          Juntas
        </p>
        <p style={{ fontSize: 13, color: "var(--muted)" }}>
          {meetings.length} junta{meetings.length !== 1 ? "s" : ""} en total
        </p>
      </div>

      {meetings.length === 0 ? (
        <div style={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: 12, padding: 40, textAlign: "center" }}>
          <p style={{ fontSize: 13, color: "var(--muted)" }}>Sin juntas convocadas.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {meetings.map((m) => {
            const d = new Date(m.date);
            const day = d.toLocaleDateString("es-ES", { day: "2-digit" });
            const mon = d.toLocaleDateString("es-ES", { month: "short" }).replace(".", "");
            const year = d.getFullYear();
            const time = d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
            const isPast = d < new Date();

            return (
              <div
                key={m.id}
                style={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 20px", display: "flex", gap: 16, alignItems: "flex-start" }}
              >
                {/* Date block */}
                <div style={{ width: 44, height: 44, borderRadius: 10, background: isPast ? "var(--bg)" : "var(--al)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 17, fontWeight: 700, color: isPast ? "var(--muted)" : "var(--accent)", lineHeight: 1 }}>{day}</span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: isPast ? "var(--muted)" : "var(--accent)", textTransform: "uppercase" }}>{mon}</span>
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>{m.title}</p>
                    <span style={{ fontSize: 11, fontWeight: 600, background: TYPE_BG[m.type], color: TYPE_COLOR[m.type], borderRadius: 20, padding: "2px 8px" }}>
                      {TYPE_LABEL[m.type]}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 600, background: STATUS_BG[m.status], color: STATUS_COLOR[m.status], borderRadius: 20, padding: "2px 8px" }}>
                      {STATUS_LABEL[m.status]}
                    </span>
                  </div>

                  {m.description && (
                    <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>{m.description}</p>
                  )}

                  <p style={{ fontSize: 12, color: "var(--ink2)" }}>
                    {day} {mon} {year} · {time}
                    {m.location ? ` · ${m.location}` : ""}
                  </p>

                  {m.agenda && (
                    <details style={{ marginTop: 10 }}>
                      <summary style={{ fontSize: 12, color: "var(--accent)", cursor: "pointer", fontWeight: 600 }}>
                        Ver orden del día
                      </summary>
                      <p style={{ fontSize: 12, color: "var(--ink2)", marginTop: 6, whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                        {m.agenda}
                      </p>
                    </details>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
