"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

type DocCategory = "STATUTES" | "MINUTES" | "REGULATIONS" | "BUDGETS" | "OTHER";

interface Document {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  category: DocCategory;
  createdAt: string;
  community: { id: string; name: string; slug: string };
}

// ─── Config ───────────────────────────────────────────────────────────────────

const CAT_LABEL: Record<DocCategory, string> = {
  STATUTES: "Estatutos", MINUTES: "Actas", REGULATIONS: "Reglamentos",
  BUDGETS: "Presupuestos", OTHER: "Otros",
};
const CAT_BG: Record<DocCategory, string> = {
  STATUTES: "var(--pl)", MINUTES: "var(--al)", REGULATIONS: "var(--yl)",
  BUDGETS: "var(--gl)", OTHER: "var(--bg)",
};
const CAT_COLOR: Record<DocCategory, string> = {
  STATUTES: "var(--purple)", MINUTES: "var(--accent)", REGULATIONS: "var(--yellow)",
  BUDGETS: "var(--green)", OTHER: "var(--muted)",
};
const CAT_ICON: Record<DocCategory, string> = {
  STATUTES: "📋", MINUTES: "📄", REGULATIONS: "📑", BUDGETS: "💰", OTHER: "📁",
};

const FILTERS: { label: string; value: string }[] = [
  { label: "Todos", value: "all" },
  { label: "Actas", value: "MINUTES" },
  { label: "Presupuestos", value: "BUDGETS" },
  { label: "Estatutos", value: "STATUTES" },
  { label: "Reglamentos", value: "REGULATIONS" },
  { label: "Otros", value: "OTHER" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    setLoading(true);
    const params = activeFilter !== "all" ? `?category=${activeFilter}` : "";
    api
      .get<{ data: Document[] }>(`/documents${params}`)
      .then((res) => setDocuments(res.data.data))
      .catch(() => setError("No se pudieron cargar los documentos."))
      .finally(() => setLoading(false));
  }, [activeFilter]);

  return (
    <>
      {/* Topbar */}
      <div style={{ height: 54, background: "var(--white)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 22px", position: "sticky", top: 0, zIndex: 50 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>Documentos</span>
        <button style={{ padding: "6px 13px", borderRadius: 8, fontSize: 12, fontWeight: 600, background: "var(--accent)", color: "#fff", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
          + Subir documento
        </button>
      </div>

      <div style={{ padding: "20px 22px" }}>
        <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, letterSpacing: "-.5px", marginBottom: 3, color: "var(--ink)" }}>
          Documentos
        </p>
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 14 }}>
          {loading ? "Cargando…" : `${documents.length} documento${documents.length !== 1 ? "s" : ""}`}
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
          <div style={{ display: "grid", gridTemplateColumns: "1fr 160px 120px 110px", padding: "7px 16px", borderBottom: "1px solid var(--border)", background: "var(--bg)" }}>
            {["Documento", "Comunidad", "Categoría", "Fecha"].map((h) => (
              <p key={h} style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".8px", textTransform: "uppercase", color: "var(--muted)" }}>
                {h}
              </p>
            ))}
          </div>

          {loading && (
            <p style={{ padding: "24px 16px", fontSize: 13, color: "var(--muted)", textAlign: "center" }}>Cargando…</p>
          )}

          {!loading && documents.length === 0 && !error && (
            <p style={{ padding: "24px 16px", fontSize: 13, color: "var(--muted)", textAlign: "center" }}>
              No hay documentos para este filtro.
            </p>
          )}

          {documents.map((doc, i) => (
            <div
              key={doc.id}
              style={{
                display: "grid", gridTemplateColumns: "1fr 160px 120px 110px",
                alignItems: "center", padding: "11px 16px",
                borderBottom: i < documents.length - 1 ? "1px solid var(--border)" : "none",
                cursor: "pointer", transition: "background .1s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {/* Title */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{CAT_ICON[doc.category]}</span>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {doc.title}
                  </p>
                  {doc.description && (
                    <p style={{ fontSize: 11, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 1 }}>
                      {doc.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Community */}
              <p style={{ fontSize: 12, color: "var(--ink2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {doc.community.name.replace("Comunidad ", "")}
              </p>

              {/* Category badge */}
              <span style={{ fontSize: 11, fontWeight: 600, background: CAT_BG[doc.category], color: CAT_COLOR[doc.category], borderRadius: 20, padding: "2px 8px", display: "inline-block" }}>
                {CAT_LABEL[doc.category]}
              </span>

              {/* Date */}
              <p style={{ fontSize: 12, color: "var(--muted)" }}>
                {new Date(doc.createdAt).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
