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
  matchNumber?: number; // 1-104 FIFA
  stage: MatchStage;
  group?: string;
  matchday?: number;
  kickoff: string; // ISO
  home: TeamCode | null;
  away: TeamCode | null;
  homePlaceholder?: string; // p.ej. "1A", "3 C/E/F/H/I", "Gan. M-73"
  awayPlaceholder?: string;
  venue: string;
  city?: string;
  result?: { home: number; away: number; penaltiesWinner?: "home" | "away" };
}

export interface Prediction {
  matchId: string;
  home: number;
  away: number;
  pkWinner?: "home" | "away";
  updatedAt: number;
}

export interface SpecialBets {
  champion?: TeamCode;
  runnerUp?: TeamCode;
  topScorer?: string;
  bestPlayer?: string;
  surprise?: TeamCode;
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
  // Reglas de puntuación opcionales por grupo
  scoring?: ScoringRules;
}

export interface ScoringRules {
  exact: number; // resultado exacto
  signAndDiff: number; // signo y diferencia de goles correctos
  sign: number; // solo signo correcto
  goalsOne: number; // acertar un equipo
  special: {
    champion: number;
    runnerUp: number;
    topScorer: number;
    bestPlayer: number;
    surprise: number;
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
  exact: number;
  signs: number;
}
