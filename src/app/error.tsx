"use client";

import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";

export default function RootError({
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
    <main id="main" className="mx-auto flex w-full max-w-lg flex-1 items-center px-4 py-24">
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
    </main>
  );
}
