"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { GroupMemberScore } from "@/lib/types";
import { cn } from "@/lib/cn";

export type SortBy = "virtual" | "real";

interface Props {
  ranking: GroupMemberScore[];
  currentUid?: string | null;
  groupId?: string;
  sortBy?: SortBy;
}

const medals = ["🥇", "🥈", "🥉"];

export function RankingTable({ ranking, currentUid, groupId, sortBy = "virtual" }: Props) {
  const ordered = useMemo(() => {
    return [...ranking].sort((a, b) => {
      if (sortBy === "real") {
        return b.points - a.points || b.virtualPoints - a.virtualPoints || b.groupHits - a.groupHits;
      }
      return b.virtualPoints - a.virtualPoints || b.points - a.points || b.groupHits - a.groupHits;
    });
  }, [ranking, sortBy]);

  if (ordered.length === 0) {
    return (
      <div className="rounded-2xl bg-bg-card border border-line p-6 text-center text-sm text-muted">
        Aún no hay puntuaciones. Empieza a apostar para aparecer en la clasificación.
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-bg-card border border-line overflow-hidden">
      {/* Cabecera de columnas */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-line bg-bg-elevated/40">
        <div className="w-7 shrink-0" />
        <div className="w-9 shrink-0" />
        <div className="flex-1 text-[10px] uppercase tracking-wider text-muted font-semibold">
          Jugador
        </div>
        <div className={cn(
          "w-12 text-right text-[10px] uppercase tracking-wider font-semibold",
          sortBy === "real" ? "text-emerald-400" : "text-muted",
        )}>
          Real
        </div>
        <div className={cn(
          "w-12 text-right text-[10px] uppercase tracking-wider font-semibold",
          sortBy === "virtual" ? "text-brand" : "text-muted",
        )}>
          Virtual
        </div>
        {groupId && <div className="w-3 shrink-0" />}
      </div>

      <div className="divide-y divide-line">
        {ordered.map((m, i) => {
          const isYou = m.uid === currentUid;
          const projection = m.virtualPoints - m.points;
          const row = (
            <div
              className={cn(
                "flex items-center gap-3 px-4 py-3",
                isYou && "bg-brand/5",
                i === 0 && "bg-gradient-card",
                groupId && "active:bg-bg-hover",
              )}
            >
              <div className="w-7 text-center font-display font-bold text-sm shrink-0">
                {i < 3 ? medals[i] : <span className="text-muted">{i + 1}</span>}
              </div>
              <div className="w-9 h-9 rounded-full overflow-hidden bg-bg-elevated ring-2 ring-white/10 shrink-0">
                {m.photoURL ? (
                  <Image src={m.photoURL} alt={m.displayName} width={36} height={36} unoptimized />
                ) : (
                  <div className="w-full h-full grid place-items-center text-xs font-bold">
                    {m.displayName.slice(0, 1).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">
                  {m.displayName}
                  {isYou && <span className="text-[10px] text-brand ml-1">(tú)</span>}
                </div>
                <div className="text-[10px] text-muted">
                  {m.groupHits} pos. grupo · {m.koHits} elim.
                </div>
              </div>
              <div className={cn(
                "w-12 text-right font-display font-bold tabular-nums",
                sortBy === "real" ? "text-emerald-400 text-lg" : "text-white/80 text-sm",
              )}>
                {m.points}
              </div>
              <div className={cn(
                "w-12 text-right font-display font-bold tabular-nums",
                sortBy === "virtual" ? "text-brand text-lg" : "text-white/80 text-sm",
              )}>
                {m.virtualPoints}
                {projection > 0 && (
                  <span className="block text-[9px] font-normal text-emerald-400/80 tabular-nums">
                    +{projection}
                  </span>
                )}
              </div>
              {groupId && (
                <span className="w-3 text-right text-muted text-xs shrink-0">
                  {!isYou && "›"}
                </span>
              )}
            </div>
          );

          if (groupId && !isYou) {
            return (
              <Link
                key={m.uid}
                href={`/groups/${groupId}/predicciones/${m.uid}`}
                className="block transition-colors hover:bg-bg-hover"
              >
                {row}
              </Link>
            );
          }
          return <div key={m.uid}>{row}</div>;
        })}
      </div>
    </div>
  );
}
