"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TeamPicker } from "@/components/TeamPicker";
import { usePredictions } from "@/hooks/usePredictions";
import { DEFAULT_RULES } from "@/lib/scoring";

export default function SpecialsPage() {
  const { specials, saveSpecials } = usePredictions();
  const [champion, setChampion] = useState<string | undefined>();
  const [runnerUp, setRunnerUp] = useState<string | undefined>();
  const [surprise, setSurprise] = useState<string | undefined>();
  const [topScorer, setTopScorer] = useState("");
  const [bestPlayer, setBestPlayer] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setChampion(specials.champion);
    setRunnerUp(specials.runnerUp);
    setSurprise(specials.surprise);
    setTopScorer(specials.topScorer ?? "");
    setBestPlayer(specials.bestPlayer ?? "");
  }, [specials]);

  async function handleSave() {
    setSaving(true);
    try {
      await saveSpecials({ champion, runnerUp, surprise, topScorer, bestPlayer });
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
        subtitle="Aciertos que multiplican tu puntuación"
      />

      <div className="container-app mt-4 grid gap-5">
        <Section
          title="🏆 Campeón"
          points={DEFAULT_RULES.special.champion}
          description="¿Quién levantará la copa?"
        >
          <TeamPicker value={champion} onChange={setChampion} placeholder="Elige campeón" />
        </Section>

        <Section
          title="🥈 Finalista"
          points={DEFAULT_RULES.special.runnerUp}
          description="La otra selección que llega a la final"
        >
          <TeamPicker value={runnerUp} onChange={setRunnerUp} placeholder="Elige subcampeón" />
        </Section>

        <Section
          title="⚽ Máximo goleador"
          points={DEFAULT_RULES.special.topScorer}
          description="Bota de oro del torneo"
        >
          <Input
            value={topScorer}
            onChange={(e) => setTopScorer(e.target.value)}
            placeholder="Nombre del jugador"
          />
        </Section>

        <Section
          title="✨ Mejor jugador"
          points={DEFAULT_RULES.special.bestPlayer}
          description="Balón de oro del Mundial"
        >
          <Input
            value={bestPlayer}
            onChange={(e) => setBestPlayer(e.target.value)}
            placeholder="Nombre del jugador"
          />
        </Section>

        <Section
          title="🌪️ Selección sorpresa"
          points={DEFAULT_RULES.special.surprise}
          description="La que llegue más lejos de lo esperado"
        >
          <TeamPicker value={surprise} onChange={setSurprise} placeholder="Elige tu sorpresa" />
        </Section>

        <div className="pt-2">
          <Button size="lg" fullWidth onClick={handleSave} loading={saving}>
            {saved ? "Guardado ✓" : "Guardar apuestas especiales"}
          </Button>
        </div>
      </div>
    </AppShell>
  );
}

function Section({
  title,
  points,
  description,
  children,
}: {
  title: string;
  points: number;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-bg-card border border-line p-4">
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
