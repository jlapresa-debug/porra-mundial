import Link from "next/link";
import { cn } from "@/lib/cn";

interface Props {
  title: string;
  subtitle?: string;
  back?: string;
  right?: React.ReactNode;
  className?: string;
}

export function Header({ title, subtitle, back, right, className }: Props) {
  return (
    <header className={cn("safe-top pb-2", className)}>
      <div className="container-app flex items-center gap-3">
        {back && (
          <Link href={back} className="p-2 -ml-2 rounded-full hover:bg-bg-card transition">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Link>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-xl font-bold leading-tight truncate">{title}</h1>
          {subtitle && <p className="text-xs text-muted truncate">{subtitle}</p>}
        </div>
        {right}
      </div>
    </header>
  );
}
