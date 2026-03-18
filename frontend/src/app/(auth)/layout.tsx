export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{ background: "var(--bg)" }}
      className="min-h-screen flex items-center justify-center p-4"
    >
      {children}
    </div>
  );
}
