import type { Match, ScoringRules, SpecialBets } from "./types";

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

export function totalScore(
  groupPredictions: Record<string, string[]>,
  knockoutPredictions: Record<string, string>,
  specials: SpecialBets,
  matches: Match[],
  groupResults: Record<string, string[]> = {},
  outcome: Parameters<typeof scoreSpecials>[1] = {},
  rules: ScoringRules = DEFAULT_RULES,
): { total: number; groupHits: number; koHits: number } {
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
  return { total, groupHits, koHits };
}
