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

// Apuesta Express: respuestas a las 3 preguntas (todas opcionales)
// Almacenada en users/{uid}/express/{betId}
export interface ExpressPrediction {
  betId: string;
  q1?: "win" | "draw" | "lose";
  q2?: { teamGoals: number; opponentGoals: number };
  q3?: string[]; // jugadores elegidos (uno por gol predicho en Q2.teamGoals)
  updatedAt: number;
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
  points: number;
  groupHits: number; // posiciones exactas en grupos
  koHits: number;    // ganadores correctos en eliminatorias
}
