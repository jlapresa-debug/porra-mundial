"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { AppShell } from "@/components/AppShell";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { usePredictions } from "@/hooks/usePredictions";
import { DEFAULT_RULES, totalScore } from "@/lib/scoring";
import {
  GROUP_DEADLINE,
  isGroupsLocked,
  isKnockoutLocked,
  formatDeadlineSpain,
} from "@/lib/deadlines";
import { EXPRESS_BETS, EXPRESS_OUTCOMES, isExpressLocked } from "@/lib/express";
import { ALL_MATCHES } from "@/lib/matches";

const ALL_GROUPS = ["A","B","C","D","E","F","G","H","I","J","K","L"];
const KO_MATCHES = ALL_MATCHES.filter((m) => m.stage !== "group");

// Próximo cierre de eliminatorias (primer partido KO cuyo plazo aún no ha pasado)
function nextKODeadlineLabel(): string | null {
  const next = KO_MATCHES.find((m) => !isKnockoutLocked(m.kickoff));
  if (!next) return null;
  const d = new Date(new Date(next.kickoff).getTime() - 3_600_000);
  return formatDeadlineSpain(d);
}

// Próxima apuesta Express con plazo abierto
function nextExpressDeadlineLabel(): string | null {
  const next = EXPRESS_BETS.find((b) => !isExpressLocked(b));
  if (!next) return null;
  return `${next.title} · ${formatDeadlineSpain(new Date(next.deadline))}`;
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { groupPredictions, knockoutPredictions, specials, expressPredictions } = usePredictions();

  const stats = useMemo(() => {
    const { total, groupHits, koHits } = totalScore(
      groupPredictions,
      knockoutPredictions,
      specials,
      ALL_MATCHES,
      {},
      {},
      DEFAULT_RULES,
      expressPredictions,
      EXPRESS_OUTCOMES,
    );
    const groupsDone = ALL_GROUPS.filter((g) => !!groupPredictions[g]).length;
    const koDone = Object.keys(knockoutPredictions).length;
    return { total, groupHits, koHits, groupsDone, koDone };
  }, [groupPredictions, knockoutPredictions, specials, expressPredictions]);

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
            {EXPRESS_BETS.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted font-semibold mb-1.5">
                  Apuestas express
                </p>
                <ul className="text-xs text-muted space-y-1">
                  <Rule pts={2}>Resultado del equipo (ganar/empatar/perder)</Rule>
                  <Rule pts={4}>Resultado exacto del partido</Rule>
                  <Rule pts={2}>Por cada goleador acertado</Rule>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Calendario de apuestas */}
        <div className="rounded-2xl bg-bg-card border border-line p-4">
          <h3 className="font-display font-bold text-sm mb-3">Calendario de apuestas</h3>
          <div className="space-y-3">
            <DeadlineRow
              icon="🗓"
              label="Grupos y apuestas especiales"
              deadline={formatDeadlineSpain(GROUP_DEADLINE)}
              locked={isGroupsLocked()}
            />
            <DeadlineRow
              icon="⚡"
              label="Eliminatorias"
              deadline={nextKODeadlineLabel() ?? "Todos los partidos cerrados"}
              sublabel="Cierre 1h antes de cada partido"
              locked={false}
            />
            <DeadlineRow
              icon="✨"
              label="Apuestas Express"
              deadline={nextExpressDeadlineLabel() ?? "No hay apuestas express abiertas"}
              sublabel="Plazo variable por apuesta"
              locked={EXPRESS_BETS.length > 0 && EXPRESS_BETS.every(isExpressLocked)}
            />
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

function DeadlineRow({
  icon,
  label,
  deadline,
  sublabel,
  locked,
}: {
  icon: string;
  label: string;
  deadline: string;
  sublabel?: string;
  locked: boolean;
}) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-line last:border-0">
      <span className="text-base mt-0.5">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium">{label}</div>
        {sublabel && <div className="text-[10px] text-muted mt-0.5">{sublabel}</div>}
        <div className="text-[11px] text-muted mt-0.5">{deadline}h</div>
      </div>
      <span
        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 mt-0.5 ${
          locked
            ? "bg-amber-500/10 text-amber-400"
            : "bg-emerald-500/10 text-emerald-400"
        }`}
      >
        {locked ? "🔒 Cerrado" : "● Abierto"}
      </span>
    </div>
  );
}
