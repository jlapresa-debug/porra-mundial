"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AppShell } from "@/components/AppShell";
import { Header } from "@/components/Header";
import { RankingTable, type SortBy } from "@/components/RankingTable";
import { useAuth } from "@/hooks/useAuth";
import { useGroupRanking } from "@/hooks/useGroupRanking";
import type { Group } from "@/lib/types";
import { cn } from "@/lib/cn";

export default function GroupDetailPage() {
  const params = useParams<{ id: string }>();
  const { user } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>("virtual");

  useEffect(() => {
    if (!db) return;
    const unsub = onSnapshot(doc(db, "groups", params.id), (snap) => {
      if (!snap.exists()) return setGroup(null);
      setGroup({ id: snap.id, ...(snap.data() as Omit<Group, "id">) });
    });
    return unsub;
  }, [params.id]);

  const { ranking, loading } = useGroupRanking(group?.memberIds ?? []);

  if (!group) {
    return (
      <AppShell>
        <Header title="Clasificación" />
        <div className="container-app mt-8 text-center text-muted">Cargando…</div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Header
        title={group.name}
        subtitle={`${group.memberIds.length} ${group.memberIds.length === 1 ? "jugador" : "jugadores"}`}
      />

      <div className="container-app mt-4">
        {/* Toggle de orden */}
        <div className="flex gap-1 p-1 bg-bg-card border border-line rounded-2xl">
          <button
            onClick={() => setSortBy("virtual")}
            className={cn(
              "flex-1 h-10 rounded-xl text-sm font-medium transition",
              sortBy === "virtual"
                ? "bg-gradient-brand text-white shadow-md shadow-brand/20"
                : "text-muted hover:text-white",
            )}
          >
            Por virtual
          </button>
          <button
            onClick={() => setSortBy("real")}
            className={cn(
              "flex-1 h-10 rounded-xl text-sm font-medium transition",
              sortBy === "real"
                ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                : "text-muted hover:text-white",
            )}
          >
            Por real
          </button>
        </div>

        <p className="text-[11px] text-muted text-center mt-2 leading-snug">
          <span className="text-emerald-400 font-medium">Real</span>: puntos ya confirmados ·{" "}
          <span className="text-brand font-medium">Virtual</span>: proyección con la clasificación
          actual de cada grupo
        </p>

        <div className="mt-5 animate-fade-in">
          {loading ? (
            <div className="text-center text-muted text-sm py-8">Calculando puntos…</div>
          ) : (
            <RankingTable
              ranking={ranking}
              currentUid={user?.uid}
              groupId={params.id}
              sortBy={sortBy}
            />
          )}
        </div>
      </div>
    </AppShell>
  );
}
