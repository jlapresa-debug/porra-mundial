"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { AppShell } from "@/components/AppShell";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { usePredictions } from "@/hooks/usePredictions";
import { ALL_MATCHES } from "@/lib/matches";
import { DEFAULT_RULES, totalScore } from "@/lib/scoring";

const ALL_GROUPS = ["A","B","C","D","E","F","G","H","I","J","K","L"];
const KO_MATCHES = ALL_MATCHES.filter((m) => m.stage !== "group");

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { groupPredictions, knockoutPredictions, specials } = usePredictions();

  const stats = useMemo(() => {
    const { total, groupHits, koHits } = totalScore(
      groupPredictions,
      knockoutPredictions,
      specials,
      ALL_MATCHES,
      {},
      {},
      DEFAULT_RULES,
    );
    const groupsDone = ALL_GROUPS.filter((g) => !!groupPredictions[g]).length;
    const koDone = Object.keys(knockoutPredictions).length;
    return { total, groupHits, koHits, groupsDone, koDone };
  }, [groupPredictions, knockoutPredictions, specials]);

  async function handleLogout() {
    await logout();
    router.replace("/");
  }

  return (
    <AppShell>
      <Header title="Perfil" />

      <div className="container-app mt-4 grid gap-5">
        {/* Avatar */}
        <div className="rounded-3xl bg-gradient-brand p-6 text-center shadow-xl shadow-brand/20">
          <div className="w-20 h-20 mx-auto rounded-full overflow-hidden ring-4 ring-white/20 bg-white/10 grid place-items-center mb-3">
            {user?.photoURL ? (
              <Image src={user.photoURL} alt="" width={80} height={80} unoptimized />
            ) : (
              <span className="font-display text-3xl font-bold">
                {(user?.displayName || user?.email || "?").slice(0, 1).toUpperCase()}
              </span>
            )}
          </div>
          <div className="font-display font-bold text-lg">{user?.displayName || "Sin nombre"}</div>
          <div className="text-xs opacity-80">{user?.email}</div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Puntos" value={stats.total} highlight />
          <Stat label="Grupos" value={`${stats.groupsDone}/12`} />
          <Stat label="Elim." value={`${stats.koDone}/32`} />
        </div>

        {/* Reglas */}
        <div className="rounded-2xl bg-bg-card border border-line p-4">
          <h3 className="font-display font-bold text-sm mb-3">Reglas de puntuación</h3>
          <div className="space-y-3">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted font-semibold mb-1.5">
                Clasificación de grupo
              </p>
              <ul className="text-xs text-muted space-y-1">
                <Rule pts={DEFAULT_RULES.groupPosition[0]}>1° puesto exacto</Rule>
                <Rule pts={DEFAULT_RULES.groupPosition[1]}>2° puesto exacto</Rule>
                <Rule pts={DEFAULT_RULES.groupPosition[2]}>3° puesto exacto</Rule>
                <Rule pts={DEFAULT_RULES.groupPosition[3]}>4° puesto exacto</Rule>
              </ul>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted font-semibold mb-1.5">
                Ganador en eliminatorias
              </p>
              <ul className="text-xs text-muted space-y-1">
                <Rule pts={DEFAULT_RULES.knockout.round32}>Dieciseisavos</Rule>
                <Rule pts={DEFAULT_RULES.knockout.round16}>Octavos</Rule>
                <Rule pts={DEFAULT_RULES.knockout.quarter}>Cuartos</Rule>
                <Rule pts={DEFAULT_RULES.knockout.semi}>Semifinales</Rule>
                <Rule pts={DEFAULT_RULES.knockout.final}>Final</Rule>
              </ul>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted font-semibold mb-1.5">
                Apuestas especiales
              </p>
              <ul className="text-xs text-muted space-y-1">
                <Rule pts={DEFAULT_RULES.special.champion}>Campeón</Rule>
                <Rule pts={DEFAULT_RULES.special.topScorer}>Máximo goleador</Rule>
                <Rule pts={DEFAULT_RULES.special.runnerUp}>Finalista</Rule>
                <Rule pts={DEFAULT_RULES.special.bestPlayer}>Mejor jugador</Rule>
              </ul>
            </div>
          </div>
        </div>

        <Button variant="danger" size="lg" fullWidth onClick={handleLogout}>
          Cerrar sesión
        </Button>

        <p className="text-center text-[10px] text-muted mt-2">v0.2.0 · La Porra del Mundial</p>
      </div>
    </AppShell>
  );
}

function Stat({ label, value, highlight }: { label: string; value: number | string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl p-3 text-center ${highlight ? "bg-gradient-brand shadow-lg shadow-brand/20" : "bg-bg-card border border-line"}`}>
      <div className="font-display text-2xl font-bold tabular-nums">{value}</div>
      <div className={`text-[10px] uppercase tracking-wider mt-0.5 ${highlight ? "opacity-80" : "text-muted"}`}>
        {label}
      </div>
    </div>
  );
}

function Rule({ pts, children }: { pts: number; children: React.ReactNode }) {
  return (
    <li className="flex items-center justify-between">
      <span>{children}</span>
      <span className="font-bold text-brand">+{pts}</span>
    </li>
  );
}
