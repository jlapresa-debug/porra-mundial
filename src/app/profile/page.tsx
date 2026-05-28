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

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { predictions, specials } = usePredictions();

  const stats = useMemo(() => {
    const totals = totalScore(predictions, specials, ALL_MATCHES, {}, DEFAULT_RULES);
    return {
      ...totals,
      done: Object.keys(predictions).length,
      pending: ALL_MATCHES.length - Object.keys(predictions).length,
    };
  }, [predictions, specials]);

  async function handleLogout() {
    await logout();
    router.replace("/");
  }

  return (
    <AppShell>
      <Header title="Perfil" />

      <div className="container-app mt-4 grid gap-5">
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

        <div className="grid grid-cols-3 gap-3">
          <Stat label="Puntos" value={stats.total} highlight />
          <Stat label="Apostados" value={stats.done} />
          <Stat label="Pendientes" value={stats.pending} />
        </div>

        <div className="rounded-2xl bg-bg-card border border-line p-4">
          <h3 className="font-display font-bold text-sm mb-2">Reglas de puntuación</h3>
          <ul className="text-xs text-muted space-y-1.5">
            <Rule pts={DEFAULT_RULES.exact}>Resultado exacto</Rule>
            <Rule pts={DEFAULT_RULES.signAndDiff}>Signo y diferencia de goles</Rule>
            <Rule pts={DEFAULT_RULES.sign}>Solo signo (ganador/empate)</Rule>
            <Rule pts={DEFAULT_RULES.goalsOne}>Aciertas goles de un equipo</Rule>
          </ul>
        </div>

        <Button variant="danger" size="lg" fullWidth onClick={handleLogout}>
          Cerrar sesión
        </Button>

        <p className="text-center text-[10px] text-muted mt-2">v0.1.0 · La Porra del Mundial</p>
      </div>
    </AppShell>
  );
}

function Stat({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div
      className={`rounded-2xl p-3 text-center ${
        highlight ? "bg-gradient-brand shadow-lg shadow-brand/20" : "bg-bg-card border border-line"
      }`}
    >
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
