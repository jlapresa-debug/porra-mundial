"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { GroupMemberScore } from "@/lib/types";
import { cn } from "@/lib/cn";

interface Props {
  ranking: GroupMemberScore[];
  currentUid?: string | null;
  groupId?: string;
}

const medals = ["🥇", "🥈", "🥉"];

export function RankingTable({ ranking, currentUid, groupId }: Props) {
  const ordered = useMemo(
    () =>
      [...ranking].sort(
        (a, b) =>
          b.points - a.points ||
          b.groupHits - a.groupHits ||
          b.koHits - a.koHits,
      ),
    [ranking],
  );

  if (ordered.length === 0) {
    return (
      <div className="rounded-2xl bg-bg-card border border-line p-6 text-center text-sm text-muted">
        Aún no hay puntuaciones.
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-bg-card border border-line overflow-hidden divide-y divide-line">
      {ordered.map((m, i) => {
        const isYou = m.uid === currentUid;
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
            <div className="font-display font-bold text-lg tabular-nums">
              {m.points}
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
  );
}
