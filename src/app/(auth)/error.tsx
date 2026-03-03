"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Auth error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <h2 className="text-xl font-bold mb-2">Ошибка загрузки</h2>
      <p className="text-sm text-muted-foreground mb-1">
        {error.message}
      </p>
      {error.digest && (
        <p className="text-xs text-muted-foreground mb-4">
          Digest: {error.digest}
        </p>
      )}
      <Button onClick={reset}>Попробовать снова</Button>
    </div>
  );
}
