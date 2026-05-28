"use client";

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/Button";
import { useGroups } from "@/hooks/useGroups";

export default function GroupsPage() {
  const { groups, loading } = useGroups();

  return (
    <AppShell>
      <Header title="Tus grupos" subtitle="Juega solo con tus amigos" />

      <div className="container-app mt-4 grid gap-3">
        <div className="grid grid-cols-2 gap-3">
          <Link href="/groups/new">
            <div className="rounded-2xl bg-gradient-brand p-4 h-full shadow-lg shadow-brand/20 active:scale-[0.98] transition">
              <div className="text-2xl mb-2">＋</div>
              <div className="font-display font-bold">Crear grupo</div>
              <div className="text-xs opacity-80">Invita a tus amigos con un código</div>
            </div>
          </Link>
          <Link href="/groups/join">
            <div className="rounded-2xl bg-bg-card border border-line p-4 h-full active:scale-[0.98] transition">
              <div className="text-2xl mb-2">🔗</div>
              <div className="font-display font-bold">Unirme</div>
              <div className="text-xs text-muted">Con código de invitación</div>
            </div>
          </Link>
        </div>

        {loading ? (
          <div className="text-center text-muted text-sm py-12">Cargando...</div>
        ) : groups.length === 0 ? (
          <div className="rounded-2xl bg-bg-card border border-line border-dashed p-8 text-center">
            <div className="text-4xl mb-2">👥</div>
            <p className="font-display font-bold mb-1">Sin grupos aún</p>
            <p className="text-sm text-muted">Crea uno o únete con un código para empezar a picar.</p>
          </div>
        ) : (
          <div className="grid gap-3 mt-2">
            <h2 className="text-xs uppercase tracking-wider text-muted font-semibold px-1">
              Mis grupos
            </h2>
            {groups.map((g) => (
              <Link
                key={g.id}
                href={`/groups/${g.id}`}
                className="rounded-2xl bg-bg-card border border-line p-4 active:scale-[0.99] transition hover:border-brand/40"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-display font-bold text-base">{g.name}</div>
                    <div className="text-xs text-muted mt-0.5">
                      {g.memberIds.length} {g.memberIds.length === 1 ? "miembro" : "miembros"} · Código{" "}
                      <span className="font-mono text-brand">{g.code}</span>
                    </div>
                  </div>
                  <span className="text-muted">›</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-4 rounded-2xl bg-bg-card/50 border border-line border-dashed p-4 text-center">
          <p className="text-xs text-muted">
            Si solo quieres jugar tú, también puedes hacerlo: tus pronósticos y apuestas se guardan aunque no estés en ningún grupo.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
