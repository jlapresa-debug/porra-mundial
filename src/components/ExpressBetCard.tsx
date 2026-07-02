"use client";

import { useEffect, useMemo, useState } from "react";
import type { ExpressBet, ExpressResult } from "@/lib/express";
import { RESULT_LABEL, isExpressLocked, getExpressOutcome } from "@/lib/express";
import type { ExpressPrediction } from "@/lib/types";
import { getTeam } from "@/lib/teams";
import { getMatch } from "@/lib/matches";
import { scoreExpressBet } from "@/lib/scoring";
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
  const outcome = getExpressOutcome(bet.id);
  const team = getTeam(bet.team);
  const opponent = getTeam(bet.opponent);
  const match = getMatch(bet.matchId);
  const score = outcome ? scoreExpressBet(bet, saved, outcome) : null;

  // Estado local de respuestas
  const [q1, setQ1] = useState<ExpressResult | "">("");
  const [teamGoals, setTeamGoals] = useState<number | "">("");
  const [opponentGoals, setOpponentGoals] = useState<number | "">("");
  const [scorers, setScorers] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sincronizar con datos guardados
  useEffect(() => {
    if (!saved) return;
    setQ1(saved.q1 ?? "");
    setTeamGoals(saved.q2?.teamGoals ?? "");
    setOpponentGoals(saved.q2?.opponentGoals ?? "");
    setScorers(saved.q3 ?? []);
    setAnswers(saved.binaryAnswers ?? {});
  }, [saved]);

  // Q3 reactivo a Q2: ajustar longitud cuando cambian goles del equipo principal
  useEffect(() => {
    if (typeof teamGoals !== "number") return;
    if (!bet.q3) return;
    setScorers((prev) => {
      if (prev.length === teamGoals) return prev;
      if (prev.length < teamGoals) {
        return [...prev, ...Array(teamGoals - prev.length).fill("")];
      }
      return prev.slice(0, teamGoals);
    });
  }, [teamGoals, bet.q3]);

  const goalsOptions = useMemo(
    () => bet.q2 ? Array.from({ length: bet.q2.maxGoals + 1 }, (_, i) => i) : [],
    [bet.q2],
  );

  // Estado de cada bloque
  const hasQ1 = bet.q1 && q1 !== "";
  const hasQ2 = bet.q2 && typeof teamGoals === "number" && typeof opponentGoals === "number";
  const hasQ3 = hasQ2 && bet.q3 && (teamGoals as number) > 0 && scorers.length > 0 && scorers.every((s) => s !== "");
  const hasAnyGeneric = !!bet.questions && Object.keys(answers).length > 0;
  const hasAny = !!(hasQ1 || hasQ2 || hasQ3 || hasAnyGeneric);
  const allowSave = !locked && hasAny;

  // Construir payload omitiendo claves vacías
  function buildPayload(): Partial<Omit<ExpressPrediction, "betId" | "updatedAt">> {
    const data: any = {};
    if (bet.q1 && hasQ1) data.q1 = q1;
    if (bet.q2 && hasQ2) data.q2 = { teamGoals: teamGoals as number, opponentGoals: opponentGoals as number };
    if (bet.q3 && hasQ2 && (teamGoals as number) > 0) data.q3 = scorers;
    if (bet.questions && hasAnyGeneric) data.binaryAnswers = answers;
    return data;
  }

  async function handleSave() {
    if (!allowSave) return;
    setSaving(true);
    setError(null);
    try {
      await onSave(buildPayload());
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2500);
    } catch (e: any) {
      const msg = e?.code === "permission-denied"
        ? "Falta publicar las reglas de Firestore para 'express'."
        : e?.message ?? "No se pudo guardar.";
      setError(msg);
      // eslint-disable-next-line no-console
      console.error("[Express] Error al guardar:", e);
    } finally {
      setSaving(false);
    }
  }

  // Numeración continua: primero el bloque template (si existe), luego las genéricas
  const templateCount = (bet.q1 ? 1 : 0) + (bet.q2 ? 1 : 0) + (bet.q3 && typeof teamGoals === "number" && teamGoals > 0 ? 1 : 0);

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
            ? outcome ? "✅ Resultado conocido" : "🔒 Plazo cerrado"
            : `Cierre: ${formatDeadlineSpain(bet.deadline)}h`}
        </div>
      </div>

      {/* Resultado real */}
      {outcome && (
        <div className="px-4 py-3 bg-emerald-500/5 border-b border-emerald-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-400">
              Resultado real
            </span>
            {score && saved && (
              <span className="text-xs font-bold text-emerald-400">
                {score.total} pts
              </span>
            )}
          </div>
          <div className="grid gap-1.5 text-xs">
            {bet.q1 && outcome.q1 && (
              <Row
                label={`${team?.name} ${RESULT_LABEL[outcome.q1].toLowerCase()}`}
                value={score ? `+${score.q1}` : ""}
                hit={!!score && score.q1 > 0}
              />
            )}
            {bet.q2 && outcome.q2 && (
              <Row
                label={`Resultado: ${team?.name} ${outcome.q2.teamGoals} – ${outcome.q2.opponentGoals} ${opponent?.name}`}
                value={score ? `+${score.q2}` : ""}
                hit={!!score && score.q2 > 0}
              />
            )}
            {bet.q3 && outcome.q3 && outcome.q3.length > 0 && (
              <Row
                label={`Goleadores: ${outcome.q3.join(", ")}`}
                value={score ? `+${score.q3}` : ""}
                hit={!!score && score.q3 > 0}
              />
            )}
            {bet.questions && bet.questions.map((q) => {
              const truth = outcome.binaryAnswers?.[q.id];
              if (truth === undefined) return null;
              const truthLabel = q.kind === "player" ? truth : q.options[Number(truth)];
              const points = score?.binary[q.id] ?? 0;
              return (
                <Row
                  key={q.id}
                  label={`${q.text} → ${truthLabel}`}
                  value={score ? `+${points}` : ""}
                  hit={points > 0}
                />
              );
            })}
          </div>
        </div>
      )}

      <div className="p-4 grid gap-5">
        {/* Template-1: Q1 */}
        {bet.q1 && (
          <Question n={1} title={`¿Qué resultado obtendrá ${team?.name ?? bet.team}?`} points={bet.q1.points}>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(RESULT_LABEL) as ExpressResult[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  disabled={locked}
                  onClick={() => setQ1(r)}
                  className={cn(
                    "h-11 rounded-xl text-sm font-medium border transition-colors",
                    q1 === r ? "bg-brand text-white border-brand" : "bg-bg-elevated border-line text-muted hover:text-white",
                    locked && "opacity-50 cursor-not-allowed",
                  )}
                >
                  {RESULT_LABEL[r]}
                </button>
              ))}
            </div>
          </Question>
        )}

        {/* Template-1: Q2 */}
        {bet.q2 && (
          <Question n={2} title="¿Cuál será el resultado del partido?" points={bet.q2.points}>
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
        )}

        {/* Template-1: Q3 */}
        {bet.q3 && typeof teamGoals === "number" && teamGoals > 0 && (
          <Question n={3} title={`¿Quiénes meterán los goles de ${team?.name ?? bet.team}?`} points={bet.q3.pointsPerHit} pointsSuffix=" por acierto">
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
                  {bet.q3!.squad.map((player) => (
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

        {/* Genérico: preguntas de opciones y de jugador, en orden */}
        {bet.questions && bet.questions.map((q, i) => (
          <Question key={q.id} n={templateCount + i + 1} title={q.text} points={q.points}>
            {q.kind === "player" ? (
              <select
                disabled={locked}
                value={answers[q.id] ?? ""}
                onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                className={cn(
                  "w-full h-11 px-3 rounded-xl bg-bg-elevated border border-line text-white text-sm focus:outline-none focus:border-brand",
                  locked && "opacity-50 cursor-not-allowed",
                )}
              >
                <option value="">Elige jugador</option>
                {q.squad.map((player) => (
                  <option key={player} value={player}>{player}</option>
                ))}
              </select>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {q.options.map((opt, idx) => {
                  const selected = answers[q.id] === String(idx);
                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={locked}
                      onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: String(idx) }))}
                      className={cn(
                        "h-11 rounded-xl text-sm font-medium border transition-colors px-3",
                        selected ? "bg-brand text-white border-brand" : "bg-bg-elevated border-line text-muted hover:text-white",
                        locked && "opacity-50 cursor-not-allowed",
                      )}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            )}
          </Question>
        ))}

        {/* Acción */}
        {!locked && (
          <div className="pt-1 grid gap-2">
            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-3 py-2 text-xs text-red-300">
                ⚠️ {error}
              </div>
            )}
            <Button size="lg" fullWidth onClick={handleSave} loading={saving} disabled={!allowSave}>
              {justSaved ? "Guardado ✓" : saved ? "Actualizar apuesta" : "Guardar apuesta"}
            </Button>
            {!hasAny && (
              <p className="text-[10px] text-muted text-center">
                Responde al menos una pregunta para guardar
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Question({
  n, title, points, pointsSuffix = "", children,
}: { n: number; title: string; points: number; pointsSuffix?: string; children: React.ReactNode }) {
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

function Row({ label, value, hit }: { label: string; value: string; hit: boolean }) {
  return (
    <div className={cn(
      "flex items-start justify-between gap-3",
      hit ? "text-white" : "text-muted",
    )}>
      <span className={cn("text-xs leading-snug", hit && "font-medium")}>{label}</span>
      {value && (
        <span className={cn(
          "text-[11px] font-bold tabular-nums shrink-0",
          hit ? "text-emerald-400" : "text-muted/60",
        )}>
          {value}
        </span>
      )}
    </div>
  );
}

function NumberPicker({
  label, value, options, onChange, disabled,
}: { label: string; value: number | ""; options: number[]; onChange: (n: number) => void; disabled: boolean }) {
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
