"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Header } from "@/components/Header";
import { MatchCard } from "@/components/MatchCard";
import { matchesByMatchday } from "@/lib/matches";
import { usePredictions } from "@/hooks/usePredictions";
import { cn } from "@/lib/cn";

export default function MatchesPage() {
  const groups = useMemo(() => matchesByMatchday(), []);
  const { predictions } = usePredictions();
  const [activeKey, setActiveKey] = useState(groups[0]?.key ?? "");

  const active = groups.find((g) => g.key === activeKey) ?? groups[0];
  const totalApostados = Object.keys(predictions).length;

  return (
    <AppShell>
      <Header
        title="Partidos"
        subtitle={`${totalApostados} pronósticos · Mundial 2026`}
      />

      <div className="container-app mt-2">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-3">
          {groups.map((g) => {
            const isActive = g.key === active?.key;
            return (
              <button
                key={g.key}
                onClick={() => setActiveKey(g.key)}
                className={cn(
                  "shrink-0 px-3.5 h-9 rounded-full text-xs font-medium transition whitespace-nowrap",
                  isActive
                    ? "bg-gradient-brand text-white shadow-md shadow-brand/20"
                    : "bg-bg-card text-muted border border-line hover:text-white",
                )}
              >
                {g.label}
              </button>
            );
          })}
        </div>

        <div className="grid gap-3 mt-2 animate-fade-in">
          {active?.matches.map((m) => (
            <MatchCard key={m.id} match={m} prediction={predictions[m.id]} />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
