"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Header } from "@/components/Header";
import { GroupStandingCard } from "@/components/GroupStandingCard";
import { KnockoutMatchCard } from "@/components/KnockoutMatchCard";
import { ALL_MATCHES } from "@/lib/matches";
import { TEAMS_BY_GROUP } from "@/lib/teams";
import { usePredictions } from "@/hooks/usePredictions";
import { cn } from "@/lib/cn";
import { isGroupsLocked, isKnockoutLocked } from "@/lib/deadlines";
import type { Match } from "@/lib/types";

const ALL_GROUPS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

type MainTab = "grupos" | "eliminatorias";

const KO_SECTIONS: { stage: Match["stage"]; label: string }[] = [
  { stage: "round32",    label: "Dieciseisavos de final" },
  { stage: "round16",   label: "Octavos de final" },
  { stage: "quarter",   label: "Cuartos de final" },
  { stage: "semi",      label: "Semifinales" },
  { stage: "thirdplace", label: "Tercer puesto" },
  { stage: "final",     label: "FINAL" },
];

export default function MatchesPage() {
  const [mainTab, setMainTab] = useState<MainTab>("grupos");
  const [activeGroup, setActiveGroup] = useState("A");

  const {
    groupPredictions,
    knockoutPredictions,
    saveGroupPrediction,
    saveKnockoutWinner,
  } = usePredictions();

  const groupsLocked = isGroupsLocked();
  const groupsDone = ALL_GROUPS.filter((g) => !!groupPredictions[g]).length;
  const koDone = Object.keys(knockoutPredictions).length;

  // KO matches agrupados por ronda
  const koByStage = useMemo(() => {
    const map = new Map<string, Match[]>();
    for (const m of ALL_MATCHES) {
      if (m.stage === "group") continue;
      const arr = map.get(m.stage) ?? [];
      arr.push(m);
      map.set(m.stage, arr);
    }
    return map;
  }, []);

  const teamsInActiveGroup = TEAMS_BY_GROUP[activeGroup] ?? [];

  return (
    <AppShell>
      <Header
        title="Apuestas"
        subtitle={
          mainTab === "grupos"
            ? `${groupsDone} de 12 grupos completados`
            : `${koDone} de 32 ganadores elegidos`
        }
      />

      {/* Tabs principales */}
      <div className="container-app mt-3">
        <div className="flex gap-1 p-1 bg-bg-card border border-line rounded-2xl">
          {(["grupos", "eliminatorias"] as MainTab[]).map((t) => (
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
              {t === "grupos" ? "Grupos" : "Eliminatorias"}
            </button>
          ))}
        </div>
      </div>

      {/* ── TAB GRUPOS ─────────────────────────────── */}
      {mainTab === "grupos" && (
        <>
          {/* Selector de grupo */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4 pb-2 mt-4">
            {ALL_GROUPS.map((g) => {
              const done = !!groupPredictions[g];
              const active = activeGroup === g;
              return (
                <button
                  key={g}
                  onClick={() => setActiveGroup(g)}
                  className={cn(
                    "shrink-0 w-10 h-10 rounded-full text-sm font-bold transition-all relative",
                    active
                      ? "bg-gradient-brand text-white shadow-md shadow-brand/20"
                      : "bg-bg-card text-muted border border-line hover:text-white",
                  )}
                >
                  {g}
                  {done && !active && (
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-bg" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="container-app mt-3 pb-6 animate-fade-in">
            {groupsLocked && (
              <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-3 text-xs text-amber-300 mb-4">
                🔒 Plazo cerrado — las clasificaciones de grupo ya no se pueden modificar.
              </div>
            )}
            <GroupStandingCard
              key={activeGroup}
              group={activeGroup}
              teams={teamsInActiveGroup}
              savedOrder={groupPredictions[activeGroup]}
              locked={groupsLocked}
              onSave={(order) => saveGroupPrediction(activeGroup, order)}
            />
          </div>
        </>
      )}

      {/* ── TAB ELIMINATORIAS ──────────────────────── */}
      {mainTab === "eliminatorias" && (
        <div className="container-app mt-5 pb-6 grid gap-7 animate-fade-in">
          {KO_SECTIONS.map(({ stage, label }) => {
            const matches = koByStage.get(stage) ?? [];
            if (!matches.length) return null;
            return (
              <section key={stage}>
                <h2 className="text-[11px] uppercase tracking-widest text-muted font-semibold mb-3">
                  {label}
                </h2>
                <div className="grid gap-3">
                  {matches.map((m) => {
                    const locked = isKnockoutLocked(m.kickoff);
                    return (
                      <KnockoutMatchCard
                        key={m.id}
                        match={m}
                        savedWinner={knockoutPredictions[m.id]}
                        locked={locked}
                        onPick={(winner) => saveKnockoutWinner(m.id, winner)}
                      />
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
