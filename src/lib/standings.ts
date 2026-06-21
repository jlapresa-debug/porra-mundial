// Motor de clasificación de fase de grupos del Mundial 2026.
//
// Desempates oficiales FIFA (en orden):
//   1. Puntos en todos los partidos del grupo
//   2. Diferencia de goles en todos los partidos
//   3. Goles a favor en todos los partidos
//   Si siguen empatados:
//   4. Puntos en los enfrentamientos directos entre los empatados
//   5. Diferencia de goles entre los empatados
//   6. Goles a favor entre los empatados
//   7. Fair play (no implementado — devolvemos 0)
//   8. Sorteo (no implementado)

import type { Match, TeamCode } from "./types";
import { TEAMS_BY_GROUP } from "./teams";

interface TeamStat {
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

// Comparador para 1ª pasada: puntos / diferencia / goles a favor (globales)
function compareOverall(a: TeamStat, b: TeamStat): number {
  if (b.points !== a.points) return b.points - a.points;
  if (goalDiff(b) !== goalDiff(a)) return goalDiff(b) - goalDiff(a);
  if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
  return 0;
}

// Para desempates entre equipos empatados: calcula stats restringidas a
// los partidos entre ellos
function statsHeadToHead(
  tiedTeams: TeamCode[],
  matches: Match[],
  results: Record<string, { home: number; away: number }>,
): Record<TeamCode, TeamStat> {
  const set = new Set(tiedTeams);
  const stats: Record<string, TeamStat> = {};
  for (const t of tiedTeams) stats[t] = emptyStat(t);

  for (const m of matches) {
    if (!m.home || !m.away) continue;
    if (!set.has(m.home) || !set.has(m.away)) continue;
    const r = results[m.id];
    if (!r) continue;
    applyMatch(stats[m.home], r.home, r.away);
    applyMatch(stats[m.away], r.away, r.home);
  }

  return stats;
}

// Reordena empates en bloque por enfrentamiento directo
function breakTies(
  bucket: TeamStat[],
  matches: Match[],
  results: Record<string, { home: number; away: number }>,
): TeamStat[] {
  if (bucket.length <= 1) return bucket;
  const teamCodes = bucket.map((s) => s.team);
  const h2h = statsHeadToHead(teamCodes, matches, results);
  return [...bucket].sort((a, b) => {
    const ha = h2h[a.team];
    const hb = h2h[b.team];
    if (hb.points !== ha.points) return hb.points - ha.points;
    if (goalDiff(hb) !== goalDiff(ha)) return goalDiff(hb) - goalDiff(ha);
    if (hb.goalsFor !== ha.goalsFor) return hb.goalsFor - ha.goalsFor;
    return 0;
  });
}

// Devuelve los códigos de equipo ordenados de 1° a 4°, o null si no hay datos
export function computeGroupStandings(
  group: string,
  matches: Match[],
  results: Record<string, { home: number; away: number }>,
): { standings: TeamCode[]; stats: TeamStat[] } | null {
  const teams = TEAMS_BY_GROUP[group];
  if (!teams || teams.length !== 4) return null;

  const groupMatches = matches.filter((m) => m.group === group);

  const stats: Record<string, TeamStat> = {};
  for (const t of teams) stats[t.code] = emptyStat(t.code);

  let played = 0;
  for (const m of groupMatches) {
    const r = results[m.id];
    if (!r || !m.home || !m.away) continue;
    applyMatch(stats[m.home], r.home, r.away);
    applyMatch(stats[m.away], r.away, r.home);
    played++;
  }

  if (played === 0) return null;

  // 1ª pasada: criterios globales
  const sorted = teams
    .map((t) => stats[t.code])
    .sort(compareOverall);

  // 2ª pasada: para cada grupo de empate, aplicar enfrentamiento directo
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
    finalOrder.push(...breakTies(b, groupMatches, results));
  }

  return {
    standings: finalOrder.map((s) => s.team),
    stats: finalOrder,
  };
}

// Igual que el anterior pero solo si TODOS los 6 partidos del grupo están jugados
// (necesario para puntuar la apuesta de clasificación final sin riesgo)
export function computeFinalGroupStandings(
  group: string,
  matches: Match[],
  results: Record<string, { home: number; away: number }>,
): TeamCode[] | null {
  const groupMatches = matches.filter((m) => m.group === group);
  const allPlayed = groupMatches.every((m) => !!results[m.id]);
  if (!allPlayed) return null;
  return computeGroupStandings(group, matches, results)?.standings ?? null;
}

// Ranking global de los 12 terceros para decidir cuáles 8 clasifican
// (necesario para resolver los placeholders "3 X/Y/Z/..." del R32)
export function rankAllThirdPlaces(
  matches: Match[],
  results: Record<string, { home: number; away: number }>,
): { group: string; team: TeamCode; stat: TeamStat }[] | null {
  const groups = Object.keys(TEAMS_BY_GROUP).sort();
  const thirds: { group: string; team: TeamCode; stat: TeamStat }[] = [];

  for (const g of groups) {
    const standing = computeFinalGroupStandings(g, matches, results);
    if (!standing) return null; // si algún grupo aún no acabó, no se puede rankear
    const thirdCode = standing[2];
    // recomputar stats para el tercero
    const full = computeGroupStandings(g, matches, results);
    const stat = full?.stats.find((s) => s.team === thirdCode);
    if (!stat) return null;
    thirds.push({ group: g, team: thirdCode, stat });
  }

  // Ordenar terceros por mismos criterios globales
  thirds.sort((a, b) => compareOverall(a.stat, b.stat));
  return thirds;
}
