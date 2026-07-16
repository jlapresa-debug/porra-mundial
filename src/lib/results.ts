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
  "GJ-J2-JOR-ALG": { home: 1, away: 2 }, // Argelia remonta 1-0 → 1-2

  // ── MD2 (23 jun) — MD2 completa ──────────────────────────────
  "GK-J2-POR-UZB": { home: 5, away: 0 }, // Doblete de Cristiano
  "GK-J2-COL-COD": { home: 1, away: 0 },
  "GL-J2-ENG-GHA": { home: 0, away: 0 },
  "GL-J2-PAN-CRO": { home: 0, away: 1 },

  // ── MD3 (24 jun) — Grupos A, B y C CERRADOS ──────────────────
  "GA-J3-CZE-MEX": { home: 0, away: 3 },
  "GA-J3-RSA-KOR": { home: 1, away: 0 },
  "GB-J3-SUI-CAN": { home: 3, away: 1 },
  "GB-J3-BIH-QAT": { home: 3, away: 1 },
  "GC-J3-SCO-BRA": { home: 0, away: 3 },
  "GC-J3-MAR-HAI": { home: 4, away: 2 },

  // ── MD3 (25 jun) — Grupos D, E y F CERRADOS ──────────────────
  "GD-J3-TUR-USA": { home: 3, away: 2 },
  "GD-J3-PAR-AUS": { home: 0, away: 0 },
  "GE-J3-ECU-GER": { home: 2, away: 1 },
  "GE-J3-CUW-CIV": { home: 0, away: 2 },
  "GF-J3-JPN-SWE": { home: 1, away: 1 },
  "GF-J3-TUN-NED": { home: 1, away: 3 },

  // ── MD3 (26 jun) — Grupos G, H e I CERRADOS ──────────────────
  "GG-J3-EGY-IRN": { home: 1, away: 1 },
  "GG-J3-NZL-BEL": { home: 1, away: 5 },
  "GH-J3-CPV-SAU": { home: 0, away: 0 },
  "GH-J3-URU-ESP": { home: 0, away: 1 },
  "GI-J3-NOR-FRA": { home: 1, away: 4 },
  "GI-J3-SEN-IRQ": { home: 5, away: 0 },

  // ── MD3 (27 jun) — Grupos J, K y L CERRADOS — FASE DE GRUPOS COMPLETA ──
  "GJ-J3-ALG-AUT": { home: 3, away: 3 }, // Doblete de Mahrez para empatar
  "GJ-J3-JOR-ARG": { home: 1, away: 3 }, // Messi cierra goleada
  "GK-J3-COL-POR": { home: 0, away: 0 },
  "GK-J3-COD-UZB": { home: 3, away: 1 },
  "GL-J3-PAN-ENG": { home: 0, away: 2 },
  "GL-J3-CRO-GHA": { home: 2, away: 1 },
};

// ───────────── ELIMINATORIAS ─────────────
// Ganador explícito de cada partido KO. Necesario porque en KO no hay empate
// (penaltis o prórroga deciden), así que el resultado no determina al ganador
// por sí solo.
// key = match.id (ej: "M73")
// value = código del equipo ganador
export const KO_WINNERS: Record<string, TeamCode> = {
  "M73": "CAN", // RSA 0-1 CAN (28 jun). Gol de Eustáquio en el 90+
  "M74": "PAR", // GER 1-1 PAR (29 jun), Paraguay 4-3 en penaltis
  "M75": "MAR", // NED 1-1 MAR (29 jun), Marruecos 3-2 en penaltis
  "M76": "BRA", // BRA 2-1 JPN (29 jun). Casemiro + Martinelli al 90+
  "M77": "FRA", // FRA 3-0 SWE (30 jun). Doblete Mbappé + Barcola
  "M78": "NOR", // CIV 1-2 NOR (30 jun). Nusa + Haaland
  "M79": "MEX", // MEX 2-0 ECU (30 jun). Quiñones + Jiménez, rompe maleficio de 40 años
  "M80": "ENG", // ENG 2-1 COD (1 jul). Doblete Kane
  "M81": "USA", // USA 2-0 BIH (1 jul). Balogun + Tillman
  "M82": "BEL", // BEL 3-2 SEN aet (1 jul). Remontada épica, Tielemans 124'
  "M83": "POR", // POR 2-1 CRO (2 jul). Ronaldo penalty + Ramos 94'
  "M84": "ESP", // ESP 3-0 AUT (2 jul). Doblete Oyarzábal + Porro
  "M85": "SUI", // SUI 2-0 ALG (3 jul). Embolo + Ndoye, 1ª vez en 88 años
  "M86": "ARG", // ARG 3-2 CPV aet (3 jul). Messi + Martínez + o.g., 20º gol Mundial de Messi
  "M87": "COL", // COL 1-0 GHA (3 jul). Gol de Jhon Arias
  "M88": "EGY", // AUS 1-1 EGY, Egipto 4-2 en penaltis (3 jul). 1ª victoria KO histórica de Egipto
  "M89": "FRA", // PAR 0-1 FRA (4 jul). Penalty de Mbappé al 70'
  "M90": "MAR", // CAN 0-3 MAR (4 jul). Doblete Ounahi + Rahimi. Canadá eliminada
  "M91": "NOR", // BRA 1-2 NOR (5 jul). Doblete Haaland, Neymar penalty 100'. Brasil eliminada
  "M92": "ENG", // MEX 2-3 ENG (5 jul). Doblete Bellingham + Kane penalty. Inglaterra con 10
  "M93": "ESP", // POR 0-1 ESP (6 jul). Gol de Merino al 91'. Última Copa del Mundo de CR7
  "M94": "BEL", // USA 1-4 BEL (6 jul). Doblete De Ketelaere + Vanaken + Lukaku
  "M95": "ARG", // ARG 3-2 EGY (7 jul). Argentina remonta 0-2 con Romero+Messi+Enzo en el tramo final
  "M96": "SUI", // SUI 0-0 COL, Suiza 4-3 en penaltis (7 jul). Vargas anota el definitivo
  "M98": "ESP", // ESP 2-1 BEL (10 jul). Fabián Ruiz (30') + Merino tras entrar de banquillo
  "M97": "FRA", // FRA 2-0 MAR (9 jul). Mbappé (20º gol Mundial) + Dembélé
  "M99": "ENG", // NOR 1-2 ENG aet (11 jul). Doblete Bellingham, decisivo en la prórroga
  "M100": "ARG", // ARG 3-1 SUI aet (11 jul). Álvarez + Lautaro en la prórroga, Suiza con 10
  "M101": "ESP", // FRA 0-2 ESP (14 jul). Penalty Oyarzábal (22') + Porro (58'). España a la final
  "M102": "ARG", // ENG 1-2 ARG (15 jul). Gordon adelanta a Inglaterra; Enzo (85') y Lautaro (92',
                 // asistencia de Messi en ambos) remontan. Argentina a la final
};

