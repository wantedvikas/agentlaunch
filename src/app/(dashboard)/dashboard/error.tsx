"use client";

import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log for debugging; never render error.message to users (it can contain internals).
    console.error(error);
  }, [error]);

  return (
    <div className="py-10">
      <ErrorState
        className="w-full"
        description={
          <>
            An unexpected error occurred. Try again, or go back home.
            {error.digest && (
              <span className="mt-2 block font-mono text-xs">Ref: {error.digest}</span>
            )}
          </>
        }
        action={
          <div className="flex gap-2">
            <Button onClick={reset}>Try again</Button>
            <Button asChild variant="outline">
              <Link href="/">Home</Link>
            </Button>
          </div>
        }
      />
    </div>
  );
}
