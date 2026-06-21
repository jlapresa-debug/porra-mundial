"use client";

import { useState, useEffect } from "react";
import type { Team } from "@/lib/types";
import { getTeam } from "@/lib/teams";
import { TeamBadge } from "./TeamBadge";
import { Button } from "./ui/Button";
import { cn } from "@/lib/cn";
import { computeGroupStandings, computeFinalGroupStandings } from "@/lib/standings";
import { ALL_MATCHES } from "@/lib/matches";
import { GROUP_MATCH_RESULTS } from "@/lib/results";

interface Props {
  group: string;
  teams: Team[];
  savedOrder?: string[];
  locked: boolean;
  onSave: (order: string[]) => Promise<void>;
}

const POSITION = ["1°", "2°", "3°", "4°"];

export function GroupStandingCard({ group, teams, savedOrder, locked, onSave }: Props) {
  const defaultOrder = teams.map((t) => t.code);
  const [order, setOrder] = useState<string[]>(savedOrder ?? defaultOrder);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  // Sincronizar cuando llegan datos de Firestore por primera vez
  useEffect(() => {
    if (savedOrder && !dirty) {
      setOrder(savedOrder);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedOrder?.join(",")]);

  function moveUp(i: number) {
    if (i === 0 || locked) return;
    const next = [...order];
    [next[i - 1], next[i]] = [next[i], next[i - 1]];
    setOrder(next);
    setDirty(true);
  }

  function moveDown(i: number) {
    if (i === order.length - 1 || locked) return;
    const next = [...order];
    [next[i], next[i + 1]] = [next[i + 1], next[i]];
    setOrder(next);
    setDirty(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(order);
      setDirty(false);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  }

  const alreadySaved = !dirty && savedOrder !== undefined;

  return (
    <div className={cn(
      "rounded-2xl bg-bg-card border transition-colors",
      alreadySaved ? "border-brand/30" : "border-line",
    )}>
      {/* Cabecera */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-line">
        <div>
          <span className="font-display font-bold text-sm">GRUPO {group}</span>
          <span className="text-[11px] text-muted ml-2">
            {teams.map((t) => t.code).join(" · ")}
          </span>
        </div>
        {justSaved && (
          <span className="text-[11px] text-emerald-400 font-semibold">✓ Guardado</span>
        )}
        {alreadySaved && !justSaved && (
          <span className="text-[11px] text-brand font-semibold">✓ Apostado</span>
        )}
        {locked && (
          <span className="text-[11px] text-amber-400">🔒 Cerrado</span>
        )}
      </div>

      {/* Lista ordenable */}
      <div className="divide-y divide-line">
        {order.map((code, i) => {
          const team = getTeam(code);
          return (
            <div key={code} className="flex items-center gap-3 px-4 py-3">
              <span className="w-6 text-center text-xs font-bold text-muted shrink-0">
                {POSITION[i]}
              </span>
              <TeamBadge team={team} size="sm" showName={false} />
              <span className="flex-1 text-sm font-medium truncate">
                {team?.name ?? code}
              </span>
              {!locked && (
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => moveUp(i)}
                    disabled={i === 0}
                    aria-label="Subir"
                    className="w-7 h-6 rounded flex items-center justify-center text-muted hover:text-white disabled:opacity-20 transition-colors text-[10px] leading-none"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={() => moveDown(i)}
                    disabled={i === order.length - 1}
                    aria-label="Bajar"
                    className="w-7 h-6 rounded flex items-center justify-center text-muted hover:text-white disabled:opacity-20 transition-colors text-[10px] leading-none"
                  >
                    ▼
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Botón guardar */}
      {!locked && (
        <div className="px-4 py-3 border-t border-line">
          <Button
            size="sm"
            fullWidth
            onClick={handleSave}
            loading={saving}
            disabled={alreadySaved}
          >
            {alreadySaved ? "Clasificación guardada" : "Guardar clasificación"}
          </Button>
        </div>
      )}

      {/* Clasificación real (cuando hay resultados) */}
      <LiveStandings group={group} userOrder={order} />
    </div>
  );
}

function LiveStandings({ group, userOrder }: { group: string; userOrder: string[] }) {
  const computed = computeGroupStandings(group, ALL_MATCHES, GROUP_MATCH_RESULTS);
  if (!computed) return null;

  const isFinal = !!computeFinalGroupStandings(group, ALL_MATCHES, GROUP_MATCH_RESULTS);

  return (
    <div className="border-t border-line">
      <div className="flex items-center justify-between px-4 py-2 bg-emerald-500/5">
        <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-400">
          Clasificación {isFinal ? "final real" : "actual"}
        </span>
        {!isFinal && (
          <span className="text-[10px] text-muted">faltan partidos</span>
        )}
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="text-[9px] uppercase tracking-wider text-muted">
            <th className="text-left pl-4 py-1.5 font-medium">Pos</th>
            <th className="text-left py-1.5 font-medium">Equipo</th>
            <th className="text-center py-1.5 font-medium">PJ</th>
            <th className="text-center py-1.5 font-medium">DG</th>
            <th className="text-right pr-4 py-1.5 font-medium">Pts</th>
          </tr>
        </thead>
        <tbody>
          {computed.stats.map((s, i) => {
            const team = getTeam(s.team);
            const userPos = userOrder.indexOf(s.team);
            const userGotIt = isFinal && userPos === i;
            return (
              <tr
                key={s.team}
                className={cn(
                  "border-t border-line/40",
                  userGotIt && "bg-emerald-500/10",
                )}
              >
                <td className="pl-4 py-1.5 font-bold text-muted">{i + 1}°</td>
                <td className="py-1.5">
                  <div className="flex items-center gap-1.5">
                    <TeamBadge team={team} size="sm" showName={false} />
                    <span className="text-xs">{team?.name ?? s.team}</span>
                    {userGotIt && <span className="text-emerald-400 text-[10px]">✓</span>}
                  </div>
                </td>
                <td className="text-center text-muted">{s.played}</td>
                <td className="text-center text-muted tabular-nums">
                  {s.goalsFor - s.goalsAgainst > 0 ? "+" : ""}{s.goalsFor - s.goalsAgainst}
                </td>
                <td className="text-right pr-4 font-bold tabular-nums">{s.points}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
