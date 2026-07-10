"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Header } from "@/components/Header";
import { TeamBadge } from "@/components/TeamBadge";
import { useUserPredictions } from "@/hooks/useUserPredictions";
import { TEAMS_BY_GROUP, getTeam } from "@/lib/teams";
import { ALL_MATCHES } from "@/lib/matches";
import { DEFAULT_RULES } from "@/lib/scoring";
import { EXPRESS_BETS, RESULT_LABEL } from "@/lib/express";
import { cn } from "@/lib/cn";
import type { Match } from "@/lib/types";

const ALL_GROUPS = ["A","B","C","D","E","F","G","H","I","J","K","L"];
const KO_SECTIONS: { stage: Match["stage"]; label: string }[] = [
  { stage: "round32",     label: "Dieciseisavos" },
  { stage: "round16",    label: "Octavos" },
  { stage: "quarter",    label: "Cuartos de final" },
  { stage: "semi",       label: "Semifinales" },
  { stage: "thirdplace", label: "Tercer puesto" },
  { stage: "final",      label: "Final" },
];
const KO_MATCHES = ALL_MATCHES.filter((m) => m.stage !== "group");

type Tab = "grupos" | "eliminatorias" | "especiales" | "express";

const POSITION = ["1°", "2°", "3°", "4°"];

