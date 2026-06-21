// Resultados reales del Mundial 2026 — ÚNICA FUENTE DE VERDAD.
//
// Cómo se actualiza:
//   1. Tras cada partido, Claude busca el resultado en una fuente oficial
//      (FIFA.com / Wikipedia / BBC) y añade la entrada correspondiente aquí.
//   2. El commit cita la fuente y la URL.
//   3. Vercel redespliega solo y el ranking se actualiza para todos.
//
// El motor de standings.ts y bracket.ts toma este archivo y:
//   - Calcula las clasificaciones de cada grupo con desempates FIFA
//   - Rellena los placeholders del cuadro KO ("1A", "Gan. M-73", etc.)
//   - Aplica los puntos en el ranking

import type { TeamCode } from "./types";

// ───────────── FASE DE GRUPOS ─────────────
// key = match.id (ej: "GA-J1-MEX-RSA")
// value = goles del local y del visitante
export const GROUP_MATCH_RESULTS: Record<string, { home: number; away: number }> = {
  // "GA-J1-MEX-RSA": { home: 1, away: 0 },  // Fuente: ...
};

// ───────────── ELIMINATORIAS ─────────────
// Ganador explícito de cada partido KO. Necesario porque en KO no hay empate
// (penaltis o prórroga deciden), así que el resultado no determina al ganador
// por sí solo.
// key = match.id (ej: "M73")
// value = código del equipo ganador
export const KO_WINNERS: Record<string, TeamCode> = {
  // "M73": "MEX",
};

// Override manual de equipos en partidos KO.
// Útil cuando el motor no puede resolver solo un placeholder,
// principalmente los 8 mejores terceros ("3 A/B/C/D/F"), donde la
// asignación a cada llave depende de qué grupos clasifican sus terceros.
export const KO_TEAMS_OVERRIDE: Record<string, { home?: TeamCode; away?: TeamCode }> = {
  // "M79": { away: "URU" },
};

// Resultado opcional con marcador exacto del partido KO (informativo).
// El que cuenta para puntuar siempre es KO_WINNERS.
export const KO_MATCH_RESULTS: Record<string, { home: number; away: number; penalties?: { home: number; away: number } }> = {
  // "M73": { home: 1, away: 1, penalties: { home: 4, away: 3 } },
};

// ───────────── APUESTAS GENERALES ─────────────
// Se rellena al terminar el torneo (19 julio).
export const TOURNAMENT_OUTCOME: {
  champion?: TeamCode;
  runnerUp?: TeamCode;
  topScorer?: string;
  bestPlayer?: string;
} = {};

// ───────────── METADATOS ─────────────
// Última actualización por humano/Claude — para auditoría
export const RESULTS_LAST_UPDATE = {
  iso: "2026-06-21T00:00:00Z",
  by: "Claude (setup)",
  source: "—",
};
