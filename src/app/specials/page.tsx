"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TeamPicker } from "@/components/TeamPicker";
import { TeamBadge } from "@/components/TeamBadge";
import { ExpressBetCard } from "@/components/ExpressBetCard";
import { usePredictions } from "@/hooks/usePredictions";
import { DEFAULT_RULES } from "@/lib/scoring";
import { isSpecialsLocked, formatDeadlineSpain, SPECIALS_DEADLINE } from "@/lib/deadlines";
import { EXPRESS_BETS } from "@/lib/express";
import { TEAMS } from "@/lib/teams";
import { cn } from "@/lib/cn";

type Tab = "generales" | "fase1" | "express";

export default function SpecialsPage() {
  const [tab, setTab] = useState<Tab>("generales");
  const locked = isSpecialsLocked();

  return (
    <AppShell>
      <Header title="Apuestas especiales" />

      <div className="container-app mt-3">
        <div className="flex gap-1 p-1 bg-bg-card border border-line rounded-2xl">
          {(["generales", "fase1", "express"] as Tab[]).map((t) => (
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
              {t === "generales" ? "Generales" : t === "fase1" ? "Fase 1" : "Express"}
            </button>
          ))}
        </div>
      </div>

      <div className="container-app mt-4 pb-6">
        {tab === "generales" && <GeneralesTab locked={locked} />}
        {tab === "fase1" && <FaseUnoTab locked={locked} />}
        {tab === "express" && <ExpressTab />}
      </div>
    </AppShell>
  );
}

// ─────────────────────────── GENERALES ───────────────────────────

