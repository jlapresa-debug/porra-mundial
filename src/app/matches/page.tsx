"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Header } from "@/components/Header";
import { KnockoutMatchCard } from "@/components/KnockoutMatchCard";
import { ALL_MATCHES } from "@/lib/matches";
import { usePredictions } from "@/hooks/usePredictions";
import { cn } from "@/lib/cn";
import { isMatchLocked } from "@/lib/deadlines";
import type { Match } from "@/lib/types";

type MainTab = "liga" | "eliminatorias";

const KO_SECTIONS: { stage: Match["stage"]; short: string; label: string }[] = [
  { stage: "playoff", short: "Play-off", label: "Play-off" },
  { stage: "round16", short: "Octavos", label: "Octavos de final" },
  { stage: "quarter", short: "Cuartos", label: "Cuartos de final" },
  { stage: "semi",    short: "Semis",   label: "Semifinales" },
  { stage: "final",   short: "Final",  label: "FINAL" },
];

export default function MatchesPage() {
  const [mainTab, setMainTab] = useState<MainTab>("liga");
  const [activeMatchday, setActiveMatchday] = useState(1);
  const [activeStage, setActiveStage] = useState<Match["stage"]>("playoff");

  const { matchPredictions, saveMatchPick } = usePredictions();

  const leagueMatches = useMemo(
    () => ALL_MATCHES.filter((m) => m.stage === "league"),
    [],
  );
  const leagueByMatchday = useMemo(() => {
    const map = new Map<number, Match[]>();
    for (const m of leagueMatches) {
      const md = m.matchday ?? 0;
      const arr = map.get(md) ?? [];
      arr.push(m);
      map.set(md, arr);
    }
    return map;
  }, [leagueMatches]);

  const koByStage = useMemo(() => {
    const map = new Map<string, Match[]>();
    for (const m of ALL_MATCHES) {
      if (m.stage === "league") continue;
      const arr = map.get(m.stage) ?? [];
      arr.push(m);
      map.set(m.stage, arr);
    }
    return map;
  }, []);

  const leagueDone = leagueMatches.filter((m) => !!matchPredictions[m.id]).length;
  const koTotal = ALL_MATCHES.filter((m) => m.stage !== "league").length;
  const koDone = ALL_MATCHES.filter((m) => m.stage !== "league" && !!matchPredictions[m.id]).length;

  const matchdayMatches = leagueByMatchday.get(activeMatchday) ?? [];
  const matchdayDone = matchdayMatches.filter((m) => !!matchPredictions[m.id]).length;

  return (
    <AppShell>
      <Header
        title="Apuestas"
        subtitle={
          mainTab === "liga"
            ? `${leagueDone} de 144 partidos de liga apostados`
            : `${koDone} de ${koTotal} eliminatorias apostadas`
        }
      />

      {/* Tabs principales */}
      <div className="container-app mt-3">
        <div className="flex gap-1 p-1 bg-bg-card border border-line rounded-2xl">
          {(["liga", "eliminatorias"] as MainTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setMainTab(t)}
              className={cn(
                "flex-1 h-10 rounded-xl text-sm font-medium transition",
                mainTab === t
                  ? "bg-gradient-brand text-white shadow-md shadow-brand/20"
                  : "text-muted hover:text-white",
              )}
            >
              {t === "liga" ? "Fase de Liga" : "Eliminatorias"}
            </button>
          ))}
        </div>
      </div>

      {/* ── TAB FASE DE LIGA ───────────────────────── */}
      {mainTab === "liga" && (
        <>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4 pb-2 mt-4">
            {Array.from({ length: 8 }, (_, i) => i + 1).map((md) => {
              const matches = leagueByMatchday.get(md) ?? [];
              const done = matches.filter((m) => !!matchPredictions[m.id]).length;
              const active = activeMatchday === md;
              return (
                <button
                  key={md}
                  onClick={() => setActiveMatchday(md)}
                  className={cn(
                    "shrink-0 px-3.5 h-10 rounded-full text-xs font-bold transition-all relative",
                    active
                      ? "bg-gradient-brand text-white shadow-md shadow-brand/20"
                      : "bg-bg-card text-muted border border-line hover:text-white",
                  )}
                >
                  J{md}
                  {done > 0 && (
                    <span className={cn(
                      "ml-1 text-[10px] tabular-nums",
                      active ? "opacity-80" : "text-brand",
                    )}>
                      {done}/{matches.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="container-app mt-3 pb-6 grid gap-3 animate-fade-in">
            <h2 className="text-[11px] uppercase tracking-widest text-muted font-semibold">
              Jornada {activeMatchday} · {matchdayDone}/{matchdayMatches.length} apostados
            </h2>
            {matchdayMatches.map((m) => (
              <KnockoutMatchCard
                key={m.id}
                match={m}
                savedPick={matchPredictions[m.id]}
                locked={isMatchLocked(m.kickoff)}
                onPick={(pick) => saveMatchPick(m.id, pick)}
              />
            ))}
          </div>
        </>
      )}

      {/* ── TAB ELIMINATORIAS ──────────────────────── */}
      {mainTab === "eliminatorias" && (
        <>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4 pb-2 mt-4">
            {KO_SECTIONS.map(({ stage, short }) => {
              const matches = koByStage.get(stage) ?? [];
              const done = matches.filter((m) => !!matchPredictions[m.id]).length;
              const active = activeStage === stage;
              return (
                <button
                  key={stage}
                  onClick={() => setActiveStage(stage)}
                  className={cn(
                    "shrink-0 px-3.5 h-9 rounded-full text-xs font-medium transition whitespace-nowrap relative",
                    active
                      ? "bg-gradient-brand text-white shadow-md shadow-brand/20"
                      : "bg-bg-card text-muted border border-line hover:text-white",
                  )}
                >
                  {short}
                  {matches.length > 0 && done > 0 && (
                    <span className={cn(
                      "ml-1.5 text-[10px] tabular-nums",
                      active ? "opacity-80" : "text-brand",
                    )}>
                      {done}/{matches.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="container-app mt-3 pb-6 grid gap-3 animate-fade-in">
            <h2 className="text-[11px] uppercase tracking-widest text-muted font-semibold">
              {KO_SECTIONS.find((s) => s.stage === activeStage)?.label}
            </h2>
            {(koByStage.get(activeStage) ?? []).length === 0 ? (
              <div className="rounded-2xl bg-bg-card border border-line border-dashed p-6 text-center text-sm text-muted">
                Esta ronda aún no se ha sorteado. La Champions League sortea cada
                eliminatoria justo antes de jugarse — en cuanto se conozcan los
                emparejamientos, aparecerán aquí.
              </div>
            ) : (
              (koByStage.get(activeStage) ?? []).map((m) => (
                <KnockoutMatchCard
                  key={m.id}
                  match={m}
                  savedPick={matchPredictions[m.id]}
                  locked={isMatchLocked(m.kickoff)}
                  onPick={(pick) => saveMatchPick(m.id, pick)}
                />
              ))
            )}
          </div>
        </>
      )}
    </AppShell>
  );
}
