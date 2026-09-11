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
  // ── Jornada 1 (8-9 sep 2026, verificado con ESPN + VAVEL/Sky Sports) ──
  "L1-AEK-LAS": { home: 1, away: 0 },
  "L1-BRU-AVL": { home: 2, away: 3 },
  "L1-DOR-VIL": { home: 3, away: 2 },
  "L1-POR-MCI": { home: 0, away: 2 },
  "L1-LIL-BET": { home: 2, away: 3 },
  "L1-RMA-INT": { home: 2, away: 1 },
  "L1-BAR-FEY": { home: 5, away: 1 },
  "L1-STU-VIK": { home: 3, away: 1 },
  "L1-LIV-ATM": { home: 2, away: 1 },
  "L1-PSG-SVK": { home: 6, away: 1 },
  "L1-SCP-GAL": { home: 3, away: 1 },
  "L1-NAP-ARS": { home: 0, away: 1 },
  "L1-FEN-ROM": { home: 1, away: 1 },
  "L1-PSV-SHK": { home: 1, away: 1 },
  "L1-COM-LEI": { home: 4, away: 1 },
  "L1-BAY-BOD": { home: 5, away: 0 },
  "L1-MUN-SAB": { home: 4, away: 0 },
  "L1-SLA-LEN": { home: 2, away: 3 },
  // Jornada 1 completa (18/18).
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
  iso: "2026-09-11T00:00:00Z",
  by: "Claude (actualización manual pedida en chat)",
  source: "ESPN + VAVEL/LaPresse/AllFootball (verificado con 2+ fuentes por partido)",
};
