import type { ExpressOutcome, ExpressPrediction, Match, ScoringRules, SpecialBets } from "./types";
import { EXPRESS_BETS, type ExpressBet } from "./express";

export const DEFAULT_RULES: ScoringRules = {
  // Puntos por posición exacta en grupo: 1°=5, 2°=3, 3°=2, 4°=1
  groupPosition: [5, 3, 2, 1],
  // Puntos por acertar el ganador en eliminatorias
  knockout: {
    round32:    2,
    round16:    3,
    quarter:    5,
    semi:       7,
    thirdplace: 3,
    final:      10,
  },
  special: {
    champion:   25,
    runnerUp:   12,
    topScorer:  15,
    bestPlayer: 10,
  },
};

// Puntos por clasificación de grupo
export function scoreGroupStanding(
  predicted: string[],
  actual: string[],
  rules: ScoringRules = DEFAULT_RULES,
): number {
  let pts = 0;
  for (let i = 0; i < 4; i++) {
    if (predicted[i] && actual[i] && predicted[i] === actual[i]) {
      pts += rules.groupPosition[i];
    }
  }
  return pts;
}

// Puntos por acertar el ganador de un partido eliminatorio
export function scoreKnockoutWinner(
  match: Match,
  predictedWinner: string,
  rules: ScoringRules = DEFAULT_RULES,
): number {
  if (!match.winner) return 0;
  if (match.winner !== predictedWinner) return 0;
  const pts = rules.knockout[match.stage as keyof typeof rules.knockout];
  return pts ?? 0;
}

export function scoreSpecials(
  s: SpecialBets,
  outcome: {
    champion?: string;
    runnerUp?: string;
    topScorer?: string;
    bestPlayer?: string;
  },
  rules: ScoringRules = DEFAULT_RULES,
): number {
  let pts = 0;
  if (s.champion && outcome.champion && s.champion === outcome.champion)
    pts += rules.special.champion;
  if (s.runnerUp && outcome.runnerUp && s.runnerUp === outcome.runnerUp)
    pts += rules.special.runnerUp;
  if (s.topScorer && outcome.topScorer &&
      s.topScorer.toLowerCase() === outcome.topScorer.toLowerCase())
    pts += rules.special.topScorer;
  if (s.bestPlayer && outcome.bestPlayer &&
      s.bestPlayer.toLowerCase() === outcome.bestPlayer.toLowerCase())
    pts += rules.special.bestPlayer;
  return pts;
}

export function scoreExpressBet(
  bet: ExpressBet,
  prediction: ExpressPrediction | undefined,
  outcome: ExpressOutcome | undefined,
): { total: number; q1: number; q2: number; q3: number; binary: Record<string, number> } {
  const empty = { total: 0, q1: 0, q2: 0, q3: 0, binary: {} as Record<string, number> };
  if (!prediction || !outcome) return empty;

  let q1Pts = 0;
  let q2Pts = 0;
  let q3Pts = 0;
  const binary: Record<string, number> = {};

  // Template-1: Q1 / Q2 / Q3
  if (bet.q1 && prediction.q1 && outcome.q1 && prediction.q1 === outcome.q1) {
    q1Pts = bet.q1.points;
  }
  if (
    bet.q2 && prediction.q2 && outcome.q2 &&
    prediction.q2.teamGoals === outcome.q2.teamGoals &&
    prediction.q2.opponentGoals === outcome.q2.opponentGoals
  ) {
    q2Pts = bet.q2.points;
  }
  if (bet.q3 && prediction.q3 && outcome.q3 && prediction.q3.length > 0) {
    const actual = [...outcome.q3];
    for (const guess of prediction.q3) {
      const idx = actual.indexOf(guess);
      if (idx !== -1) {
        q3Pts += bet.q3.pointsPerHit;
        actual.splice(idx, 1);
      }
    }
  }

  // Genérico: preguntas binarias
  if (bet.binaryQuestions) {
    for (const q of bet.binaryQuestions) {
      const guess = prediction.binaryAnswers?.[q.id];
      const truth = outcome.binaryAnswers?.[q.id];
      if (guess !== undefined && truth !== undefined && guess === truth) {
        binary[q.id] = q.points;
      } else {
        binary[q.id] = 0;
      }
    }
  }

  const binarySum = Object.values(binary).reduce((a, b) => a + b, 0);
  return {
    total: q1Pts + q2Pts + q3Pts + binarySum,
    q1: q1Pts,
    q2: q2Pts,
    q3: q3Pts,
    binary,
  };
}

export function totalScore(
  groupPredictions: Record<string, string[]>,
  knockoutPredictions: Record<string, string>,
  specials: SpecialBets,
  matches: Match[],
  groupResults: Record<string, string[]> = {},
  outcome: Parameters<typeof scoreSpecials>[1] = {},
  rules: ScoringRules = DEFAULT_RULES,
  expressPredictions: Record<string, ExpressPrediction> = {},
  expressOutcomes: Record<string, ExpressOutcome> = {},
): { total: number; groupHits: number; koHits: number; expressHits: number } {
  let total = 0;
  let groupHits = 0;
  let koHits = 0;

  // Grupos
  for (const [group, predicted] of Object.entries(groupPredictions)) {
    const actual = groupResults[group];
    if (!actual) continue;
    const pts = scoreGroupStanding(predicted, actual, rules);
    total += pts;
    groupHits += predicted.filter((t, i) => actual[i] === t).length;
  }

  // Eliminatorias
  for (const match of matches) {
    if (match.stage === "group") continue;
    const winner = knockoutPredictions[match.id];
    if (!winner || !match.winner) continue;
    const pts = scoreKnockoutWinner(match, winner, rules);
    total += pts;
    if (pts > 0) koHits += 1;
  }

  total += scoreSpecials(specials, outcome, rules);

  // Express bets
  let expressHits = 0;
  for (const bet of EXPRESS_BETS) {
    const pred = expressPredictions[bet.id];
    const out = expressOutcomes[bet.id];
    if (!pred || !out) continue;
    const { total: pts } = scoreExpressBet(bet, pred, out);
    total += pts;
    if (pts > 0) expressHits += 1;
  }

  return { total, groupHits, koHits, expressHits };
}
