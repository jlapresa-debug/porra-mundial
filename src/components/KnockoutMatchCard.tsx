"use client";

import { useEffect, useState } from "react";
import type { Match, MatchPick } from "@/lib/types";
import { getTeam } from "@/lib/teams";
import { TeamBadge } from "./TeamBadge";
import { Button } from "./ui/Button";
import { cn } from "@/lib/cn";

interface Props {
  match: Match;
  savedPick?: MatchPick;
  locked: boolean;
  onPick: (pick: MatchPick) => Promise<void>;
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

export function KnockoutMatchCard({ match, savedPick, locked, onPick }: Props) {
  // Selección local — cambia al pulsar, NO guarda en Firestore aún
  const [pending, setPending] = useState<MatchPick | undefined>(savedPick);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    setPending(savedPick);
  }, [savedPick]);

  const homeTeam = getTeam(match.home);
  const awayTeam = getTeam(match.away);
  const teamsKnown = !!(match.home && match.away);

  const homeName = homeTeam?.name ?? match.homePlaceholder ?? "—";
  const awayName = awayTeam?.name ?? match.awayPlaceholder ?? "—";

  const dirty = pending !== savedPick;
  const canSave = !locked && teamsKnown && !!pending && dirty;

  function pickLocally(pick: MatchPick) {
    if (!teamsKnown || locked) return;
    setPending(pick);
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

  let buttonLabel: string;
  if (justSaved) buttonLabel = "Guardado ✓";
  else if (!pending) buttonLabel = "Elige un resultado";
  else if (savedPick && dirty) buttonLabel = "Guardar cambios";
  else if (savedPick) buttonLabel = "Guardado";
  else buttonLabel = "Apostar";

  return (
    <div className={cn(
      "rounded-2xl bg-bg-card border overflow-hidden transition-colors",
      pending ? "border-brand/30" : "border-line",
      !teamsKnown && "opacity-60",
    )}>
      {/* Cabecera */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-line bg-bg-elevated/40">
        <span className="text-[10px] uppercase tracking-wider text-muted font-medium">
          {fmtDate(match.kickoff)}
        </span>
        <span className="text-[10px] text-muted">
          {locked ? "🔒 Cerrado" : !teamsKnown ? "Por definir" : ""}
        </span>
      </div>

      {/* Equipos */}
      <div className="flex items-center justify-center gap-4 px-4 py-4">
        <div className="flex flex-col items-center gap-1.5 flex-1">
          <TeamBadge team={homeTeam} size="md" showName={false} />
          <span className="text-xs font-medium text-center leading-snug">{homeName}</span>
        </div>
        <span className="text-[10px] uppercase text-muted font-bold">vs</span>
        <div className="flex flex-col items-center gap-1.5 flex-1">
          <TeamBadge team={awayTeam} size="md" showName={false} />
          <span className="text-xs font-medium text-center leading-snug">{awayName}</span>
        </div>
      </div>

      {/* Selección de resultado */}
      {teamsKnown && (
        <div className="grid grid-cols-3 gap-2 px-4 pb-4">
          <PickButton
            label={homeTeam?.code ?? "1"}
            selected={pending === match.home}
            disabled={locked}
            onClick={() => pickLocally(match.home!)}
          />
          <PickButton
            label="Empate"
            selected={pending === "draw"}
            disabled={locked}
            onClick={() => pickLocally("draw")}
          />
          <PickButton
            label={awayTeam?.code ?? "2"}
            selected={pending === match.away}
            disabled={locked}
            onClick={() => pickLocally(match.away!)}
          />
        </div>
      )}

      {/* Botón de guardar */}
      {teamsKnown && !locked && (
        <div className="px-4 pb-4">
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
          Los equipos se decidirán cuando se sortee esta ronda
        </div>
      )}
    </div>
  );
}

function PickButton({
  label, selected, disabled, onClick,
}: { label: string; selected: boolean; disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "h-11 rounded-xl text-xs font-bold border transition-colors",
        selected ? "bg-brand text-white border-brand" : "bg-bg-elevated border-line text-muted hover:text-white",
        disabled && "opacity-50 cursor-not-allowed",
      )}
    >
      {label}
    </button>
  );
}
