"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AppShell } from "@/components/AppShell";
import { Header } from "@/components/Header";
import { RankingTable } from "@/components/RankingTable";
import { GroupChat } from "@/components/GroupChat";
import { useAuth } from "@/hooks/useAuth";
import { useGroupRanking } from "@/hooks/useGroupRanking";
import type { Group } from "@/lib/types";
import { cn } from "@/lib/cn";

type Tab = "ranking" | "chat";

export default function GroupDetailPage() {
  const params = useParams<{ id: string }>();
  const { user } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [tab, setTab] = useState<Tab>("ranking");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!db) return;
    const unsub = onSnapshot(doc(db, "groups", params.id), (snap) => {
      if (!snap.exists()) return setGroup(null);
      setGroup({ id: snap.id, ...(snap.data() as Omit<Group, "id">) });
    });
    return unsub;
  }, [params.id]);

  const { ranking, loading } = useGroupRanking(group?.memberIds ?? []);

  function copyCode() {
    if (!group) return;
    navigator.clipboard.writeText(group.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (!group) {
    return (
      <AppShell>
        <Header title="Grupo" back="/groups" />
        <div className="container-app mt-8 text-center text-muted">Cargando o sin acceso...</div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Header
        title={group.name}
        subtitle={`${group.memberIds.length} ${group.memberIds.length === 1 ? "miembro" : "miembros"}`}
        back="/groups"
      />

      <div className="container-app mt-4">
        <button
          onClick={copyCode}
          className="w-full rounded-2xl bg-gradient-brand p-4 text-left shadow-lg shadow-brand/20 active:scale-[0.99] transition"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-wider opacity-80">Código de invitación</div>
              <div className="font-mono font-bold text-2xl tracking-[0.3em] mt-1">{group.code}</div>
            </div>
            <div className="text-xs opacity-90">{copied ? "✓ Copiado" : "Copiar"}</div>
          </div>
        </button>

        <div className="mt-5 flex gap-1 p-1 bg-bg-card border border-line rounded-2xl">
          {(["ranking", "chat"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "flex-1 h-10 rounded-xl text-sm font-medium transition",
                tab === t
                  ? "bg-gradient-brand text-white shadow-md shadow-brand/20"
                  : "text-muted hover:text-white",
              )}
            >
              {t === "ranking" ? "Clasificación" : "Chat"}
            </button>
          ))}
        </div>

        <div className="mt-5 animate-fade-in">
          {tab === "ranking" ? (
            loading ? (
              <div className="text-center text-muted text-sm py-8">Calculando puntos...</div>
            ) : (
              <RankingTable ranking={ranking} currentUid={user?.uid} groupId={params.id} />
            )
          ) : (
            <GroupChat groupId={group.id} />
          )}
        </div>
      </div>
    </AppShell>
  );
}
