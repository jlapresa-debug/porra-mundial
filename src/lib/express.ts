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

// Pregunta binaria simple: dos opciones excluyentes, una de las dos es correcta.
export interface BinaryQuestion {
  id: string;                       // ej. "uru-corners"
  text: string;                     // pregunta visible
  options: [string, string];        // opción A (índice 0) / opción B (índice 1)
  points: number;
}

export interface ExpressBet {
  id: string;
  title: string;
  matchId: string;        // ID del partido al que está vinculada (de matches.ts)
  deadline: string;       // ISO UTC
  team: TeamCode;         // Equipo principal
  opponent: TeamCode;
  // Template-1: bloque clásico Q1+Q2+Q3 (resultado/marcador/goleadores)
  q1?: { points: number };
  q2?: { points: number; maxGoals: number };
  q3?: { pointsPerHit: number; squad: string[] };
  // Genérico: lista de preguntas binarias arbitrarias
  binaryQuestions?: BinaryQuestion[];
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

// Ordenadas por relevancia: la apuesta más reciente arriba.
export const EXPRESS_BETS: ExpressBet[] = [
  {
    id: "URU-ESP-J3",
    title: "Uruguay vs España",
    matchId: "GH-J3-URU-ESP",
    deadline: "2026-06-26T18:00:00Z", // 20:00 ES del 26 jun
    team: "ESP",
    opponent: "URU",
    binaryQuestions: [
      {
        id: "uru-corners",
        text: "¿Cuántos saques de esquina hará Uruguay?",
        options: ["3 o menos", "4 o más"],
        points: 2,
      },
      {
        id: "valverde-clean",
        text: "¿Acabará Valverde el partido sin tarjetas?",
        options: ["Sí", "No"],
        points: 2,
      },
      {
        id: "oyarzabal-goal",
        text: "¿Meterá gol Oyarzábal?",
        options: ["Sí", "No"],
        points: 2,
      },
      {
        id: "esp-win",
        text: "¿Ganará España?",
        options: ["Sí", "No"],
        points: 2,
      },
      {
        id: "zubimendi-plays",
        text: "¿Jugará Zubimendi?",
        options: ["Sí", "No"],
        points: 3,
      },
      {
        id: "esp-yellows",
        text: "¿Cuántas amarillas sacarán a España?",
        options: ["1 o menos", "2 o más"],
        points: 2,
      },
    ],
  },
  {
    id: "ESP-SAU-J2",
    title: "España vs Arabia Saudí",
    matchId: "GH-J2-ESP-SAU",
    deadline: "2026-06-21T14:00:00Z",
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
  "ESP-SAU-J2": {
    q1: "win",
    q2: { teamGoals: 4, opponentGoals: 0 },
    q3: ["Lamine Yamal", "Mikel Oyarzabal", "Mikel Oyarzabal", "Gol en propia (Arabia Saudí)"],
  },
  // Uruguay 0 - España 1 (26 jun, Guadalajara).
  "URU-ESP-J3": {
    binaryAnswers: {
      "uru-corners":     "0", // 3 o menos
      "valverde-clean":  "0", // Sí
      "oyarzabal-goal":  "1", // No
      "esp-win":         "0", // Sí
      "zubimendi-plays": "1", // No
      "esp-yellows":     "0", // 1 o menos
    },
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
