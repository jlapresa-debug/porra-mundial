export type TeamCode = string;

export interface Team {
  code: TeamCode;
  name: string;
  flag: string;
  group: string;
  confederation: "UEFA" | "CONMEBOL" | "CONCACAF" | "AFC" | "CAF" | "OFC";
}

export type MatchStage =
  | "group"
  | "round32"
  | "round16"
  | "quarter"
  | "semi"
  | "thirdplace"
  | "final";

export interface Match {
  id: string;
  matchNumber?: number;
  stage: MatchStage;
  group?: string;
  matchday?: number;
  kickoff: string; // ISO
  home: TeamCode | null;
  away: TeamCode | null;
  homePlaceholder?: string;
  awayPlaceholder?: string;
  venue: string;
  city?: string;
  result?: { home: number; away: number; penaltiesWinner?: "home" | "away" };
  winner?: TeamCode; // se rellena cuando termina el partido
}

// Apuesta de clasificación en fase de grupos (A-L)
// Almacenada en users/{uid}/predictions/GROUP_X
export interface GroupStandingPrediction {
  group: string;
  order: [TeamCode, TeamCode, TeamCode, TeamCode]; // posición 0 = 1°, 3 = 4°
  updatedAt: number;
}

// Apuesta del ganador en eliminatorias (M73-M104)
// Almacenada en users/{uid}/predictions/M73 etc.
export interface KnockoutPrediction {
  matchId: string;
  winner: TeamCode;
  updatedAt: number;
}

// Apuesta Express: respuestas a las preguntas del bet.
// Almacenada en users/{uid}/express/{betId}.
//
// Soporta dos formatos por compatibilidad:
// - Apuestas "template-1" (ESP-SAU): q1, q2, q3 en la raíz (legacy)
// - Apuestas genéricas (URU-ESP en adelante): binaryAnswers map
//
// binaryAnswers guarda, por id de pregunta, la respuesta como string:
// - Preguntas binarias/multi-opción: el índice de la opción elegida ("0","1","2"...)
// - Preguntas de jugador (selector de convocados): el nombre del jugador tal cual
//
// Ambos pueden coexistir en el mismo doc (no recomendable, pero válido).
export interface ExpressPrediction {
  betId: string;
  // Legacy ESP-SAU
  q1?: "win" | "draw" | "lose";
  q2?: { teamGoals: number; opponentGoals: number };
  q3?: string[];
  // Genérico: id de pregunta → respuesta (índice de opción o nombre de jugador)
  binaryAnswers?: Record<string, string>;
  updatedAt: number;
}

// Resultado real de una apuesta Express (se rellena cuando termina el partido)
export interface ExpressOutcome {
  q1?: "win" | "draw" | "lose";
  q2?: { teamGoals: number; opponentGoals: number };
  q3?: string[];
  binaryAnswers?: Record<string, string>;
}

export interface SpecialBets {
  champion?: TeamCode;
  runnerUp?: TeamCode;
  topScorer?: string;
  bestPlayer?: string;
  updatedAt?: number;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string | null;
  createdAt: number;
}

export interface Group {
  id: string;
  name: string;
  code: string;
  ownerId: string;
  memberIds: string[];
  createdAt: number;
  scoring?: ScoringRules;
}

export interface ScoringRules {
  // Puntos por posición exacta en grupo: [1°, 2°, 3°, 4°]
  groupPosition: [number, number, number, number];
  // Puntos por acertar el ganador en eliminatorias por ronda
  knockout: {
    round32: number;
    round16: number;
    quarter: number;
    semi: number;
    thirdplace: number;
    final: number;
  };
  // Apuestas especiales
  special: {
    champion: number;
    runnerUp: number;
    topScorer: number;
    bestPlayer: number;
  };
}

export interface ChatMessage {
  id: string;
  uid: string;
  name: string;
  text: string;
  ts: number;
}

export interface GroupMemberScore {
  uid: string;
  displayName: string;
  photoURL?: string | null;
  points: number;        // confirmados — grupos cerrados, KOs jugados, etc.
  virtualPoints: number; // proyección con el estado actual en tiempo real
  groupHits: number;     // posiciones exactas en grupos cerrados
  koHits: number;        // ganadores correctos en eliminatorias
}
