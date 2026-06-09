"use client";

import { useState, useEffect } from "react";
import type { Team } from "@/lib/types";
import { getTeam } from "@/lib/teams";
import { TeamBadge } from "./TeamBadge";
import { Button } from "./ui/Button";
import { cn } from "@/lib/cn";

interface Props {
  group: string;      // "A"
  teams: Team[];      // 4 equipos del grupo (orden inicial)
  savedOrder?: string[]; // códigos guardados en Firestore (si ya hay apuesta)
  locked: boolean;    // el torneo ha empezado
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
    </div>
  );
}
