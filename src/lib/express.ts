// Apuestas Express: apuestas concretas y puntuales para un partido específico,
// con plazo limitado.
//
// Cómo añadir una nueva apuesta express: añade un objeto a EXPRESS_BETS más abajo.
// Cada pregunta genérica (no-template) va en el array `questions`, en el orden
// exacto en que debe mostrarse. Todas comparten el mismo almacén de respuestas
// (ExpressPrediction.binaryAnswers / ExpressOutcome.binaryAnswers), indexado
// por el `id` de cada pregunta.

import type { ExpressOutcome, TeamCode } from "./types";

// Resultado posible en Q1 (perspectiva del equipo principal)
export type ExpressResult = "win" | "draw" | "lose";

export const RESULT_LABEL: Record<ExpressResult, string> = {
  win:   "Ganar",
  draw:  "Empatar",
  lose:  "Perder",
};

// Pregunta binaria (2 opciones) o de opción múltiple (3+ opciones).
// La respuesta guardada es el índice de la opción elegida, como string ("0","1",...).
export interface OptionsQuestion {
  kind: "options";
  id: string;
  text: string;
  options: string[]; // 2 o más opciones excluyentes
  points: number;
}

// Pregunta cuya respuesta es un jugador de una convocatoria concreta.
// La respuesta guardada es el nombre del jugador tal cual aparece en `squad`.
export interface PlayerQuestion {
  kind: "player";
  id: string;
  text: string;
  squad: string[];
  points: number;
}

export type AnswerQuestion = OptionsQuestion | PlayerQuestion;

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
  // Genérico: preguntas en el orden exacto de visualización
  questions?: AnswerQuestion[];
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
    id: "POR-ESP-R16",
    title: "Portugal vs España · Octavos",
    matchId: "M93",
    deadline: "2026-07-06T18:00:00Z", // 20:00 ES, 1h antes del pitido
    team: "ESP",
    opponent: "POR",
    questions: [
      {
        kind: "options",
        id: "cr7-shots-on-target",
        text: "¿Cuántos tiros a puerta hará CR7?",
        options: ["0", "1", "2", "Más de dos"],
        points: 3,
      },
      {
        kind: "options",
        id: "cr7-yellow",
        text: "¿Le sacarán tarjeta amarilla a CR7?",
        options: ["Sí", "No"],
        points: 3,
      },
      {
        kind: "options",
        id: "yamal-fouls",
        text: "¿Cuántas faltas cometerán sobre Lamine Yamal?",
        options: ["0", "1", "2", "3", "Más de 3"],
        points: 3,
      },
      {
        kind: "options",
        id: "baena-goals",
        text: "¿Cuántos goles meterá Baena?",
        options: ["0", "1", "2", "Más de dos"],
        points: 3,
      },
      {
        kind: "options",
        id: "ramos-goals",
        text: "¿Cuántos goles meterá Gonçalo Ramos?",
        options: ["0", "1", "2", "Más de dos"],
        points: 3,
      },
      {
        kind: "options",
        id: "vitinha-yellow",
        text: "¿Le sacarán tarjeta amarilla a Vitinha?",
        options: ["Sí", "No"],
        points: 3,
      },
      {
        kind: "options",
        id: "extra-time",
        text: "¿Habrá prórroga?",
        options: ["Sí", "No"],
        points: 3,
      },
      {
        kind: "options",
        id: "penalty-shootout",
        text: "¿Habrá tanda de penaltis?",
        options: ["Sí", "No"],
        points: 3,
      },
    ],
  },
  {
    id: "ESP-AUT-R32",
    title: "España vs Austria · Dieciseisavos",
    matchId: "M84",
    deadline: "2026-07-02T19:00:00Z", // 21:00 ES, pitido inicial
    team: "ESP",
    opponent: "AUT",
    questions: [
      {
        kind: "player",
        id: "esp-first-sub-out",
        text: "¿Quién será el primer jugador sustituido en España?",
        squad: SPAIN_SQUAD_2026,
        points: 2,
      },
      {
        kind: "player",
        id: "esp-first-sub-in",
        text: "¿Quién será el primer suplente en entrar por España?",
        squad: SPAIN_SQUAD_2026,
        points: 2,
      },
      {
        kind: "options",
        id: "cards-1h",
        text: "¿Cuántas tarjetas habrá en el primer tiempo?",
        options: ["0", "1", "2", "Más de dos"],
        points: 2,
      },
      {
        kind: "options",
        id: "goals-2h",
        text: "¿Cuántos goles habrá en el segundo tiempo?",
        options: ["0", "1", "2", "Más de dos"],
        points: 2,
      },
      {
        kind: "options",
        id: "any-penalty",
        text: "¿Habrá algún penalty lanzado en el partido?",
        options: ["Sí", "No"],
        points: 2,
      },
      {
        kind: "options",
        id: "delafuente-outfit",
        text: "¿Se cambiará de ropa De la Fuente en el descanso?",
        options: ["Sí", "No"],
        points: 2,
      },
      {
        kind: "options",
        id: "yamal-goals",
        text: "¿Cuántos goles meterá Lamine Yamal?",
        options: ["0", "1", "2", "Más de dos"],
        points: 2,
      },
    ],
  },
  {
    id: "URU-ESP-J3",
    title: "Uruguay vs España",
    matchId: "GH-J3-URU-ESP",
    deadline: "2026-06-26T18:00:00Z", // 20:00 ES del 26 jun
    team: "ESP",
    opponent: "URU",
    questions: [
      {
        kind: "options",
        id: "uru-corners",
        text: "¿Cuántos saques de esquina hará Uruguay?",
        options: ["3 o menos", "4 o más"],
        points: 2,
      },
      {
        kind: "options",
        id: "valverde-clean",
        text: "¿Acabará Valverde el partido sin tarjetas?",
        options: ["Sí", "No"],
        points: 2,
      },
      {
        kind: "options",
        id: "oyarzabal-goal",
        text: "¿Meterá gol Oyarzábal?",
        options: ["Sí", "No"],
        points: 2,
      },
      {
        kind: "options",
        id: "esp-win",
        text: "¿Ganará España?",
        options: ["Sí", "No"],
        points: 2,
      },
      {
        kind: "options",
        id: "zubimendi-plays",
        text: "¿Jugará Zubimendi?",
        options: ["Sí", "No"],
        points: 3,
      },
      {
        kind: "options",
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
//     binaryAnswers: { "<questionId>": "<índice o nombre de jugador>" }
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
  // España 3 - Austria 0 (2 jul, Los Ángeles). Doblete Oyarzábal + gol Porro.
  "ESP-AUT-R32": {
    binaryAnswers: {
      "esp-first-sub-out": "Álex Baena",
      "esp-first-sub-in":  "Ferran Torres",
      "cards-1h":          "0", // 0 tarjetas
      "goals-2h":          "2", // 2 goles
      "any-penalty":       "1", // No
      "delafuente-outfit": "0", // Sí
      "yamal-goals":       "0", // 0 goles
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
