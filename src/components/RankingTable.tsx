import Image from "next/image";
import { GroupMemberScore } from "@/lib/types";
import { cn } from "@/lib/cn";

interface Props {
  ranking: GroupMemberScore[];
  currentUid?: string | null;
}

const medals = ["🥇", "🥈", "🥉"];

export function RankingTable({ ranking, currentUid }: Props) {
  if (ranking.length === 0) {
    return (
      <div className="rounded-2xl bg-bg-card border border-line p-6 text-center text-sm text-muted">
        Aún no hay puntuaciones. Empieza a apostar para aparecer en la clasificación.
      </div>
    );
  }
  return (
    <div className="rounded-2xl bg-bg-card border border-line overflow-hidden divide-y divide-line">
      {ranking.map((m, i) => {
        const isYou = m.uid === currentUid;
        return (
          <div
            key={m.uid}
            className={cn(
              "flex items-center gap-3 px-4 py-3",
              isYou && "bg-brand/5",
              i === 0 && "bg-gradient-card",
            )}
          >
            <div className="w-7 text-center font-display font-bold text-sm">
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
                {m.displayName} {isYou && <span className="text-[10px] text-brand ml-1">(tú)</span>}
              </div>
              <div className="text-[10px] text-muted">
                {m.groupHits} pos. grupo · {m.koHits} eliminatorias
              </div>
            </div>
            <div className="font-display font-bold text-lg tabular-nums">{m.points}</div>
          </div>
        );
      })}
    </div>
  );
}
