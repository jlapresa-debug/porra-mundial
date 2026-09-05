import { Team } from "@/lib/types";
import { cn } from "@/lib/cn";

interface Props {
  team?: Team | undefined;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
  align?: "left" | "right" | "center";
  className?: string;
}

const px = { sm: 24, md: 36, lg: 56 } as const;
const textSize = { sm: "text-[9px]", md: "text-xs", lg: "text-sm" } as const;

// No usamos escudos de clubes reales (evitamos enlazar imágenes de terceros
// sin verificar para 36 equipos). El badge muestra el código corto del
// equipo sobre un círculo, manteniendo el mismo patrón visual que antes.
export function TeamBadge({ team, size = "md", showName = true, align = "center", className }: Props) {
  const dim = px[size];
  return (
    <div
      className={cn(
        "flex items-center gap-2",
        align === "right" && "flex-row-reverse",
        align === "center" && "flex-col",
        className,
      )}
    >
      <div
        className="rounded-full overflow-hidden ring-2 ring-white/10 bg-bg-elevated grid place-items-center shrink-0"
        style={{ width: dim, height: dim }}
      >
        {team ? (
          <span className={cn("font-display font-bold tracking-tight", textSize[size])}>
            {team.code}
          </span>
        ) : (
          <span className="text-muted text-xs">?</span>
        )}
      </div>
      {showName && (
        <span
          className={cn(
            "font-medium",
            size === "sm" && "text-xs",
            size === "md" && "text-sm",
            size === "lg" && "text-base",
          )}
        >
          {team?.name ?? "—"}
        </span>
      )}
    </div>
  );
}
