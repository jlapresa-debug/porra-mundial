import { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-bg-card border border-line p-4 shadow-xl shadow-black/20",
        className,
      )}
      {...rest}
    />
  );
}
