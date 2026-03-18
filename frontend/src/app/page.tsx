import Link from "next/link";

export default function HomePage() {
  return (
    <main
      style={{ background: "var(--bg)" }}
      className="flex min-h-screen flex-col items-center justify-center p-8"
    >
      <div className="w-full max-w-sm text-center space-y-5">
        <h1
          style={{ fontFamily: "'DM Serif Display', serif", color: "var(--ink)" }}
          className="text-4xl"
        >
          Fin<span style={{ color: "var(--accent)" }}>cora</span>
        </h1>
        <p style={{ color: "var(--muted)" }} className="text-sm leading-relaxed">
          Gestión inteligente para administradores de fincas y comunidades de
          vecinos.
        </p>
        <Link
          href="/login"
          style={{ background: "var(--accent)" }}
          className="inline-block px-6 py-3 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
        >
          Acceder al panel
        </Link>
      </div>
    </main>
  );
}
