import { CircleAlert, CircleCheck } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";

export function FormMessage({
  error,
  success,
}: {
  error?: string | null;
  success?: string | null;
}) {
  if (error) {
    return (
      <Alert variant="destructive">
        <CircleAlert aria-hidden />
        <AlertDescription className="text-foreground">{error}</AlertDescription>
      </Alert>
    );
  }
  if (success) {
    return (
      <Alert variant="success">
        <CircleCheck aria-hidden />
        <AlertDescription className="text-foreground">{success}</AlertDescription>
      </Alert>
    );
  }
  return null;
}
