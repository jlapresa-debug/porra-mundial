export type TeamCode = string;

export interface Team {
  code: TeamCode;
  name: string;
  country: string;
}

// "league"   → fase de liga (36 equipos, tabla única, 8 jornadas)
// "playoff"  → play-off de acceso a octavos (ida y vuelta)
// "round16"  → octavos de final (ida y vuelta)
// "quarter"  → cuartos de final (ida y vuelta)
// "semi"     → semifinales (ida y vuelta)
// "final"    → final (partido único, sede neutral)
export type MatchStage = "league" | "playoff" | "round16" | "quarter" | "semi" | "final";

// Resultado de un partido para efectos de apuesta: quién gana ese
// partido concreto (no la eliminatoria a doble partido).
export type MatchPick = TeamCode | "draw";

export interface Match {
  id: string;
  matchNumber?: number; // jornada (fase de liga) — informativo
  stage: MatchStage;
  matchday?: number;   // 1-8 en fase de liga
  tie?: string;        // identificador de la eliminatoria (ej. "QF-1"), agrupa ida y vuelta
  leg?: 1 | 2;         // ida (1) o vuelta (2) en eliminatorias a doble partido
  kickoff: string;     // ISO
  home: TeamCode | null;
  away: TeamCode | null;
  homePlaceholder?: string; // texto mientras no se conoce el rival (ej. "9º-24º · sorteo")
  awayPlaceholder?: string;
  venue?: string;
  city?: string;
  result?: { home: number; away: number; penaltiesWinner?: "home" | "away" };
  winner?: MatchPick; // quién gana ESTE partido concreto ("draw" si empate)
}

// Apuesta del resultado de un partido (fase de liga o cualquier eliminatoria)
// Almacenada en users/{uid}/predictions/{matchId}
export interface MatchPrediction {
  matchId: string;
  pick: MatchPick;
  updatedAt: number;
}

// Apuesta Express: respuestas a las preguntas del bet.
// Almacenada en users/{uid}/express/{betId}.
//
// binaryAnswers guarda, por id de pregunta, la respuesta como string:
// - Preguntas binarias/multi-opción: el índice de la opción elegida ("0","1","2"...)
// - Preguntas de jugador (selector de convocados): el nombre del jugador tal cual
export interface ExpressPrediction {
  betId: string;
  q1?: "win" | "draw" | "lose";
  q2?: { teamGoals: number; opponentGoals: number };
  q3?: string[];
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
  // Apuesta "Fase 1": los 8 equipos que el usuario cree que acabarán
  // clasificados en los 8 primeros puestos de la fase de liga (sin
  // importar el orden). Siempre 8 códigos, o ausente si no ha apostado.
  top8?: TeamCode[];
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
  // Puntos por acertar el resultado (ganador o empate) de un partido, por fase
  points: {
    league: number;
    playoff: number;
    round16: number;
    quarter: number;
    semi: number;
    final: number;
  };
  // Apuestas especiales
  special: {
    champion: number;
    runnerUp: number;
    topScorer: number;
    top8PerTeam: number; // puntos por cada equipo acertado en la apuesta "Fase 1"
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
  points: number;      // puntos totales confirmados
  leagueHits: number;  // aciertos en la fase de liga
  koHits: number;       // aciertos en eliminatorias
  top8Hits: number;    // equipos acertados en la apuesta "Fase 1"
}
