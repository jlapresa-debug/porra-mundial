// Enriquecimiento de partidos con resultados reales.
//
// A diferencia de un Mundial, la Champions League NO tiene un cuadro fijo
// a partir de octavos: cada ronda (play-off, octavos, cuartos, semis) se
// sortea de nuevo cuando termina la anterior. Por eso aquí no hay motor de
// resolución de posiciones tipo "1A vs 2B" — los emparejamientos de cada
// ronda eliminatoria se añaden directamente a matches.ts en cuanto la UEFA
// los sortea. Esta función solo:
//   1. Adjunta el resultado real de cada partido conocido (LEAGUE_MATCH_RESULTS
//      + KO_MATCH_RESULTS).
//   2. Calcula el "winner" de ESE partido concreto: el código del equipo que
//      gana, o "draw" si empatan. Se usa para puntuar los pronósticos.

import type { Match } from "./types";
import { LEAGUE_MATCH_RESULTS, KO_MATCH_RESULTS } from "./results";

export function enrichMatches(rawMatches: Match[]): Match[] {
  return rawMatches.map((m) => {
    const enriched: Match = { ...m };
    const results = m.stage === "league" ? LEAGUE_MATCH_RESULTS : KO_MATCH_RESULTS;
    const r = results[m.id];
    if (!r || !m.home || !m.away) return enriched;

    enriched.result = { home: r.home, away: r.away };

    if (r.home > r.away) enriched.winner = m.home;
    else if (r.away > r.home) enriched.winner = m.away;
    else enriched.winner = "draw";

    // En eliminatorias a doble partido, si la vuelta acaba en empate y hay
    // penaltis registrados, el "winner" de ESE partido concreto sigue
    // siendo "draw" (así se puntúa el resultado real del encuentro) — la
    // penaltiesWinner queda como dato informativo aparte.
    const koResult = KO_MATCH_RESULTS[m.id];
    if (koResult?.penalties) {
      enriched.result!.penaltiesWinner =
        koResult.penalties.home > koResult.penalties.away ? "home" : "away";
    }

    return enriched;
  });
}
