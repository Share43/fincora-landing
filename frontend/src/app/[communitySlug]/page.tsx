import { notFound } from "next/navigation";

type MeetingType = "ORDINARY" | "EXTRAORDINARY";

interface CommunityData {
  id: string;
  name: string;
  slug: string;
  address: string;
  openIncidents: number;
  upcomingMeetings: {
    id: string; title: string; type: MeetingType; date: string; location: string | null;
  }[];
  _count: { incidents: number; documents: number; meetings: number; residents: number };
}

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const TYPE_LABEL: Record<MeetingType, string> = { ORDINARY: "Ordinaria", EXTRAORDINARY: "Extraordinaria" };

export default async function CommunityHomePage({
  params,
}: {
  params: Promise<{ communitySlug: string }>;
}) {
  const { communitySlug } = await params;

  const res = await fetch(`${API}/public/${communitySlug}`, { cache: "no-store" });
  if (!res.ok) notFound();
  const { data: community }: { data: CommunityData } = await res.json();

  const cards = [
    { href: `/${communitySlug}/incidents`, label: "Incidencias", desc: `${community._count.incidents} registradas · ${community.openIncidents} abiertas`, alert: community.openIncidents > 0 },
    { href: `/${communitySlug}/documents`, label: "Documentos",  desc: `${community._count.documents} disponibles`, alert: false },
    { href: `/${communitySlug}/meetings`,  label: "Juntas",      desc: `${community._count.meetings} en total`, alert: false },
  ];

  return (
    <div>
      {/* Hero */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, letterSpacing: "-.5px", color: "var(--ink)", marginBottom: 4 }}>
          {community.name}
        </p>
        <p style={{ fontSize: 13, color: "var(--muted)" }}>{community.address}</p>
      </div>

      {/* Nav cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
        {cards.map(({ href, label, desc, alert }) => (
          <a
            key={href}
            href={href}
            style={{ display: "block", background: "var(--white)", border: `1px solid ${alert ? "#fca5a5" : "var(--border)"}`, borderRadius: 12, padding: 20, textDecoration: "none" }}
          >
            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>{label}</p>
            <p style={{ fontSize: 12, color: alert ? "var(--red)" : "var(--muted)" }}>{desc}</p>
          </a>
        ))}
      </div>

      {/* Upcoming meetings */}
      {community.upcomingMeetings.length > 0 && (
        <div style={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "11px 16px", borderBottom: "1px solid var(--border)" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>Próximas juntas</span>
          </div>
          {community.upcomingMeetings.map((m) => {
            const d = new Date(m.date);
            const day = d.toLocaleDateString("es-ES", { day: "2-digit" });
            const mon = d.toLocaleDateString("es-ES", { month: "short" }).replace(".", "");
            return (
              <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 16px", borderBottom: "1px solid var(--border)" }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--al)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "var(--accent)", lineHeight: 1 }}>{day}</span>
                  <span style={{ fontSize: 8, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase" }}>{mon}</span>
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{m.title}</p>
                  <p style={{ fontSize: 11, color: "var(--muted)" }}>
                    {TYPE_LABEL[m.type]}{m.location ? ` · ${m.location}` : ""}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
