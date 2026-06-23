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
  // ── MD1 (11-17 jun) ──────────────────────────────────────────
  "GA-J1-MEX-RSA": { home: 2, away: 0 },
  "GA-J1-KOR-CZE": { home: 2, away: 1 },
  "GB-J1-CAN-BIH": { home: 1, away: 1 },
  "GD-J1-USA-PAR": { home: 4, away: 1 },
  "GB-J1-QAT-SUI": { home: 1, away: 1 },
  "GC-J1-BRA-MAR": { home: 1, away: 1 },
  "GC-J1-HAI-SCO": { home: 0, away: 1 },
  "GD-J1-AUS-TUR": { home: 2, away: 0 },
  "GE-J1-GER-CUW": { home: 7, away: 1 },
  "GE-J1-CIV-ECU": { home: 1, away: 0 },
  "GF-J1-NED-JPN": { home: 2, away: 2 },
  "GF-J1-SWE-TUN": { home: 5, away: 1 },
  "GG-J1-IRN-NZL": { home: 2, away: 2 },
  "GG-J1-BEL-EGY": { home: 1, away: 1 },
  "GH-J1-ESP-CPV": { home: 0, away: 0 },
  "GH-J1-SAU-URU": { home: 1, away: 1 },
  "GI-J1-FRA-SEN": { home: 3, away: 1 },
  "GI-J1-IRQ-NOR": { home: 1, away: 4 },
  "GJ-J1-ARG-ALG": { home: 3, away: 0 },
  "GJ-J1-AUT-JOR": { home: 3, away: 1 },
  "GK-J1-POR-COD": { home: 1, away: 1 },
  "GK-J1-UZB-COL": { home: 1, away: 3 },
  "GL-J1-ENG-CRO": { home: 4, away: 2 },
  "GL-J1-GHA-PAN": { home: 1, away: 0 },

  // ── MD2 (18-20 jun, los partidos del 21 jun aún no terminan) ─
  "GA-J2-CZE-RSA": { home: 1, away: 1 },
  "GA-J2-MEX-KOR": { home: 1, away: 0 },
  "GB-J2-SUI-BIH": { home: 4, away: 1 },
  "GB-J2-CAN-QAT": { home: 6, away: 0 },
  "GC-J2-SCO-MAR": { home: 0, away: 1 },
  "GC-J2-BRA-HAI": { home: 3, away: 0 },
  "GD-J2-USA-AUS": { home: 2, away: 0 },
  "GD-J2-TUR-PAR": { home: 0, away: 1 },
  "GE-J2-GER-CIV": { home: 2, away: 1 },
  "GE-J2-ECU-CUW": { home: 0, away: 0 },
  "GF-J2-NED-SWE": { home: 5, away: 1 },
  "GF-J2-TUN-JPN": { home: 0, away: 4 },

  // ── MD2 (21 jun) ──────────────────────────────────────────────
  "GH-J2-ESP-SAU": { home: 4, away: 0 },
  "GG-J2-BEL-IRN": { home: 0, away: 0 },
  "GG-J2-NZL-EGY": { home: 1, away: 3 },
  "GH-J2-URU-CPV": { home: 2, away: 2 },

  // ── MD2 (22 jun) ──────────────────────────────────────────────
  "GI-J2-FRA-IRQ": { home: 3, away: 0 },
  "GI-J2-NOR-SEN": { home: 3, away: 2 },
  "GJ-J2-ARG-AUT": { home: 2, away: 0 },
  // GJ-J2-JOR-ALG: en juego — pendiente
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
  iso: "2026-06-23T18:00:00Z",
  by: "Claude (3 de 4 partidos del 22 jun; JOR-ALG en juego)",
  source: "ESPN, NBC News",
};
