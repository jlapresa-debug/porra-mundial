"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TeamPicker } from "@/components/TeamPicker";
import { usePredictions } from "@/hooks/usePredictions";
import { DEFAULT_RULES } from "@/lib/scoring";
import { isSpecialsLocked, formatDeadlineSpain, SPECIALS_DEADLINE } from "@/lib/deadlines";

export default function SpecialsPage() {
  const { specials, saveSpecials } = usePredictions();
  const [champion, setChampion] = useState<string | undefined>();
  const [runnerUp, setRunnerUp] = useState<string | undefined>();
  const [topScorer, setTopScorer] = useState("");
  const [bestPlayer, setBestPlayer] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const locked = isSpecialsLocked();

  useEffect(() => {
    setChampion(specials.champion);
    setRunnerUp(specials.runnerUp);
    setTopScorer(specials.topScorer ?? "");
    setBestPlayer(specials.bestPlayer ?? "");
  }, [specials]);

  async function handleSave() {
    if (locked) return;
    setSaving(true);
    try {
      await saveSpecials({ champion, runnerUp, topScorer, bestPlayer });
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <Header
        title="Apuestas especiales"
        subtitle={locked
          ? "🔒 Plazo cerrado"
          : `Cierre: ${formatDeadlineSpain(SPECIALS_DEADLINE)}h`}
      />

      <div className="container-app mt-4 grid gap-5">
        {locked && (
          <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-3 text-xs text-amber-300">
            🔒 El plazo ha terminado. Las apuestas especiales están cerradas.
          </div>
        )}

        <Section
          title="🏆 Campeón"
          points={DEFAULT_RULES.special.champion}
          description="¿Quién levantará la copa?"
          locked={locked}
        >
          <TeamPicker
            value={champion}
            onChange={setChampion}
            placeholder="Elige campeón"
            disabled={locked}
          />
        </Section>

        <Section
          title="🥈 Finalista"
          points={DEFAULT_RULES.special.runnerUp}
          description="La otra selección que llega a la final"
          locked={locked}
        >
          <TeamPicker
            value={runnerUp}
            onChange={setRunnerUp}
            placeholder="Elige subcampeón"
            disabled={locked}
          />
        </Section>

        <Section
          title="⚽ Máximo goleador"
          points={DEFAULT_RULES.special.topScorer}
          description="Bota de oro del torneo"
          locked={locked}
        >
          <Input
            value={topScorer}
            onChange={(e) => setTopScorer(e.target.value)}
            placeholder="Nombre del jugador"
            disabled={locked}
          />
        </Section>

        <Section
          title="✨ Mejor jugador"
          points={DEFAULT_RULES.special.bestPlayer}
          description="Balón de oro del Mundial"
          locked={locked}
        >
          <Input
            value={bestPlayer}
            onChange={(e) => setBestPlayer(e.target.value)}
            placeholder="Nombre del jugador"
            disabled={locked}
          />
        </Section>

        {!locked && (
          <div className="pt-2">
            <Button size="lg" fullWidth onClick={handleSave} loading={saving}>
              {saved ? "Guardado ✓" : "Guardar apuestas especiales"}
            </Button>
          </div>
        )}
      </div>
    </AppShell>
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
