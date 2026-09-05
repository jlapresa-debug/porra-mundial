import type { ExpressOutcome, ExpressPrediction, Match, MatchPick, ScoringRules, SpecialBets } from "./types";
import { EXPRESS_BETS, type ExpressBet } from "./express";

export const DEFAULT_RULES: ScoringRules = {
  // Puntos por acertar el resultado (1/X/2) de un partido, por fase
  points: {
    league:   2,
    playoff:  3,
    round16:  4,
    quarter:  6,
    semi:     8,
    final:    12,
  },
  special: {
    champion:    25,
    runnerUp:    12,
    topScorer:   15,
    top8PerTeam: 5,
  },
};

// Puntos por acertar el resultado de un partido concreto (fase de liga o eliminatoria)
export function scoreMatchPick(
  match: Match,
  predictedPick: MatchPick,
  rules: ScoringRules = DEFAULT_RULES,
): number {
  if (!match.winner) return 0;
  if (match.winner !== predictedPick) return 0;
  return rules.points[match.stage] ?? 0;
}

export function scoreSpecials(
  s: SpecialBets,
  outcome: { champion?: string; runnerUp?: string; topScorer?: string; top8?: string[] },
  rules: ScoringRules = DEFAULT_RULES,
): { total: number; top8Hits: number } {
  let pts = 0;
  if (s.champion && outcome.champion && s.champion === outcome.champion)
    pts += rules.special.champion;
  if (s.runnerUp && outcome.runnerUp && s.runnerUp === outcome.runnerUp)
    pts += rules.special.runnerUp;
  if (s.topScorer && outcome.topScorer &&
      s.topScorer.toLowerCase() === outcome.topScorer.toLowerCase())
    pts += rules.special.topScorer;

  let top8Hits = 0;
  if (s.top8 && outcome.top8) {
    for (const team of s.top8) {
      if (outcome.top8.includes(team)) top8Hits += 1;
    }
    pts += top8Hits * rules.special.top8PerTeam;
  }

  return { total: pts, top8Hits };
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

  for (const q of bet.questions ?? []) {
    const guess = prediction.binaryAnswers?.[q.id];
    const truth = outcome.binaryAnswers?.[q.id];
    if (guess !== undefined && truth !== undefined && guess === truth) {
      binary[q.id] = q.points;
    } else {
      binary[q.id] = 0;
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
  matchPredictions: Record<string, MatchPick>,
  specials: SpecialBets,
  matches: Match[],
  outcome: Parameters<typeof scoreSpecials>[1] = {},
  rules: ScoringRules = DEFAULT_RULES,
  expressPredictions: Record<string, ExpressPrediction> = {},
  expressOutcomes: Record<string, ExpressOutcome> = {},
): { total: number; leagueHits: number; koHits: number; top8Hits: number; expressHits: number } {
  let total = 0;
  let leagueHits = 0;
  let koHits = 0;

  for (const match of matches) {
    const pick = matchPredictions[match.id];
    if (!pick || !match.winner) continue;
    const pts = scoreMatchPick(match, pick, rules);
    total += pts;
    if (pts > 0) {
      if (match.stage === "league") leagueHits += 1;
      else koHits += 1;
    }
  }

  const specialsResult = scoreSpecials(specials, outcome, rules);
  total += specialsResult.total;

  let expressHits = 0;
  for (const bet of EXPRESS_BETS) {
    const pred = expressPredictions[bet.id];
    const out = expressOutcomes[bet.id];
    if (!pred || !out) continue;
    const { total: pts } = scoreExpressBet(bet, pred, out);
    total += pts;
    if (pts > 0) expressHits += 1;
  }

  return { total, leagueHits, koHits, top8Hits: specialsResult.top8Hits, expressHits };
}