// Override manual de equipos en partidos KO.
// Útil cuando el motor no puede resolver solo un placeholder,
// principalmente los 8 mejores terceros ("3 A/B/C/D/F"), donde la
// asignación a cada llave depende de qué grupos clasifican sus terceros.
export const KO_TEAMS_OVERRIDE: Record<string, { home?: TeamCode; away?: TeamCode }> = {
  // ── Asignación de los 8 mejores terceros (FIFA — tras MD3) ───
  // Grupos cuyo tercero clasifica: B, D, E, F, I, J, K, L
  // Fuente: Wikipedia 2026 FIFA World Cup knockout stage + agregador
  "M74": { away: "PAR" }, // GER (1E) vs PAR (3D)
  "M77": { away: "SWE" }, // FRA (1I) vs SWE (3F)
  "M79": { away: "ECU" }, // MEX (1A) vs ECU (3E)
  "M80": { away: "COD" }, // ENG (1L) vs COD (3K)
  "M81": { away: "BIH" }, // USA (1D) vs BIH (3B)
  "M82": { away: "SEN" }, // BEL (1G) vs SEN (3I)
  "M85": { away: "ALG" }, // SUI (1B) vs ALG (3J)
  "M87": { away: "GHA" }, // COL (1K) vs GHA (3L)
};

// Resultado opcional con marcador exacto del partido KO (informativo).
// El que cuenta para puntuar siempre es KO_WINNERS.
export const KO_MATCH_RESULTS: Record<string, { home: number; away: number; penalties?: { home: number; away: number } }> = {
  "M73": { home: 0, away: 1 },
  "M74": { home: 1, away: 1, penalties: { home: 3, away: 4 } },
  "M75": { home: 1, away: 1, penalties: { home: 2, away: 3 } },
  "M76": { home: 2, away: 1 },
  "M77": { home: 3, away: 0 },
  "M78": { home: 1, away: 2 },
  "M79": { home: 2, away: 0 },
  "M80": { home: 2, away: 1 },
  "M81": { home: 2, away: 0 },
  "M82": { home: 3, away: 2 }, // AET, sin penaltis
  "M83": { home: 2, away: 1 },
  "M84": { home: 3, away: 0 },
  "M85": { home: 2, away: 0 },
  "M86": { home: 3, away: 2 }, // AET
  "M87": { home: 1, away: 0 },
  "M88": { home: 1, away: 1, penalties: { home: 2, away: 4 } },
  "M89": { home: 0, away: 1 },
  "M90": { home: 0, away: 3 },
  "M91": { home: 1, away: 2 },
  "M92": { home: 2, away: 3 },
  "M93": { home: 0, away: 1 },
  "M94": { home: 1, away: 4 },
  "M95": { home: 3, away: 2 },
  "M96": { home: 0, away: 0, penalties: { home: 4, away: 3 } },
  "M98": { home: 2, away: 1 },
  "M97": { home: 2, away: 0 },
  "M99": { home: 1, away: 2 }, // AET
  "M100": { home: 3, away: 1 }, // AET
  "M101": { home: 0, away: 2 },
  "M102": { home: 1, away: 2 },
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
  iso: "2026-07-15T23:00:00Z",
  by: "Claude (M102 Inglaterra-Argentina — SEMIS COMPLETAS, final fijada)",
  source: "ESPN + FIFA + CNN + NPR + FOX + NBC (verificado)",
};
