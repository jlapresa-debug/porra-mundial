"use client";

import { useEffect, useMemo, useState } from "react";
import type { ExpressBet, ExpressResult } from "@/lib/express";
import { RESULT_LABEL, isExpressLocked } from "@/lib/express";
import type { ExpressPrediction } from "@/lib/types";
import { getTeam } from "@/lib/teams";
import { getMatch } from "@/lib/matches";
import { TeamBadge } from "./TeamBadge";
import { Button } from "./ui/Button";
import { cn } from "@/lib/cn";

interface Props {
  bet: ExpressBet;
  saved?: ExpressPrediction;
  onSave: (data: Omit<ExpressPrediction, "betId" | "updatedAt">) => Promise<void>;
}

function formatDeadlineSpain(iso: string): string {
  return new Date(iso).toLocaleString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Madrid",
  });
}

export function ExpressBetCard({ bet, saved, onSave }: Props) {
  const locked = isExpressLocked(bet);
  const team = getTeam(bet.team);
  const opponent = getTeam(bet.opponent);
  const match = getMatch(bet.matchId);

  // Q1 — resultado del equipo principal
  const [q1, setQ1] = useState<ExpressResult | "">("");
  // Q2 — goles
  const [teamGoals, setTeamGoals] = useState<number | "">("");
  const [opponentGoals, setOpponentGoals] = useState<number | "">("");
  // Q3 — array de goleadores (longitud = teamGoals)
  const [scorers, setScorers] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  // Sincronizar con datos guardados al cargar / cambiar
  useEffect(() => {
    if (!saved) return;
    setQ1(saved.q1 ?? "");
    setTeamGoals(saved.q2?.teamGoals ?? "");
    setOpponentGoals(saved.q2?.opponentGoals ?? "");
    setScorers(saved.q3 ?? []);
  }, [saved]);

  // Q3 reactivo a Q2: ajustar longitud del array de goleadores cuando cambien los goles
  useEffect(() => {
    if (typeof teamGoals !== "number") return;
    setScorers((prev) => {
      if (prev.length === teamGoals) return prev;
      if (prev.length < teamGoals) {
        return [...prev, ...Array(teamGoals - prev.length).fill("")];
      }
      return prev.slice(0, teamGoals);
    });
  }, [teamGoals]);

  const goalsOptions = useMemo(
    () => Array.from({ length: bet.q2.maxGoals + 1 }, (_, i) => i),
    [bet.q2.maxGoals],
  );

  const canSave =
    !locked &&
    q1 !== "" &&
    typeof teamGoals === "number" &&
    typeof opponentGoals === "number" &&
    (teamGoals === 0 || scorers.every((s) => s !== ""));

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    try {
      await onSave({
        q1: q1 as ExpressResult,
        q2: {
          teamGoals: teamGoals as number,
          opponentGoals: opponentGoals as number,
        },
        q3: scorers,
      });
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={cn(
      "rounded-2xl bg-bg-card border overflow-hidden",
      saved ? "border-brand/30" : "border-line",
    )}>
      {/* Cabecera */}
      <div className="px-4 py-3 border-b border-line bg-gradient-card">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <TeamBadge team={team} size="sm" showName={false} />
            <span className="font-display font-bold text-sm">vs</span>
            <TeamBadge team={opponent} size="sm" showName={false} />
            <span className="font-display font-bold text-sm">{bet.title}</span>
          </div>
        </div>
        {match && (
          <div className="text-[10px] text-muted mt-1">
            {new Date(match.kickoff).toLocaleString("es-ES", {
              weekday: "short", day: "2-digit", month: "short",
              hour: "2-digit", minute: "2-digit",
              timeZone: "Europe/Madrid",
            })}h · {match.venue}
          </div>
        )}
        <div className={cn(
          "text-[10px] mt-1 font-medium",
          locked ? "text-amber-400" : "text-emerald-400",
        )}>
          {locked
            ? "🔒 Plazo cerrado"
            : `Cierre: ${formatDeadlineSpain(bet.deadline)}h`}
        </div>
      </div>

      <div className="p-4 grid gap-5">
        {/* Q1 */}
        <Question
          n={1}
          title={`¿Qué resultado obtendrá ${team?.name ?? bet.team}?`}
          points={bet.q1.points}
        >
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(RESULT_LABEL) as ExpressResult[]).map((r) => (
              <button
                key={r}
                type="button"
                disabled={locked}
                onClick={() => setQ1(r)}
                className={cn(
                  "h-11 rounded-xl text-sm font-medium border transition-colors",
                  q1 === r
                    ? "bg-brand text-white border-brand"
                    : "bg-bg-elevated border-line text-muted hover:text-white",
                  locked && "opacity-50 cursor-not-allowed",
                )}
              >
                {RESULT_LABEL[r]}
              </button>
            ))}
          </div>
        </Question>

        {/* Q2 */}
        <Question
          n={2}
          title="¿Cuál será el resultado del partido?"
          points={bet.q2.points}
        >
          <div className="grid grid-cols-2 gap-3">
            <NumberPicker
              label={team?.name ?? bet.team}
              value={teamGoals}
              options={goalsOptions}
              onChange={setTeamGoals}
              disabled={locked}
            />
            <NumberPicker
              label={opponent?.name ?? bet.opponent}
              value={opponentGoals}
              options={goalsOptions}
              onChange={setOpponentGoals}
              disabled={locked}
            />
          </div>
        </Question>

        {/* Q3 */}
        {typeof teamGoals === "number" && teamGoals > 0 && (
          <Question
            n={3}
            title={`¿Quiénes meterán los goles de ${team?.name ?? bet.team}?`}
            points={bet.q3.pointsPerHit}
            pointsSuffix={` por cada acierto`}
          >
            <div className="grid gap-2">
              {Array.from({ length: teamGoals }, (_, i) => (
                <select
                  key={i}
                  disabled={locked}
                  value={scorers[i] ?? ""}
                  onChange={(e) => {
                    const next = [...scorers];
                    next[i] = e.target.value;
                    setScorers(next);
                  }}
                  className={cn(
                    "h-11 px-3 rounded-xl bg-bg-elevated border border-line text-white text-sm focus:outline-none focus:border-brand",
                    locked && "opacity-50 cursor-not-allowed",
                  )}
                >
                  <option value="">Gol {i + 1} · elige jugador</option>
                  {bet.q3.squad.map((player) => (
                    <option key={player} value={player}>{player}</option>
                  ))}
                </select>
              ))}
              <p className="text-[10px] text-muted">
                Puedes repetir un jugador si crees que marcará más de un gol.
              </p>
            </div>
          </Question>
        )}

        {/* Acción */}
        {!locked && (
          <div className="pt-1">
            <Button
              size="lg"
              fullWidth
              onClick={handleSave}
              loading={saving}
              disabled={!canSave}
            >
              {justSaved
                ? "Guardado ✓"
                : saved
                  ? "Actualizar apuesta"
                  : "Guardar apuesta"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function Question({
  n,
  title,
  points,
  pointsSuffix = "",
  children,
}: {
  n: number;
  title: string;
  points: number;
  pointsSuffix?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="text-sm font-semibold leading-snug flex-1">
          <span className="text-brand mr-1">{n}.</span>
          {title}
        </h4>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand/20 text-brand shrink-0 whitespace-nowrap">
          +{points}{pointsSuffix}
        </span>
      </div>
      {children}
    </div>
  );
}

function NumberPicker({
  label,
  value,
  options,
  onChange,
  disabled,
}: {
  label: string;
  value: number | "";
  options: number[];
  onChange: (n: number) => void;
  disabled: boolean;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted mb-1 truncate">{label}</div>
      <select
        disabled={disabled}
        value={value === "" ? "" : String(value)}
        onChange={(e) => onChange(Number(e.target.value))}
        className={cn(
          "w-full h-11 px-3 rounded-xl bg-bg-elevated border border-line text-white text-base font-semibold tabular-nums focus:outline-none focus:border-brand",
          disabled && "opacity-50 cursor-not-allowed",
        )}
      >
        <option value="">—</option>
        {options.map((n) => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>
    </div>
  );
}
