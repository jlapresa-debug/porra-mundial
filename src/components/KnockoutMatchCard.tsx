"use client";

import { useEffect, useState } from "react";
import type { Match } from "@/lib/types";
import { getTeam } from "@/lib/teams";
import { TeamBadge } from "./TeamBadge";
import { Button } from "./ui/Button";
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
  // Selección local — cambia al pulsar un equipo, NO guarda en Firestore aún
  const [pending, setPending] = useState<string | undefined>(savedWinner);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  // Sincronizar cuando lleguen datos guardados (carga inicial)
  useEffect(() => {
    setPending(savedWinner);
  }, [savedWinner]);

  const homeTeam = getTeam(match.home);
  const awayTeam = getTeam(match.away);
  const teamsKnown = !!(match.home && match.away);

  const homeName = homeTeam?.name ?? match.homePlaceholder ?? "—";
  const awayName = awayTeam?.name ?? match.awayPlaceholder ?? "—";

  const isHomeSelected = !!match.home && pending === match.home;
  const isAwaySelected = !!match.away && pending === match.away;

  const dirty = pending !== savedWinner;
  const canSave = !locked && teamsKnown && !!pending && dirty;

  function pickLocally(side: "home" | "away") {
    if (!teamsKnown || locked) return;
    const winner = side === "home" ? match.home! : match.away!;
    setPending(winner);
    setJustSaved(false);
  }

  async function handleSave() {
    if (!canSave || !pending) return;
    setSaving(true);
    try {
      await onPick(pending);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  // Etiqueta del botón
  let buttonLabel: string;
  if (justSaved) buttonLabel = "Guardado ✓";
  else if (!pending) buttonLabel = "Elige un equipo";
  else if (savedWinner && dirty) buttonLabel = "Guardar cambios";
  else if (savedWinner) buttonLabel = "Guardado";
  else buttonLabel = "Apostar";

  return (
    <div className={cn(
      "rounded-2xl bg-bg-card border overflow-hidden transition-colors",
      (isHomeSelected || isAwaySelected) ? "border-brand/30" : "border-line",
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
        <button
          type="button"
          onClick={() => pickLocally("home")}
          disabled={!teamsKnown || locked}
          className={cn(
            "flex flex-col items-center gap-2 px-4 py-5 border-r border-line transition-colors",
            teamsKnown && !locked && "hover:bg-bg-hover active:scale-[0.98] cursor-pointer",
            isHomeSelected && "bg-brand/10",
            !teamsKnown && "cursor-default",
          )}
        >
          <TeamBadge team={homeTeam} size="md" showName={false} />
          <span className={cn(
            "text-xs font-medium text-center leading-snug",
            isHomeSelected ? "text-brand" : "text-white",
          )}>
            {homeName}
          </span>
          {isHomeSelected && (
            <span className="text-[9px] uppercase tracking-widest text-brand font-bold">
              ✓ Elegido
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => pickLocally("away")}
          disabled={!teamsKnown || locked}
          className={cn(
            "flex flex-col items-center gap-2 px-4 py-5 transition-colors",
            teamsKnown && !locked && "hover:bg-bg-hover active:scale-[0.98] cursor-pointer",
            isAwaySelected && "bg-brand/10",
            !teamsKnown && "cursor-default",
          )}
        >
          <TeamBadge team={awayTeam} size="md" showName={false} />
          <span className={cn(
            "text-xs font-medium text-center leading-snug",
            isAwaySelected ? "text-brand" : "text-white",
          )}>
            {awayName}
          </span>
          {isAwaySelected && (
            <span className="text-[9px] uppercase tracking-widest text-brand font-bold">
              ✓ Elegido
            </span>
          )}
        </button>
      </div>

      {/* Botón de guardar */}
      {teamsKnown && !locked && (
        <div className="px-4 py-3 border-t border-line">
          <Button
            size="sm"
            fullWidth
            onClick={handleSave}
            loading={saving}
            disabled={!canSave}
          >
            {buttonLabel}
          </Button>
        </div>
      )}

      {!teamsKnown && (
        <div className="px-4 py-2 border-t border-line text-center text-[11px] text-muted">
          Los equipos se decidirán al avanzar el torneo
        </div>
      )}
    </div>
  );
}
