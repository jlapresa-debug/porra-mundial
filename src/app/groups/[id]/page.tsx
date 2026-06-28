"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AppShell } from "@/components/AppShell";
import { Header } from "@/components/Header";
import { RankingTable } from "@/components/RankingTable";
import { useAuth } from "@/hooks/useAuth";
import { useGroupRanking } from "@/hooks/useGroupRanking";
import type { Group } from "@/lib/types";

export default function GroupDetailPage() {
  const params = useParams<{ id: string }>();
  const { user } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);

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

      <div className="container-app mt-5">
        {loading ? (
          <div className="text-center text-muted text-sm py-8">Calculando puntos…</div>
        ) : (
          <RankingTable
            ranking={ranking}
            currentUid={user?.uid}
            groupId={params.id}
          />
        )}
      </div>
    </AppShell>
  );
}
