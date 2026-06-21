// Motor de resolución del cuadro eliminatorio (32 partidos KO).
//
// Resuelve los placeholders de cada partido KO en equipos reales:
//   - "1A" / "2B" → lookup en standings finales del grupo
//   - "3 X/Y/Z/..." → necesita asignación manual via KO_TEAMS_OVERRIDE
//     (porque depende de la combinación específica de terceros clasificados)
//   - "Gan. M-73" → ganador del partido 73 (lookup en KO_WINNERS,
//     o derivable del marcador si fue sin penaltis)
//   - "Perd. M-101" → el otro equipo del partido 101

import type { Match, TeamCode } from "./types";
import {
  GROUP_MATCH_RESULTS,
  KO_MATCH_RESULTS,
  KO_TEAMS_OVERRIDE,
  KO_WINNERS,
} from "./results";
import { computeFinalGroupStandings } from "./standings";

// Parsea un placeholder y devuelve el equipo si se puede resolver
function resolvePlaceholder(
  placeholder: string | undefined,
  allMatches: Match[],
  groupStandings: Record<string, TeamCode[] | null>,
  resolvedMatches: Map<string, { home: TeamCode | null; away: TeamCode | null; winner: TeamCode | null }>,
): TeamCode | null {
  if (!placeholder) return null;
  const p = placeholder.trim();

  // "1A", "2A", "3A" (sin slash) → posición pos-1 del grupo X
  const directMatch = p.match(/^([1234])([A-L])$/);
  if (directMatch) {
    const pos = parseInt(directMatch[1], 10) - 1;
    const group = directMatch[2];
    return groupStandings[group]?.[pos] ?? null;
  }

  // "3 A/B/C/D/F" → tercero clasificado de uno de esos grupos
  // No podemos resolver solo: requiere el cuadro oficial FIFA de asignación
  // de los 8 mejores terceros. Se gestiona con KO_TEAMS_OVERRIDE.
  if (p.startsWith("3 ") || p.startsWith("3°") || p.startsWith("3º")) {
    return null;
  }

  // "Gan. M-73" → ganador del match 73
  const winMatch = p.match(/^Gan\.\s*M-(\d+)$/i);
  if (winMatch) {
    const matchNo = parseInt(winMatch[1], 10);
    const target = allMatches.find((m) => m.matchNumber === matchNo);
    if (!target) return null;
    return resolvedMatches.get(target.id)?.winner ?? null;
  }

  // "Perd. M-101" → perdedor del match 101
  const loseMatch = p.match(/^Perd\.\s*M-(\d+)$/i);
  if (loseMatch) {
    const matchNo = parseInt(loseMatch[1], 10);
    const target = allMatches.find((m) => m.matchNumber === matchNo);
    if (!target) return null;
    const r = resolvedMatches.get(target.id);
    if (!r || !r.winner || !r.home || !r.away) return null;
    return r.winner === r.home ? r.away : r.home;
  }

  return null;
}

// Devuelve el ganador de un KO match si se puede determinar
function determineKOWinner(
  matchId: string,
  home: TeamCode | null,
  away: TeamCode | null,
): TeamCode | null {
  // Ganador explícito (incluye penaltis) tiene prioridad
  const explicit = KO_WINNERS[matchId];
  if (explicit) return explicit;

  // Si hay marcador sin empate, derivar
  const r = KO_MATCH_RESULTS[matchId];
  if (r && home && away && r.home !== r.away) {
    return r.home > r.away ? home : away;
  }

  return null;
}

// Función principal: toma todos los partidos en crudo y devuelve la versión
// enriquecida (con equipos reales, resultados y ganadores).
export function enrichMatches(rawMatches: Match[]): Match[] {
  // 1. Standings finales de cada grupo
  const groupStandings: Record<string, TeamCode[] | null> = {};
  for (const g of ["A","B","C","D","E","F","G","H","I","J","K","L"]) {
    groupStandings[g] = computeFinalGroupStandings(g, rawMatches, GROUP_MATCH_RESULTS);
  }

  // 2. Resolver KO matches iterativamente (necesario por dependencias entre rondas)
  const resolved = new Map<string, { home: TeamCode | null; away: TeamCode | null; winner: TeamCode | null }>();

  // Inicializar con datos en bruto (grupos ya tienen home/away)
  for (const m of rawMatches) {
    resolved.set(m.id, {
      home: m.home,
      away: m.away,
      winner: null,
    });
  }

  // Aplicar overrides explícitos
  for (const [id, ov] of Object.entries(KO_TEAMS_OVERRIDE)) {
    const cur = resolved.get(id);
    if (!cur) continue;
    resolved.set(id, {
      ...cur,
      home: ov.home ?? cur.home,
      away: ov.away ?? cur.away,
    });
  }

  // Iterar hasta punto fijo (max 10 pasadas — más que suficiente para 8 rondas)
  let changed = true;
  let iterations = 0;
  while (changed && iterations < 10) {
    changed = false;
    iterations++;

    for (const m of rawMatches) {
      if (m.stage === "group") continue;
      const cur = resolved.get(m.id)!;

      // Intentar resolver home si todavía es null
      if (!cur.home && m.homePlaceholder) {
        const t = resolvePlaceholder(m.homePlaceholder, rawMatches, groupStandings, resolved);
        if (t) { cur.home = t; changed = true; }
      }
      if (!cur.away && m.awayPlaceholder) {
        const t = resolvePlaceholder(m.awayPlaceholder, rawMatches, groupStandings, resolved);
        if (t) { cur.away = t; changed = true; }
      }

      // Determinar ganador si home/away conocidos
      if (!cur.winner) {
        const w = determineKOWinner(m.id, cur.home, cur.away);
        if (w) { cur.winner = w; changed = true; }
      }
    }
  }

  // 3. Construir matches enriquecidos
  return rawMatches.map((m) => {
    const r = resolved.get(m.id)!;
    const enriched: Match = { ...m };
    if (r.home) enriched.home = r.home;
    if (r.away) enriched.away = r.away;
    if (r.winner) enriched.winner = r.winner;

    // Resultado de partido de grupo
    if (m.stage === "group") {
      const gr = GROUP_MATCH_RESULTS[m.id];
      if (gr) enriched.result = { home: gr.home, away: gr.away };
    } else {
      // Resultado KO si existe
      const kr = KO_MATCH_RESULTS[m.id];
      if (kr) {
        enriched.result = {
          home: kr.home,
          away: kr.away,
          penaltiesWinner: kr.penalties
            ? (kr.penalties.home > kr.penalties.away ? "home" : "away")
            : undefined,
        };
      }
    }

    return enriched;
  });
}

// Helper para usar en hooks: devuelve los standings finales de todos los grupos
export function getAllFinalStandings(allMatches: Match[]): Record<string, TeamCode[]> {
  const out: Record<string, TeamCode[]> = {};
  for (const g of ["A","B","C","D","E","F","G","H","I","J","K","L"]) {
    const s = computeFinalGroupStandings(g, allMatches, GROUP_MATCH_RESULTS);
    if (s) out[g] = s;
  }
  return out;
}

// Standings actuales — incluye grupos parcialmente jugados.
// Útil para calcular puntos virtuales (proyección en tiempo real).
import { computeGroupStandings } from "./standings";
export function getAllCurrentStandings(allMatches: Match[]): Record<string, TeamCode[]> {
  const out: Record<string, TeamCode[]> = {};
  for (const g of ["A","B","C","D","E","F","G","H","I","J","K","L"]) {
    const s = computeGroupStandings(g, allMatches, GROUP_MATCH_RESULTS);
    if (s) out[g] = s.standings;
  }
  return out;
}
