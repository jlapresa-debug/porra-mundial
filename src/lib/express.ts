// Apuestas Express: apuestas concretas y puntuales para un partido específico,
// con plazo limitado. Cada apuesta se compone de 3 preguntas opcionales (Q1, Q2, Q3).
//
// Cómo añadir una nueva apuesta express: añade un objeto a EXPRESS_BETS más abajo.

import type { ExpressOutcome, TeamCode } from "./types";

// Resultado posible en Q1 (perspectiva del equipo principal)
export type ExpressResult = "win" | "draw" | "lose";

export const RESULT_LABEL: Record<ExpressResult, string> = {
  win:   "Ganar",
  draw:  "Empatar",
  lose:  "Perder",
};

export interface ExpressBet {
  id: string;
  title: string;
  matchId: string;        // ID del partido al que está vinculada (de matches.ts)
  deadline: string;       // ISO UTC
  team: TeamCode;         // Equipo principal (España, en este caso)
  opponent: TeamCode;
  // Q1: resultado del equipo principal
  q1: { points: number };
  // Q2: resultado exacto del partido
  q2: { points: number; maxGoals: number };
  // Q3: goleadores del equipo principal (1 selector por gol predicho en Q2)
  q3: { pointsPerHit: number; squad: string[] };
}

// Convocatoria oficial de España para el Mundial 2026 (26 jugadores)
// Fuente: Luis de la Fuente / RFEF — junio 2026
export const SPAIN_SQUAD_2026 = [
  // Porteros
  "Unai Simón",
  "David Raya",
  "Joan García",
  // Defensas
  "Pedro Porro",
  "Marc Cucurella",
  "Álex Grimaldo",
  "Pau Cubarsí",
  "Aymeric Laporte",
  "Marc Pubill",
  "Eric García",
  "Marcos Llorente",
  // Centrocampistas
  "Rodri",
  "Martín Zubimendi",
  "Pedri",
  "Fabián Ruiz",
  "Mikel Merino",
  "Gavi",
  "Álex Baena",
  // Delanteros
  "Mikel Oyarzabal",
  "Lamine Yamal",
  "Ferran Torres",
  "Borja Iglesias",
  "Dani Olmo",
  "Víctor Muñoz",
  "Nico Williams",
  "Yeremy Pino",
];

export const EXPRESS_BETS: ExpressBet[] = [
  {
    id: "ESP-SAU-J2",
    title: "España vs Arabia Saudí",
    matchId: "GH-J2-ESP-SAU",
    deadline: "2026-06-21T14:00:00Z", // 21 jun, 16:00 España (CEST = UTC+2)
    team: "ESP",
    opponent: "SAU",
    q1: { points: 2 },
    q2: { points: 4, maxGoals: 8 },
    q3: { pointsPerHit: 2, squad: SPAIN_SQUAD_2026 },
  },
];

// Resultados reales de las apuestas Express (se rellenan tras cada partido).
// Cuando se añade una entrada aquí, los puntos se aplican automáticamente
// en el ranking y en el perfil de cada usuario.
//
// Formato:
//   "<betId>": {
//     q1: "win" | "draw" | "lose",
//     q2: { teamGoals, opponentGoals },
//     q3: ["Goleador 1", "Goleador 2", ...] // tantas entradas como goles marcó el equipo principal
//   }
//
// Ejemplo (España gana 3-1 con doblete de Yamal y gol de Olmo):
//   "ESP-SAU-J2": {
//     q1: "win",
//     q2: { teamGoals: 3, opponentGoals: 1 },
//     q3: ["Lamine Yamal", "Lamine Yamal", "Dani Olmo"],
//   }
export const EXPRESS_OUTCOMES: Record<string, ExpressOutcome> = {
  // España 4 - Arabia Saudí 0 (21 jun, Atlanta).
  // Goles: Lamine Yamal, Oyarzábal x2, gol en propia de un defensa saudí.
  // Nota: el 4º gol fue en propia, así que no es atribuible a ningún jugador
  // de la convocatoria de España y por tanto nadie puede acertarlo en q3.
  "ESP-SAU-J2": {
    q1: "win",
    q2: { teamGoals: 4, opponentGoals: 0 },
    q3: ["Lamine Yamal", "Mikel Oyarzabal", "Mikel Oyarzabal", "Gol en propia (Arabia Saudí)"],
  },
};

export function getExpressBet(id: string): ExpressBet | undefined {
  return EXPRESS_BETS.find((b) => b.id === id);
}

export function getExpressOutcome(id: string): ExpressOutcome | undefined {
  return EXPRESS_OUTCOMES[id];
}

export function isExpressLocked(bet: ExpressBet): boolean {
  return Date.now() >= new Date(bet.deadline).getTime();
}

export function isExpressResolved(id: string): boolean {
  return !!EXPRESS_OUTCOMES[id];
}