export default function UserPredictionsPage() {
  const { id: groupId, uid } = useParams<{ id: string; uid: string }>();
  const { data, loading } = useUserPredictions(uid);
  const [tab, setTab] = useState<Tab>("grupos");

  const koByStage = useMemo(() => {
    const map = new Map<string, Match[]>();
    for (const m of KO_MATCHES) {
      const arr = map.get(m.stage) ?? [];
      arr.push(m);
      map.set(m.stage, arr);
    }
    return map;
  }, []);

  // Resumen de puntos apostados (no se pueden calcular sin resultados reales, se muestra N/A)
  const groupsDone = data
    ? ALL_GROUPS.filter((g) => !!data.groupPredictions[g]).length
    : 0;
  const koDone = data ? Object.keys(data.knockoutPredictions).length : 0;

  if (loading) {
    return (
      <AppShell>
        <Header title="Apuestas" back={`/groups/${groupId}`} />
        <div className="container-app mt-8 text-center text-muted text-sm">Cargando…</div>
      </AppShell>
    );
  }

  if (!data) {
    return (
      <AppShell>
        <Header title="Apuestas" back={`/groups/${groupId}`} />
        <div className="container-app mt-8 text-center text-muted text-sm">No se encontró el usuario.</div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Header
        title="Apuestas del jugador"
        back={`/groups/${groupId}`}
      />

      <div className="container-app mt-4 grid gap-4">
        {/* Avatar + nombre */}
        <div className="flex items-center gap-4 bg-bg-card border border-line rounded-2xl p-4">
          <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-white/10 bg-bg-elevated shrink-0 grid place-items-center">
            {data.photoURL ? (
              <Image src={data.photoURL} alt="" width={56} height={56} unoptimized />
            ) : (
              <span className="font-display font-bold text-xl">
                {data.displayName.slice(0, 1).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <div className="font-display font-bold text-base">{data.displayName}</div>
            <div className="text-xs text-muted mt-0.5">
              {groupsDone} de 12 grupos · {koDone} eliminatorias
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-bg-card border border-line rounded-2xl">
          {(["grupos", "eliminatorias", "especiales", "express"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "flex-1 h-9 rounded-xl text-xs font-medium transition",
                tab === t
                  ? "bg-gradient-brand text-white shadow-sm shadow-brand/20"
                  : "text-muted hover:text-white",
              )}
            >
              {t === "grupos" ? "Grupos"
                : t === "eliminatorias" ? "Elim."
                : t === "especiales" ? "Espec."
                : "Express"}
            </button>
          ))}
        </div>

        {/* ── TAB GRUPOS ────────────────────────────── */}
        {tab === "grupos" && (
          <div className="grid gap-3 pb-6 animate-fade-in">
            {ALL_GROUPS.map((g) => {
              const order = data.groupPredictions[g];
              const teams = TEAMS_BY_GROUP[g] ?? [];
              return (
                <div key={g} className="rounded-2xl bg-bg-card border border-line overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-line bg-bg-elevated/40">
                    <span className="font-display font-bold text-sm">GRUPO {g}</span>
                    {order ? (
                      <span className="text-[10px] text-brand font-semibold">✓ Apostado</span>
                    ) : (
                      <span className="text-[10px] text-muted">Sin apostar</span>
                    )}
                  </div>
                  {order ? (
                    <div className="divide-y divide-line">
                      {order.map((code, i) => {
                        const team = getTeam(code);
                        return (
                          <div key={code} className="flex items-center gap-3 px-4 py-2.5">
                            <span className="w-6 text-center text-xs font-bold text-muted shrink-0">
                              {POSITION[i]}
                            </span>
                            <TeamBadge team={team} size="sm" showName={false} />
                            <span className="text-sm font-medium">{team?.name ?? code}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="px-4 py-3 text-xs text-muted italic">
                      No apostó en este grupo
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── TAB ELIMINATORIAS ─────────────────────── */}
        {tab === "eliminatorias" && (
          <div className="grid gap-6 pb-6 animate-fade-in">
            {KO_SECTIONS.map(({ stage, label }) => {
              const matches = koByStage.get(stage) ?? [];
              if (!matches.length) return null;
              return (
                <section key={stage}>
                  <h2 className="text-[11px] uppercase tracking-widest text-muted font-semibold mb-2">
                    {label}
                  </h2>
                  <div className="rounded-2xl bg-bg-card border border-line overflow-hidden divide-y divide-line">
                    {matches.map((m) => {
                      const winner = data.knockoutPredictions[m.id];
                      const winnerTeam = getTeam(winner);
                      const homeTeam = getTeam(m.home);
                      const awayTeam = getTeam(m.away);
                      return (
                        <div key={m.id} className="flex items-center gap-3 px-4 py-3">
                          <span className="text-[10px] text-muted w-8 shrink-0">
                            {m.matchNumber ? `M${m.matchNumber}` : ""}
                          </span>
                          <div className="flex-1 text-xs text-muted">
                            <span>{homeTeam?.name ?? m.homePlaceholder ?? "—"}</span>
                            <span className="mx-1.5 text-muted/50">vs</span>
                            <span>{awayTeam?.name ?? m.awayPlaceholder ?? "—"}</span>
                          </div>
                          {winner ? (
                            <div className="flex items-center gap-1.5">
                              <TeamBadge team={winnerTeam} size="sm" showName={false} />
                              <span className="text-xs font-semibold text-brand">
                                {winnerTeam?.name ?? winner}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-muted italic">Sin apostar</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {/* ── TAB ESPECIALES ────────────────────────── */}
        {tab === "especiales" && (
          <div className="grid gap-3 pb-6 animate-fade-in">
            {[
              { key: "champion" as const,   icon: "🏆", label: "Campeón",          pts: DEFAULT_RULES.special.champion },
              { key: "runnerUp" as const,   icon: "🥈", label: "Finalista",         pts: DEFAULT_RULES.special.runnerUp },
              { key: "topScorer" as const,  icon: "⚽", label: "Máximo goleador",   pts: DEFAULT_RULES.special.topScorer },
              { key: "bestPlayer" as const, icon: "✨", label: "Mejor jugador",     pts: DEFAULT_RULES.special.bestPlayer },
            ].map(({ key, icon, label, pts }) => {
              const val = data.specials[key];
              const team = key === "champion" || key === "runnerUp"
                ? getTeam(val as string | undefined)
                : undefined;
              return (
                <div key={key} className="flex items-center gap-3 bg-bg-card border border-line rounded-2xl px-4 py-3.5">
                  <span className="text-lg">{icon}</span>
                  <div className="flex-1">
                    <div className="text-xs text-muted">{label}</div>
                    {val ? (
                      <div className="flex items-center gap-2 mt-0.5">
                        {team && <TeamBadge team={team} size="sm" showName={false} />}
                        <span className="font-semibold text-sm">
                          {team?.name ?? val}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted italic">Sin apostar</span>
                    )}
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand/20 text-brand shrink-0">
                    +{pts}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* ── TAB EXPRESS ────────────────────────── */}
        {tab === "express" && (
          <div className="grid gap-3 pb-6 animate-fade-in">
            {EXPRESS_BETS.length === 0 && (
              <div className="text-center text-muted text-sm py-6">
                Aún no hay apuestas express activas.
              </div>
            )}
            {EXPRESS_BETS.map((bet) => {
              const pred = data.expressPredictions[bet.id];
              const team = getTeam(bet.team);
              const opponent = getTeam(bet.opponent);
              return (
                <div key={bet.id} className="rounded-2xl bg-bg-card border border-line overflow-hidden">
                  <div className="px-4 py-3 border-b border-line bg-bg-elevated/40">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <TeamBadge team={team} size="sm" showName={false} />
                        <span className="text-xs">vs</span>
                        <TeamBadge team={opponent} size="sm" showName={false} />
                        <span className="font-display font-bold text-sm ml-1">{bet.title}</span>
                      </div>
                      {pred ? (
                        <span className="text-[10px] text-brand font-semibold">✓ Apostó</span>
                      ) : (
                        <span className="text-[10px] text-muted">Sin apostar</span>
                      )}
                    </div>
                  </div>
                  {pred ? (
                    <div className="divide-y divide-line">
                      {bet.q1 && (
                        <div className="px-4 py-2.5 flex items-center justify-between">
                          <span className="text-xs text-muted">Resultado de {team?.name}</span>
                          <span className="text-xs font-semibold">
                            {pred.q1 ? RESULT_LABEL[pred.q1] : "—"}
                          </span>
                        </div>
                      )}
                      {bet.q2 && (
                        <div className="px-4 py-2.5 flex items-center justify-between">
                          <span className="text-xs text-muted">Resultado exacto</span>
                          <span className="text-sm font-bold tabular-nums">
                            {pred.q2 ? `${pred.q2.teamGoals} – ${pred.q2.opponentGoals}` : "—"}
                          </span>
                        </div>
                      )}
                      {bet.q3 && (
                        <div className="px-4 py-2.5">
                          <div className="text-xs text-muted mb-1.5">Goleadores de {team?.name}</div>
                          {pred.q3 && pred.q3.length > 0 ? (
                            <ul className="text-xs space-y-0.5">
                              {pred.q3.map((p, i) => (
                                <li key={i} className="font-medium">⚽ {p || <span className="text-muted italic">(vacío)</span>}</li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-xs text-muted italic">Sin goles predichos</span>
                          )}
                        </div>
                      )}
                      {bet.questions && bet.questions.map((q) => {
                        const ans = pred.binaryAnswers?.[q.id];
                        const label = ans === undefined
                          ? "—"
                          : q.kind === "options" ? q.options[Number(ans)]
                          : q.kind === "number" ? (q.maxLabel && Number(ans) >= q.max ? q.maxLabel : ans)
                          : ans;
                        return (
                          <div key={q.id} className="px-4 py-2.5 flex items-start justify-between gap-3">
                            <span className="text-xs text-muted flex-1 leading-snug">{q.text}</span>
                            <span className="text-xs font-semibold shrink-0">{label}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="px-4 py-3 text-xs text-muted italic">
                      No participó en esta apuesta express.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
