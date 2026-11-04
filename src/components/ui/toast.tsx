"use client";

import { CircleAlert, CircleCheck, X } from "lucide-react";
import { Toast as ToastPrimitive } from "radix-ui";
import * as React from "react";

import { cn } from "@/lib/utils";

type ToastVariant = "default" | "success" | "error";
type ToastItem = { id: number; title: string; description?: string; variant: ToastVariant };

// Tiny module-level store so any client code can call toast() without a context hook.
let items: ToastItem[] = [];
let nextId = 1;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function toast(input: { title: string; description?: string; variant?: ToastVariant }) {
  items = [...items, { id: nextId++, variant: "default", ...input }];
  emit();
}
function dismiss(id: number) {
  items = items.filter((t) => t.id !== id);
  emit();
}
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const EMPTY: ToastItem[] = [];

const icons = { success: CircleCheck, error: CircleAlert, default: null } as const;

/** Mount once in the root layout. */
export function Toaster() {
  const toasts = React.useSyncExternalStore(
    subscribe,
    () => items,
    () => EMPTY,
  );
  return (
    <ToastPrimitive.Provider swipeDirection="right" duration={5000}>
      {toasts.map((t) => {
        const Icon = icons[t.variant];
        return (
          <ToastPrimitive.Root
            key={t.id}
            type={t.variant === "error" ? "foreground" : "background"}
            onOpenChange={(open) => !open && dismiss(t.id)}
            className={cn(
              "grid grid-cols-[auto_1fr_auto] items-start gap-3 rounded-lg border bg-popover p-4 text-popover-foreground shadow-lg data-[state=open]:animate-fade-in data-[swipe=move]:translate-x-(--radix-toast-swipe-move-x)",
              t.variant === "error" && "border-destructive/40",
            )}
          >
            {Icon ? (
              <Icon
                className={cn(
                  "mt-0.5 size-4",
                  t.variant === "success" ? "text-success" : "text-destructive",
                )}
                aria-hidden
              />
            ) : (
              <span />
            )}
            <div className="grid gap-1">
              <ToastPrimitive.Title className="text-sm font-medium">{t.title}</ToastPrimitive.Title>
              {t.description && (
                <ToastPrimitive.Description className="text-sm text-muted-foreground">
                  {t.description}
                </ToastPrimitive.Description>
              )}
            </div>
            <ToastPrimitive.Close className="rounded-sm p-0.5 text-muted-foreground hover:text-foreground">
              <X className="size-4" aria-hidden />
              <span className="sr-only">Dismiss</span>
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        );
      })}
      <ToastPrimitive.Viewport className="fixed right-0 bottom-0 z-[100] flex w-full max-w-sm flex-col gap-2 p-4 outline-none" />
    </ToastPrimitive.Provider>
  );
}
