import Link from "next/link";
import { Match, Prediction } from "@/lib/types";
import { getTeam } from "@/lib/teams";
import { TeamBadge } from "./TeamBadge";
import { cn } from "@/lib/cn";

interface Props {
  match: Match;
  prediction?: Prediction;
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

export function MatchCard({ match, prediction }: Props) {
  const home = getTeam(match.home);
  const away = getTeam(match.away);
  const hasResult = !!match.result;
  const kickoff = new Date(match.kickoff);
  const isPast = kickoff.getTime() < Date.now();
  const locked = isPast;

  return (
    <Link
      href={`/matches/${match.id}`}
      className={cn(
        "block rounded-2xl bg-bg-card border border-line p-4 transition-all hover:border-brand/40 active:scale-[0.99]",
        prediction && "border-brand/30 bg-gradient-card",
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="text-[10px] uppercase tracking-wider text-muted font-medium">
          {match.stage === "group" ? `Grupo ${match.group} · J${match.matchday}` : stageShort(match.stage)}
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

        <div className="px-3">
          {hasResult ? (
            <div className="font-display font-bold text-lg tabular-nums">
              {match.result!.home}–{match.result!.away}
            </div>
          ) : prediction ? (
            <div className="text-xs text-center">
              <div className="font-bold text-brand tabular-nums">
                {prediction.home}–{prediction.away}
              </div>
              <div className="text-[9px] uppercase text-muted">tu apuesta</div>
            </div>
          ) : (
            <div className="font-display font-semibold text-muted text-sm">VS</div>
          )}
        </div>

        <div className="flex-1 flex items-center gap-2 justify-end min-w-0">
          <span className="font-medium truncate text-sm text-right">
            {away?.name ?? match.awayPlaceholder ?? "Por definir"}
          </span>
          <TeamBadge team={away} size="md" showName={false} />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-[10px] text-muted truncate">{match.venue}</span>
        {locked && !hasResult && (
          <span className="text-[10px] text-amber-400 font-medium">🔒 Cerrado</span>
        )}
        {!locked && !prediction && (
          <span className="text-[10px] text-brand font-medium">Toca para apostar</span>
        )}
        {!locked && prediction && (
          <span className="text-[10px] text-accent font-medium">✓ Apostado</span>
        )}
      </div>
    </Link>
  );
}

function stageShort(stage: Match["stage"]) {
  switch (stage) {
    case "round32": return "16avos";
    case "round16": return "Octavos";
    case "quarter": return "Cuartos";
    case "semi": return "Semifinal";
    case "thirdplace": return "3er puesto";
    case "final": return "FINAL";
    default: return "";
  }
}
