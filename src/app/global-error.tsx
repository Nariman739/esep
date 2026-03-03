"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ru">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: "2rem", textAlign: "center" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
          Что-то пошло не так
        </h2>
        <p style={{ color: "#666", marginBottom: "0.25rem" }}>
          {error.message}
        </p>
        {error.digest && (
          <p style={{ color: "#999", fontSize: "0.75rem", marginBottom: "1rem" }}>
            Digest: {error.digest}
          </p>
        )}
        <button
          onClick={reset}
          style={{
            padding: "0.5rem 1.5rem",
            backgroundColor: "#1e3a5f",
            color: "white",
            border: "none",
            borderRadius: "0.5rem",
            cursor: "pointer",
            fontSize: "0.875rem",
          }}
        >
          Попробовать снова
        </button>
      </body>
    </html>
  );
}
