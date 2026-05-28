import Image from "next/image";
import { Team } from "@/lib/types";
import { flagUrl } from "@/lib/teams";
import { cn } from "@/lib/cn";

interface Props {
  team?: Team | undefined;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
  align?: "left" | "right" | "center";
  className?: string;
}

const px = { sm: 24, md: 36, lg: 56 } as const;

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
        className="rounded-full overflow-hidden ring-2 ring-white/10 bg-bg-elevated"
        style={{ width: dim, height: dim }}
      >
        {team ? (
          <Image
            src={flagUrl(team, dim > 40 ? 160 : 80)}
            alt={team.name}
            width={dim}
            height={dim}
            className="object-cover w-full h-full"
            unoptimized
          />
        ) : (
          <div className="w-full h-full grid place-items-center text-muted text-xs">?</div>
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
