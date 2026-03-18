export default async function CommunityIncidentsPage({
  params,
}: {
  params: Promise<{ communitySlug: string }>;
}) {
  const { communitySlug } = await params;

  return (
    <div>
      <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, letterSpacing: "-.5px", marginBottom: 4, color: "var(--ink)" }}>
        Incidencias
      </p>
      <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 20 }}>{communitySlug}</p>
      <div style={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: 12, padding: 24, textAlign: "center" }}>
        <p style={{ fontSize: 13, color: "var(--muted)" }}>Sin incidencias registradas.</p>
      </div>
    </div>
  );
}
