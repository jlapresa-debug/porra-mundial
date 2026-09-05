// Apuestas Express: apuestas concretas y puntuales para un partido específico,
// con plazo limitado.
//
// Cómo añadir una nueva apuesta express: añade un objeto a EXPRESS_BETS más
// abajo. Cada pregunta genérica va en el array `questions`, en el orden
// exacto en que debe mostrarse. Todas comparten el mismo almacén de
// respuestas (ExpressPrediction.binaryAnswers / ExpressOutcome.binaryAnswers),
// indexado por el `id` de cada pregunta.
//
// Si una pregunta necesita un selector de jugador (ej. "¿quién marca
// primero?"), monta un array con la convocatoria/plantilla de los equipos
// implicados en ese partido concreto (buscar en la web si hace falta) y
// pásalo como `squad` en una pregunta de tipo "player".

import type { ExpressOutcome, TeamCode } from "./types";

// Resultado posible en Q1 (perspectiva del equipo principal) — bloque
// "template" clásico, heredado y aún soportado por compatibilidad.
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
  display?: "buttons" | "select"; // "buttons" (por defecto) o desplegable
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

// Pregunta numérica: selector de un valor entero entre min y max.
// La respuesta guardada es el número como string. Si `maxLabel` está
// definido, la última opción del selector se muestra con ese texto
// (ej. "10 o más") aunque el valor almacenado sea `max`.
export interface NumberQuestion {
  kind: "number";
  id: string;
  text: string;
  min: number;
  max: number;
  maxLabel?: string;
  points: number;
}

export type AnswerQuestion = OptionsQuestion | PlayerQuestion | NumberQuestion;

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

// Sin apuestas Express activas todavía — se añaden partido a partido
// según se acerque cada fecha destacada de la Champions.
export const EXPRESS_BETS: ExpressBet[] = [];

// Resultados reales de las apuestas Express (se rellenan tras cada partido).
export const EXPRESS_OUTCOMES: Record<string, ExpressOutcome> = {};

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
