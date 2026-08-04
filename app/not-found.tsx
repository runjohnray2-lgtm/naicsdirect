import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "60vh",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "1rem",
        textAlign: "center",
        padding: "2rem",
      }}
    >
      <h1 style={{ fontSize: "2rem", fontWeight: 700 }}>404 — Page not found</h1>
      <p style={{ color: "#666" }}>
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <Link href="/" style={{ color: "#4f46e5", fontWeight: 600 }}>
        Back to NAICS Direct
      </Link>
    </div>
  );
}
