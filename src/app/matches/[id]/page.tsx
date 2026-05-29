"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/Button";
import { PredictionInput } from "@/components/PredictionInput";
import { TeamBadge } from "@/components/TeamBadge";
import { getMatch, stageLabel } from "@/lib/matches";
import { getTeam } from "@/lib/teams";
import { usePredictions } from "@/hooks/usePredictions";

export default function MatchDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const match = getMatch(params.id);
  const { predictions, savePrediction } = usePredictions();
  const existing = match ? predictions[match.id] : undefined;

  const [home, setHome] = useState(0);
  const [away, setAway] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (existing) {
      setHome(existing.home);
      setAway(existing.away);
    }
  }, [existing]);

  if (!match) {
    return (
      <AppShell>
        <Header title="Partido no encontrado" back="/matches" />
      </AppShell>
    );
  }

  const homeTeam = getTeam(match.home);
  const awayTeam = getTeam(match.away);
  const kickoff = new Date(match.kickoff);
  const locked = kickoff.getTime() < Date.now();
  const teamsTBD = !homeTeam || !awayTeam;
  const homeLabel = homeTeam?.name ?? match.homePlaceholder ?? "Local";
  const awayLabel = awayTeam?.name ?? match.awayPlaceholder ?? "Visitante";

  async function handleSave() {
    if (!match) return;
    setSaving(true);
    try {
      await savePrediction(match.id, home, away);
      setSaved(true);
      setTimeout(() => router.push("/matches"), 800);
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <Header
        title={match.stage === "group" ? `Grupo ${match.group} · J${match.matchday}` : stageLabel(match.stage)}
        subtitle={kickoff.toLocaleString("es-ES", {
          weekday: "long",
          day: "2-digit",
          month: "long",
          hour: "2-digit",
          minute: "2-digit",
        })}
        back="/matches"
      />

      <div className="container-app mt-4">
        <div className="rounded-3xl bg-bg-card border border-line p-6 bg-gradient-card">
          <div className="grid grid-cols-3 items-center gap-2">
            <div className="flex flex-col items-center gap-2">
              <TeamBadge team={homeTeam} size="lg" align="center" showName={false} />
              <span className="text-xs font-medium text-center">{homeLabel}</span>
            </div>
            <div className="text-center">
              <div className="font-display text-xs text-muted mb-1">PRONÓSTICO</div>
              <div className="font-display text-2xl font-bold tabular-nums">
                {teamsTBD ? "— – —" : `${home} – ${away}`}
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <TeamBadge team={awayTeam} size="lg" align="center" showName={false} />
              <span className="text-xs font-medium text-center">{awayLabel}</span>
            </div>
          </div>

          {teamsTBD ? (
            <div className="mt-6 text-center text-sm text-muted">
              Los equipos se conocerán al avanzar el torneo. Vuelve cuando se decidan los emparejamientos.
            </div>
          ) : !locked ? (
            <div className="grid grid-cols-2 gap-6 mt-8">
              <PredictionInput label={homeLabel} value={home} onChange={setHome} />
              <PredictionInput label={awayLabel} value={away} onChange={setAway} />
            </div>
          ) : (
            <div className="mt-6 text-center text-sm text-amber-400">
              🔒 El partido ya ha empezado, las apuestas están cerradas.
            </div>
          )}
        </div>

        <p className="text-center text-xs text-muted mt-4">
          {match.venue}
          {match.city ? ` · ${match.city}` : ""}
        </p>

        {!teamsTBD && !locked && (
          <div className="mt-8">
            <Button size="lg" fullWidth loading={saving} onClick={handleSave}>
              {saved ? "Guardado ✓" : existing ? "Actualizar pronóstico" : "Guardar pronóstico"}
            </Button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
