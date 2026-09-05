// Resultados reales de la Champions League 2026/27 — ÚNICA FUENTE DE VERDAD.
//
// Cómo se actualiza (agente programado 2x/día + verificación manual cuando
// se pide en el chat):
//   1. Tras cada jornada/partido, se busca el resultado en una fuente oficial
//      (UEFA.com / Wikipedia / agregadores) verificando con 2+ fuentes.
//   2. Se añade la entrada correspondiente aquí. El commit cita la fuente.
//   3. Vercel redespliega solo y el ranking se actualiza para todos.
//
// IMPORTANTE — eliminatorias: a diferencia de un Mundial, la Champions NO
// tiene cuadro fijo desde el play-off. Cada ronda se sortea de nuevo.
// Cuando la UEFA anuncie el sorteo de una ronda (play-off: feb 2027,
// octavos: tras el play-off, cuartos: tras octavos, semis: tras cuartos),
// hay que:
//   1. Añadir los partidos (ida y vuelta) a src/lib/matches.ts con los
//      equipos reales y las fechas oficiales.
//   2. Los resultados de esos partidos se registran aquí en KO_MATCH_RESULTS.

import type { TeamCode } from "./types";

// ───────────── FASE DE LIGA (144 partidos) ─────────────
// key = match.id (ej: "L1-AEK-LAS")
// value = goles del local y del visitante
export const LEAGUE_MATCH_RESULTS: Record<string, { home: number; away: number }> = {
  // Se rellena jornada a jornada a partir del 8 de septiembre de 2026.
};

// ───────────── ELIMINATORIAS (play-off, octavos, cuartos, semis, final) ─────────────
// key = match.id de cada partido de ida/vuelta (o "FINAL")
export const KO_MATCH_RESULTS: Record<
  string,
  { home: number; away: number; penalties?: { home: number; away: number } }
> = {
  // Se rellena a partir de febrero de 2027 (play-off).
};

// ───────────── APUESTAS GENERALES ─────────────
// Se rellena al terminar el torneo (final: 5 de junio de 2027).
export const TOURNAMENT_OUTCOME: {
  champion?: TeamCode;
  runnerUp?: TeamCode;
  topScorer?: string;
} = {};

// ───────────── METADATOS ─────────────
export const RESULTS_LAST_UPDATE = {
  iso: "2026-09-05T00:00:00Z",
  by: "Claude (migración a Champions League 2026/27 — sin resultados aún)",
  source: "UEFA.com",
};
