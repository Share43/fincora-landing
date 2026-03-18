export default async function CommunityLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ communitySlug: string }>;
}) {
  const { communitySlug } = await params;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <header
        style={{
          background: "var(--white)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div
          style={{
            maxWidth: 960,
            margin: "0 auto",
            padding: "0 24px",
            height: 54,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: 17,
                color: "var(--ink)",
              }}
            >
              Fin<span style={{ color: "var(--accent)" }}>cora</span>
            </span>
            <span
              style={{
                width: 1,
                height: 16,
                background: "var(--border)",
                display: "inline-block",
              }}
            />
            <span style={{ fontSize: 13, color: "var(--muted)" }}>{communitySlug}</span>
          </div>

          <nav style={{ display: "flex", gap: 20 }}>
            {[
              { href: `/${communitySlug}`, label: "Inicio" },
              { href: `/${communitySlug}/incidents`, label: "Incidencias" },
              { href: `/${communitySlug}/documents`, label: "Documentos" },
              { href: `/${communitySlug}/meetings`, label: "Juntas" },
            ].map(({ href, label }) => (
              <a
                key={href}
                href={href}
                style={{
                  fontSize: 13,
                  color: "var(--ink2)",
                  textDecoration: "none",
                  fontWeight: 500,
                }}
              >
                {label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: 960, margin: "0 auto", padding: "24px" }}>
        {children}
      </main>
    </div>
  );
}
