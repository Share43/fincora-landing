import { notFound } from "next/navigation";

type DocumentCategory = "MINUTES" | "BUDGETS" | "STATUTES" | "REGULATIONS" | "OTHER";

interface Document {
  id: string;
  title: string;
  description: string | null;
  category: DocumentCategory;
  fileUrl: string | null;
  createdAt: string;
}

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const CAT_LABEL: Record<DocumentCategory, string> = {
  MINUTES: "Acta", BUDGETS: "Presupuesto", STATUTES: "Estatutos",
  REGULATIONS: "Reglamento", OTHER: "Otro",
};
const CAT_BG: Record<DocumentCategory, string> = {
  MINUTES: "var(--al)", BUDGETS: "var(--gl)", STATUTES: "var(--pl)",
  REGULATIONS: "var(--yl)", OTHER: "var(--bg)",
};
const CAT_COLOR: Record<DocumentCategory, string> = {
  MINUTES: "var(--accent)", BUDGETS: "var(--green)", STATUTES: "var(--purple)",
  REGULATIONS: "var(--yellow)", OTHER: "var(--muted)",
};

// Simple file-type icon
function DocIcon({ fileUrl }: { fileUrl: string | null }) {
  const ext = fileUrl?.split(".").pop()?.toLowerCase() ?? "";
  const isPdf = ext === "pdf";
  return (
    <div style={{ width: 32, height: 32, borderRadius: 8, background: isPdf ? "var(--rl)" : "var(--al)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <span style={{ fontSize: 10, fontWeight: 700, color: isPdf ? "var(--red)" : "var(--accent)", textTransform: "uppercase" }}>
        {isPdf ? "PDF" : "DOC"}
      </span>
    </div>
  );
}

export default async function CommunityDocumentsPage({
  params,
}: {
  params: Promise<{ communitySlug: string }>;
}) {
  const { communitySlug } = await params;

  const res = await fetch(`${API}/public/${communitySlug}/documents`, { cache: "no-store" });
  if (!res.ok) notFound();
  const { data: documents }: { data: Document[] } = await res.json();

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, letterSpacing: "-.5px", marginBottom: 3, color: "var(--ink)" }}>
          Documentos
        </p>
        <p style={{ fontSize: 13, color: "var(--muted)" }}>
          {documents.length} documento{documents.length !== 1 ? "s" : ""} disponible{documents.length !== 1 ? "s" : ""}
        </p>
      </div>

      {documents.length === 0 ? (
        <div style={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: 12, padding: 40, textAlign: "center" }}>
          <p style={{ fontSize: 13, color: "var(--muted)" }}>Sin documentos disponibles.</p>
        </div>
      ) : (
        <div style={{ background: "var(--white)", borderRadius: 12, border: "1px solid var(--border)", overflow: "hidden" }}>
          {/* Table header */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 130px 120px", padding: "7px 16px", borderBottom: "1px solid var(--border)", background: "var(--bg)" }}>
            {["Documento", "Categoría", "Fecha"].map((h) => (
              <p key={h} style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".8px", textTransform: "uppercase", color: "var(--muted)" }}>
                {h}
              </p>
            ))}
          </div>

          {documents.map((doc, i) => (
            <div
              key={doc.id}
              style={{
                display: "grid", gridTemplateColumns: "1fr 130px 120px",
                alignItems: "center", padding: "11px 16px",
                borderBottom: i < documents.length - 1 ? "1px solid var(--border)" : "none",
              }}
            >
              {/* Icon + title */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                <DocIcon fileUrl={doc.fileUrl} />
                <div style={{ minWidth: 0 }}>
                  {doc.fileUrl ? (
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)", textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}
                    >
                      {doc.title}
                    </a>
                  ) : (
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {doc.title}
                    </p>
                  )}
                  {doc.description && (
                    <p style={{ fontSize: 11, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 1 }}>
                      {doc.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Category badge */}
              <span style={{ fontSize: 11, fontWeight: 600, background: CAT_BG[doc.category], color: CAT_COLOR[doc.category], borderRadius: 20, padding: "2px 8px", display: "inline-block" }}>
                {CAT_LABEL[doc.category]}
              </span>

              {/* Date */}
              <p style={{ fontSize: 12, color: "var(--muted)" }}>
                {new Date(doc.createdAt).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" }).replace(".", "")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
