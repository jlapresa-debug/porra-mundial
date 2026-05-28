"use client";

import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { label, hint, error, className, ...rest },
  ref,
) {
  return (
    <label className="block">
      {label && <span className="block text-xs font-medium uppercase tracking-wide text-muted mb-1.5">{label}</span>}
      <input
        ref={ref}
        className={cn(
          "w-full h-12 px-4 rounded-xl bg-bg-card border border-line text-white placeholder:text-muted",
          "focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition",
          error && "border-red-500/50",
          className,
        )}
        {...rest}
      />
      {(hint || error) && (
        <span className={cn("block text-xs mt-1.5", error ? "text-red-400" : "text-muted")}>{error || hint}</span>
      )}
    </label>
  );
});
