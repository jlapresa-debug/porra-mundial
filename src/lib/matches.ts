import type { Match } from "./types";
import { TEAMS_BY_GROUP } from "./teams";

// Genera los 72 partidos de la fase de grupos del Mundial 2026 (12 grupos x 6 partidos).
// Las fechas reales se cargarán del calendario oficial — aquí usamos un programa plausible
// distribuido entre el 11/06/2026 y el 27/06/2026 (rango oficial del torneo).

const VENUES = [
  "Estadio Azteca, CDMX",
  "MetLife Stadium, Nueva Jersey",
  "SoFi Stadium, Los Ángeles",
  "AT&T Stadium, Dallas",
  "Mercedes-Benz Stadium, Atlanta",
  "BMO Field, Toronto",
  "BC Place, Vancouver",
  "Estadio BBVA, Monterrey",
  "Estadio Akron, Guadalajara",
  "NRG Stadium, Houston",
  "Hard Rock Stadium, Miami",
  "Lincoln Financial Field, Filadelfia",
  "Levi's Stadium, San Francisco",
  "Lumen Field, Seattle",
  "Gillette Stadium, Boston",
  "Arrowhead Stadium, Kansas City",
];

const KICKOFF_HOURS = ["13:00", "16:00", "19:00", "22:00"];

function pickVenue(i: number) {
  return VENUES[i % VENUES.length];
}

function buildGroupMatches(): Match[] {
  const matches: Match[] = [];
  const startDate = new Date("2026-06-11T13:00:00Z");
  let venueIdx = 0;

  const groups = Object.keys(TEAMS_BY_GROUP).sort();

  // 3 jornadas. En cada jornada cada equipo juega una vez.
  // Round robin con rotación: jornada 1: A-B / C-D, jornada 2: A-C / B-D, jornada 3: A-D / B-C
  const pairings = [
    [[0, 1], [2, 3]],
    [[0, 2], [1, 3]],
    [[0, 3], [1, 2]],
  ];

  groups.forEach((g, gi) => {
    const teams = TEAMS_BY_GROUP[g];
    pairings.forEach((pairs, jornadaIdx) => {
      pairs.forEach(([h, a], pi) => {
        const dayOffset = jornadaIdx * 4 + Math.floor(gi / 4);
        const hourIdx = (gi * 2 + pi) % KICKOFF_HOURS.length;
        const kickoff = new Date(startDate);
        kickoff.setUTCDate(startDate.getUTCDate() + dayOffset);
        const [hh, mm] = KICKOFF_HOURS[hourIdx].split(":");
        kickoff.setUTCHours(Number(hh), Number(mm), 0, 0);

        matches.push({
          id: `G${g}-J${jornadaIdx + 1}-${teams[h].code}-${teams[a].code}`,
          stage: "group",
          group: g,
          matchday: jornadaIdx + 1,
          kickoff: kickoff.toISOString(),
          home: teams[h].code,
          away: teams[a].code,
          venue: pickVenue(venueIdx++),
        });
      });
    });
  });

  return matches.sort((a, b) => a.kickoff.localeCompare(b.kickoff));
}

function buildKnockoutPlaceholders(): Match[] {
  const ko: Match[] = [];
  const start = new Date("2026-06-28T16:00:00Z");

  const make = (
    id: string,
    stage: Match["stage"],
    daysOffset: number,
    hour: string,
    venueIdx: number,
  ): Match => {
    const k = new Date(start);
    k.setUTCDate(start.getUTCDate() + daysOffset);
    const [hh, mm] = hour.split(":");
    k.setUTCHours(Number(hh), Number(mm), 0, 0);
    return {
      id,
      stage,
      kickoff: k.toISOString(),
      home: null,
      away: null,
      venue: pickVenue(venueIdx),
    };
  };

  // 16avos (32 a 16) — 16 partidos
  for (let i = 0; i < 16; i++) {
    ko.push(make(`R32-${i + 1}`, "round32", Math.floor(i / 4), KICKOFF_HOURS[i % 4], i));
  }
  // Octavos — 8 partidos
  for (let i = 0; i < 8; i++) {
    ko.push(make(`R16-${i + 1}`, "round16", 6 + Math.floor(i / 2), KICKOFF_HOURS[i % 4], i));
  }
  // Cuartos — 4
  for (let i = 0; i < 4; i++) {
    ko.push(make(`QF-${i + 1}`, "quarter", 12 + Math.floor(i / 2), KICKOFF_HOURS[i % 4], i));
  }
  // Semis — 2
  ko.push(make("SF-1", "semi", 16, "20:00", 0));
  ko.push(make("SF-2", "semi", 17, "20:00", 1));
  // 3er puesto
  ko.push(make("3RD", "thirdplace", 22, "16:00", 2));
  // Final
  ko.push(make("FINAL", "final", 23, "20:00", 3));

  return ko;
}

export const ALL_MATCHES: Match[] = [...buildGroupMatches(), ...buildKnockoutPlaceholders()];

export function getMatch(id: string): Match | undefined {
  return ALL_MATCHES.find((m) => m.id === id);
}

export function matchesByMatchday(): { key: string; label: string; matches: Match[] }[] {
  const buckets = new Map<string, Match[]>();
  for (const m of ALL_MATCHES) {
    let key: string;
    let label: string;
    if (m.stage === "group") {
      key = `group-${m.matchday}`;
      label = `Fase de grupos · Jornada ${m.matchday}`;
    } else {
      key = m.stage;
      label = stageLabel(m.stage);
    }
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(m);
  }
  return Array.from(buckets.entries()).map(([key, matches]) => ({
    key,
    label:
      key.startsWith("group-")
        ? `Fase de grupos · Jornada ${matches[0].matchday}`
        : stageLabel(matches[0].stage),
    matches,
  }));
}

export function stageLabel(stage: Match["stage"]): string {
  switch (stage) {
    case "group": return "Fase de grupos";
    case "round32": return "Dieciseisavos";
    case "round16": return "Octavos";
    case "quarter": return "Cuartos";
    case "semi": return "Semifinales";
    case "thirdplace": return "Tercer puesto";
    case "final": return "Final";
  }
}
