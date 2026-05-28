import type { Match, Prediction, ScoringRules, SpecialBets } from "./types";

export const DEFAULT_RULES: ScoringRules = {
  exact: 5,
  signAndDiff: 3,
  sign: 2,
  goalsOne: 1,
  special: {
    champion: 25,
    runnerUp: 12,
    topScorer: 15,
    bestPlayer: 10,
    surprise: 8,
  },
};

export function scoreForMatch(match: Match, p: Prediction, rules: ScoringRules = DEFAULT_RULES): number {
  if (!match.result) return 0;
  const r = match.result;

  if (p.home === r.home && p.away === r.away) return rules.exact;

  const predSign = Math.sign(p.home - p.away);
  const realSign = Math.sign(r.home - r.away);
  const predDiff = p.home - p.away;
  const realDiff = r.home - r.away;

  if (predSign === realSign && predDiff === realDiff) return rules.signAndDiff;
  if (predSign === realSign) return rules.sign;

  if (p.home === r.home || p.away === r.away) return rules.goalsOne;
  return 0;
}

export function scoreSpecials(
  s: SpecialBets,
  outcome: {
    champion?: string;
    runnerUp?: string;
    topScorer?: string;
    bestPlayer?: string;
    surprise?: string;
  },
  rules: ScoringRules = DEFAULT_RULES,
): number {
  let pts = 0;
  if (s.champion && outcome.champion && s.champion === outcome.champion) pts += rules.special.champion;
  if (s.runnerUp && outcome.runnerUp && s.runnerUp === outcome.runnerUp) pts += rules.special.runnerUp;
  if (s.topScorer && outcome.topScorer && s.topScorer.toLowerCase() === outcome.topScorer.toLowerCase())
    pts += rules.special.topScorer;
  if (s.bestPlayer && outcome.bestPlayer && s.bestPlayer.toLowerCase() === outcome.bestPlayer.toLowerCase())
    pts += rules.special.bestPlayer;
  if (s.surprise && outcome.surprise && s.surprise === outcome.surprise) pts += rules.special.surprise;
  return pts;
}

export function totalScore(
  predictions: Record<string, Prediction>,
  specials: SpecialBets,
  matches: Match[],
  outcome: Parameters<typeof scoreSpecials>[1] = {},
  rules: ScoringRules = DEFAULT_RULES,
): { total: number; exact: number; signs: number } {
  let total = 0;
  let exact = 0;
  let signs = 0;
  for (const m of matches) {
    const p = predictions[m.id];
    if (!p || !m.result) continue;
    const pts = scoreForMatch(m, p, rules);
    total += pts;
    if (pts === rules.exact) exact += 1;
    else if (pts > 0) signs += 1;
  }
  total += scoreSpecials(specials, outcome, rules);
  return { total, exact, signs };
}