function GeneralesTab({ locked }: { locked: boolean }) {
  const { specials, saveSpecials } = usePredictions();
  const [champion, setChampion] = useState<string | undefined>();
  const [runnerUp, setRunnerUp] = useState<string | undefined>();
  const [topScorer, setTopScorer] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setChampion(specials.champion);
    setRunnerUp(specials.runnerUp);
    setTopScorer(specials.topScorer ?? "");
  }, [specials]);

  async function handleSave() {
    if (locked) return;
    setSaving(true);
    try {
      await saveSpecials({ champion, runnerUp, topScorer });
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-5 animate-fade-in">
      <p className="text-[11px] text-muted -mt-1">
        {locked ? "🔒 Plazo cerrado" : `Cierre: ${formatDeadlineSpain(SPECIALS_DEADLINE)}h`}
      </p>

      {locked && (
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-3 text-xs text-amber-300">
          🔒 El plazo ha terminado. Las apuestas generales están cerradas.
        </div>
      )}

      <Section title="🏆 Campeón" points={DEFAULT_RULES.special.champion} description="¿Quién levantará la copa?" locked={locked}>
        <TeamPicker value={champion} onChange={setChampion} placeholder="Elige campeón" disabled={locked} />
      </Section>

      <Section title="🥈 Finalista" points={DEFAULT_RULES.special.runnerUp} description="El otro equipo que llega a la final" locked={locked}>
        <TeamPicker value={runnerUp} onChange={setRunnerUp} placeholder="Elige subcampeón" disabled={locked} />
      </Section>

      <Section title="⚽ Máximo goleador" points={DEFAULT_RULES.special.topScorer} description="Bota de oro de la Champions" locked={locked}>
        <Input
          value={topScorer}
          onChange={(e) => setTopScorer(e.target.value)}
          placeholder="Nombre del jugador"
          disabled={locked}
        />
      </Section>

      {!locked && (
        <div className="pt-2">
          <Button size="lg" fullWidth onClick={handleSave} loading={saving}>
            {saved ? "Guardado ✓" : "Guardar apuestas generales"}
          </Button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────── FASE 1 (TOP 8) ───────────────────────────

function FaseUnoTab({ locked }: { locked: boolean }) {
  const { specials, saveSpecials } = usePredictions();
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSelected(specials.top8 ?? []);
  }, [specials]);

  function toggle(code: string) {
    if (locked) return;
    setSelected((prev) => {
      if (prev.includes(code)) return prev.filter((c) => c !== code);
      if (prev.length >= 8) return prev;
      return [...prev, code];
    });
  }

  async function handleSave() {
    if (locked || selected.length !== 8) return;
    setSaving(true);
    try {
      await saveSpecials({ top8: selected });
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } finally {
      setSaving(false);
    }
  }

  const alreadySaved = (specials.top8?.length ?? 0) === 8 &&
    selected.length === 8 &&
    selected.every((c) => specials.top8!.includes(c));

  return (
    <div className="grid gap-4 animate-fade-in">
      <div>
        <p className="text-sm text-muted leading-relaxed">
          Elige los <strong className="text-white">8 equipos</strong> que crees que acabarán clasificados
          entre los 8 primeros de la fase de liga (octavos directos). El orden no importa.
        </p>
        <p className="text-[11px] text-muted mt-1">
          {locked ? "🔒 Plazo cerrado" : `Cierre: ${formatDeadlineSpain(SPECIALS_DEADLINE)}h · antes del primer partido`}
        </p>
      </div>

      {locked && (
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-3 text-xs text-amber-300">
          🔒 El plazo ha terminado. Esta apuesta está cerrada.
        </div>
      )}

      <div className="flex items-center justify-between rounded-2xl bg-bg-card border border-line px-4 py-3">
        <span className="text-sm font-medium">Seleccionados</span>
        <span className={cn(
          "font-display font-bold text-lg tabular-nums",
          selected.length === 8 ? "text-brand" : "text-muted",
        )}>
          {selected.length}/8
        </span>
      </div>

      <div className="rounded-2xl bg-bg-card border border-line overflow-hidden divide-y divide-line">
        {TEAMS.map((team) => {
          const isSelected = selected.includes(team.code);
          const disableUnselected = !isSelected && selected.length >= 8;
          return (
            <button
              key={team.code}
              type="button"
              onClick={() => toggle(team.code)}
              disabled={locked || disableUnselected}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
                isSelected && "bg-brand/10",
                !locked && !disableUnselected && "hover:bg-bg-hover active:scale-[0.99]",
                (locked || disableUnselected) && !isSelected && "opacity-40",
              )}
            >
              <TeamBadge team={team} size="sm" showName={false} />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{team.name}</div>
                <div className="text-[10px] text-muted">{team.country}</div>
              </div>
              <div className={cn(
                "w-5 h-5 rounded-full border-2 shrink-0 grid place-items-center",
                isSelected ? "bg-brand border-brand" : "border-line",
              )}>
                {isSelected && <span className="text-white text-[10px] font-bold">✓</span>}
              </div>
            </button>
          );
        })}
      </div>

      {!locked && (
        <Button
          size="lg"
          fullWidth
          onClick={handleSave}
          loading={saving}
          disabled={selected.length !== 8 || alreadySaved}
        >
          {saved
            ? "Guardado ✓"
            : alreadySaved
              ? "Top 8 guardado"
              : selected.length < 8
                ? `Elige ${8 - selected.length} más`
                : "Guardar top 8"}
        </Button>
      )}
    </div>
  );
}

// ─────────────────────────── EXPRESS ───────────────────────────

function ExpressTab() {
  const { expressPredictions, saveExpressPrediction } = usePredictions();

  if (EXPRESS_BETS.length === 0) {
    return (
      <div className="rounded-2xl bg-bg-card border border-line border-dashed p-8 text-center animate-fade-in">
        <div className="text-3xl mb-2">⚡</div>
        <p className="font-display font-bold mb-1">Sin apuestas Express por ahora</p>
        <p className="text-sm text-muted">
          Aparecerán aquí apuestas puntuales para partidos concretos según se acerque cada fecha destacada.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 animate-fade-in">
      {EXPRESS_BETS.map((bet) => (
        <ExpressBetCard
          key={bet.id}
          bet={bet}
          saved={expressPredictions[bet.id]}
          onSave={(data) => saveExpressPrediction(bet.id, data)}
        />
      ))}
    </div>
  );
}

function Section({
  title,
  points,
  description,
  locked,
  children,
}: {
  title: string;
  points: number;
  description: string;
  locked: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-2xl bg-bg-card border border-line p-4 ${locked ? "opacity-60" : ""}`}>
      <div className="flex items-start justify-between mb-1">
        <h3 className="font-display font-bold text-base">{title}</h3>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand/20 text-brand">
          +{points} pts
        </span>
      </div>
      <p className="text-xs text-muted mb-3">{description}</p>
      {children}
    </div>
  );
}
