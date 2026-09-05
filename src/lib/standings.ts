// Motor de clasificación de la fase de liga (36 equipos, tabla única).
//
// Desempates: se usa una versión simplificada de los criterios UEFA
// (puntos → diferencia de goles global → goles a favor global →
// enfrentamiento directo entre empatados). La UEFA aplica además
// criterios adicionales (goles fuera de casa, fair play, coeficiente
// UEFA) que no se implementan aquí por ser marginales para una porra
// de amigos.

import type { Match, TeamCode } from "./types";
import { TEAMS } from "./teams";

export interface TeamStat {
  team: TeamCode;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

function emptyStat(team: TeamCode): TeamStat {
  return { team, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 };
}

function applyMatch(s: TeamStat, gf: number, ga: number): void {
  s.played++;
  s.goalsFor += gf;
  s.goalsAgainst += ga;
  if (gf > ga) { s.won++; s.points += 3; }
  else if (gf < ga) { s.lost++; }
  else { s.drawn++; s.points++; }
}

function goalDiff(s: TeamStat): number {
  return s.goalsFor - s.goalsAgainst;
}

function compareOverall(a: TeamStat, b: TeamStat): number {
  if (b.points !== a.points) return b.points - a.points;
  if (goalDiff(b) !== goalDiff(a)) return goalDiff(b) - goalDiff(a);
  if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
  return 0;
}

function statsHeadToHead(
  tiedTeams: TeamCode[],
  leagueMatches: Match[],
  results: Record<string, { home: number; away: number }>,
): Record<TeamCode, TeamStat> {
  const set = new Set(tiedTeams);
  const stats: Record<string, TeamStat> = {};
  for (const t of tiedTeams) stats[t] = emptyStat(t);

  for (const m of leagueMatches) {
    if (!m.home || !m.away) continue;
    if (!set.has(m.home) || !set.has(m.away)) continue;
    const r = results[m.id];
    if (!r) continue;
    applyMatch(stats[m.home], r.home, r.away);
    applyMatch(stats[m.away], r.away, r.home);
  }

  return stats;
}

function breakTies(
  bucket: TeamStat[],
  leagueMatches: Match[],
  results: Record<string, { home: number; away: number }>,
): TeamStat[] {
  if (bucket.length <= 1) return bucket;
  const teamCodes = bucket.map((s) => s.team);
  const h2h = statsHeadToHead(teamCodes, leagueMatches, results);
  return [...bucket].sort((a, b) => {
    const ha = h2h[a.team];
    const hb = h2h[b.team];
    if (hb.points !== ha.points) return hb.points - ha.points;
    if (goalDiff(hb) !== goalDiff(ha)) return goalDiff(hb) - goalDiff(ha);
    if (hb.goalsFor !== ha.goalsFor) return hb.goalsFor - ha.goalsFor;
    return 0;
  });
}

// Tabla de la fase de liga con los resultados disponibles hasta el momento
// (incluye equipos que aún no han jugado ningún partido, con 0 en todo).
export function computeLeagueTable(
  matches: Match[],
  results: Record<string, { home: number; away: number }>,
): TeamStat[] {
  const leagueMatches = matches.filter((m) => m.stage === "league");
  const stats: Record<string, TeamStat> = {};
  for (const t of TEAMS) stats[t.code] = emptyStat(t.code);

  for (const m of leagueMatches) {
    const r = results[m.id];
    if (!r || !m.home || !m.away) continue;
    applyMatch(stats[m.home], r.home, r.away);
    applyMatch(stats[m.away], r.away, r.home);
  }

  const sorted = TEAMS.map((t) => stats[t.code]).sort(compareOverall);

  const buckets: TeamStat[][] = [];
  let current: TeamStat[] = [sorted[0]];
  for (let i = 1; i < sorted.length; i++) {
    if (compareOverall(sorted[i - 1], sorted[i]) === 0) {
      current.push(sorted[i]);
    } else {
      buckets.push(current);
      current = [sorted[i]];
    }
  }
  buckets.push(current);

  const finalOrder: TeamStat[] = [];
  for (const b of buckets) {
    finalOrder.push(...breakTies(b, leagueMatches, results));
  }

  return finalOrder;
}

export function isLeaguePhaseComplete(
  matches: Match[],
  results: Record<string, { home: number; away: number }>,
): boolean {
  const leagueMatches = matches.filter((m) => m.stage === "league");
  return leagueMatches.length > 0 && leagueMatches.every((m) => !!results[m.id]);
}

// Los 8 primeros clasificados de la fase de liga, solo cuando las 144
// jornadas se han jugado (para puntuar la apuesta "Fase 1" sin riesgo
// de contar clasificaciones parciales).
export function getFinalTop8(
  matches: Match[],
  results: Record<string, { home: number; away: number }>,
): TeamCode[] | null {
  if (!isLeaguePhaseComplete(matches, results)) return null;
  return computeLeagueTable(matches, results).slice(0, 8).map((s) => s.team);
}
