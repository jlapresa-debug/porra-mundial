// Componente legacy — no se usa en el flujo principal de la v2.
// Se conserva por compatibilidad. Las apuestas se hacen en GroupStandingCard y KnockoutMatchCard.

import Link from "next/link";
import { Match } from "@/lib/types";
import { getTeam } from "@/lib/teams";
import { TeamBadge } from "./TeamBadge";
import { cn } from "@/lib/cn";

interface Props {
  match: Match;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("es-ES", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MatchCard({ match }: Props) {
  const home = getTeam(match.home);
  const away = getTeam(match.away);

  return (
    <Link
      href={`/matches/${match.id}`}
      className={cn(
        "block rounded-2xl bg-bg-card border border-line p-4 transition-all hover:border-brand/40 active:scale-[0.99]",
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="text-[10px] uppercase tracking-wider text-muted font-medium">
          {match.stage === "group" ? `Grupo ${match.group} · J${match.matchday}` : match.stage}
        </div>
        <div className="text-[10px] text-muted">{formatDate(match.kickoff)}</div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <TeamBadge team={home} size="md" showName={false} />
          <span className="font-medium truncate text-sm">
            {home?.name ?? match.homePlaceholder ?? "Por definir"}
          </span>
        </div>
        <div className="font-display font-semibold text-muted text-sm px-3">VS</div>
        <div className="flex-1 flex items-center gap-2 justify-end min-w-0">
          <span className="font-medium truncate text-sm text-right">
            {away?.name ?? match.awayPlaceholder ?? "Por definir"}
          </span>
          <TeamBadge team={away} size="md" showName={false} />
        </div>
      </div>

      <div className="mt-3">
        <span className="text-[10px] text-muted truncate">{match.venue}</span>
      </div>
    </Link>
  );
}
