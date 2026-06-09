"use client";

import { useState } from "react";
import type { Match } from "@/lib/types";
import { getTeam } from "@/lib/teams";
import { TeamBadge } from "./TeamBadge";
import { stageLabel } from "@/lib/matches";
import { cn } from "@/lib/cn";

interface Props {
  match: Match;
  savedWinner?: string;
  locked: boolean;
  onPick: (winner: string) => Promise<void>;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("es-ES", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function KnockoutMatchCard({ match, savedWinner, locked, onPick }: Props) {
  const [saving, setSaving] = useState<"home" | "away" | null>(null);

  const homeTeam = getTeam(match.home);
  const awayTeam = getTeam(match.away);
  const teamsKnown = !!(match.home && match.away);

  const homeName = homeTeam?.name ?? match.homePlaceholder ?? "—";
  const awayName = awayTeam?.name ?? match.awayPlaceholder ?? "—";

  const homeSelected = !!match.home && savedWinner === match.home;
  const awaySelected = !!match.away && savedWinner === match.away;

  async function pick(side: "home" | "away") {
    if (!teamsKnown || locked) return;
    const winner = side === "home" ? match.home! : match.away!;
    if (winner === savedWinner) return;
    setSaving(side);
    try {
      await onPick(winner);
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className={cn(
      "rounded-2xl bg-bg-card border overflow-hidden transition-colors",
      (homeSelected || awaySelected) ? "border-brand/30" : "border-line",
      !teamsKnown && "opacity-60",
    )}>
      {/* Cabecera */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-line bg-bg-elevated/40">
        <span className="text-[10px] uppercase tracking-wider text-muted font-medium">
          {match.matchNumber ? `M${match.matchNumber} · ` : ""}{fmtDate(match.kickoff)}
        </span>
        <span className="text-[10px] text-muted">
          {locked ? "🔒 Cerrado" : !teamsKnown ? "Por definir" : ""}
        </span>
      </div>

      {/* Selección de ganador */}
      <div className="grid grid-cols-2">
        {/* Local */}
        <button
          type="button"
          onClick={() => pick("home")}
          disabled={!teamsKnown || locked}
          className={cn(
            "flex flex-col items-center gap-2 px-4 py-5 border-r border-line transition-colors",
            teamsKnown && !locked && "hover:bg-bg-hover active:scale-[0.98] cursor-pointer",
            homeSelected && "bg-brand/10",
            !teamsKnown && "cursor-default",
          )}
        >
          {saving === "home" ? (
            <div className="w-9 h-9 rounded-full bg-bg-elevated animate-pulse" />
          ) : (
            <TeamBadge team={homeTeam} size="md" showName={false} />
          )}
          <span className={cn(
            "text-xs font-medium text-center leading-snug",
            homeSelected ? "text-brand" : "text-white",
          )}>
            {homeName}
          </span>
          {homeSelected && (
            <span className="text-[9px] uppercase tracking-widest text-brand font-bold">
              ✓ Elegido
            </span>
          )}
        </button>

        {/* Visitante */}
        <button
          type="button"
          onClick={() => pick("away")}
          disabled={!teamsKnown || locked}
          className={cn(
            "flex flex-col items-center gap-2 px-4 py-5 transition-colors",
            teamsKnown && !locked && "hover:bg-bg-hover active:scale-[0.98] cursor-pointer",
            awaySelected && "bg-brand/10",
            !teamsKnown && "cursor-default",
          )}
        >
          {saving === "away" ? (
            <div className="w-9 h-9 rounded-full bg-bg-elevated animate-pulse" />
          ) : (
            <TeamBadge team={awayTeam} size="md" showName={false} />
          )}
          <span className={cn(
            "text-xs font-medium text-center leading-snug",
            awaySelected ? "text-brand" : "text-white",
          )}>
            {awayName}
          </span>
          {awaySelected && (
            <span className="text-[9px] uppercase tracking-widest text-brand font-bold">
              ✓ Elegido
            </span>
          )}
        </button>
      </div>

      {!teamsKnown && (
        <div className="px-4 py-2 border-t border-line text-center text-[11px] text-muted">
          Los equipos se decidirán al avanzar el torneo
        </div>
      )}
    </div>
  );
}
