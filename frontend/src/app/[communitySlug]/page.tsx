import type { Metadata } from "next";

export const metadata: Metadata = { title: "Portal de Comunidad" };

export default async function CommunityHomePage({
  params,
}: {
  params: Promise<{ communitySlug: string }>;
}) {
  const { communitySlug } = await params;

  return (
    <div>
      <p
        style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: 22,
          letterSpacing: "-.5px",
          marginBottom: 4,
          color: "var(--ink)",
        }}
      >
        Portal de la comunidad
      </p>
      <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 20 }}>
        {communitySlug}
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {[
          { href: `/${communitySlug}/incidents`, label: "Incidencias", desc: "Consulta el estado de las incidencias." },
          { href: `/${communitySlug}/documents`, label: "Documentos", desc: "Accede a estatutos, actas y más." },
          { href: `/${communitySlug}/meetings`, label: "Juntas", desc: "Próximas convocatorias y actas." },
        ].map(({ href, label, desc }) => (
          <a
            key={href}
            href={href}
            style={{
              display: "block",
              background: "var(--white)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: 20,
              textDecoration: "none",
            }}
          >
            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>
              {label}
            </p>
            <p style={{ fontSize: 12, color: "var(--muted)" }}>{desc}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
