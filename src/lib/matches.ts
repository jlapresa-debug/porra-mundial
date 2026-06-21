import type { Match } from "./types";

// Mundial 2026 — 104 partidos: 72 fase de grupos + 16 R32 + 8 octavos + 4 cuartos + 2 semis + 3º puesto + final.
// Calendario oficial de FIFA + sorteo del 5 de diciembre de 2025.
//
// Horarios: hora local de la sede (México no aplica DST desde 2022, USA/Canadá sí en verano).
// Fuente: NBC Sports / FIFA. Las horas y sedes pueden sufrir cambios oficiales; verificar antes de cada jornada.

// Husos horarios estándar de verano (DST activo en USA/Canadá; México fijo UTC-6).
const CITY_TZ_OFFSET: Record<string, number> = {
  "Mexico City": -6,
  "Guadalajara": -6,
  "Monterrey": -6,
  "Toronto": -4,
  "Vancouver": -7,
  "Los Angeles": -7,
  "San Francisco Bay Area": -7,
  "Seattle": -7,
  "Dallas": -5,
  "Houston": -5,
  "Kansas City": -5,
  "Atlanta": -4,
  "Miami": -4,
  "New York/New Jersey": -4,
  "Philadelphia": -4,
  "Boston": -4,
};

function toUTCISO(dateLocal: string, timeLocal: string, city: string): string {
  const offset = CITY_TZ_OFFSET[city] ?? -5;
  const [y, mo, d] = dateLocal.split("-").map(Number);
  const [h, mn] = timeLocal.split(":").map(Number);
  // UTC = local - offset (offset es negativo, así que restar implica sumar)
  return new Date(Date.UTC(y, mo - 1, d, h - offset, mn)).toISOString();
}

// ───────────────────────────── FASE DE GRUPOS (72) ─────────────────────────────
// Tuplas: [matchNo, date, time, home, away, city, venue, group, matchday]
type GroupRow = [number, string, string, string, string, string, string, string, number];

const GROUP_ROWS: GroupRow[] = [
  // ── Jornada 1 ─────────────────────────────────────────────────────────────
  [ 1, "2026-06-11", "15:00", "MEX", "RSA", "Mexico City",            "Estadio Azteca",            "A", 1],
  [ 2, "2026-06-11", "22:00", "KOR", "CZE", "Guadalajara",            "Estadio Akron",             "A", 1],
  [ 3, "2026-06-12", "15:00", "CAN", "BIH", "Toronto",                "BMO Field",                 "B", 1],
  [ 4, "2026-06-12", "21:00", "USA", "PAR", "Los Angeles",            "SoFi Stadium",              "D", 1],
  [ 5, "2026-06-13", "15:00", "QAT", "SUI", "San Francisco Bay Area", "Levi's Stadium",            "B", 1],
  [ 6, "2026-06-13", "18:00", "BRA", "MAR", "New York/New Jersey",    "MetLife Stadium",           "C", 1],
  [ 7, "2026-06-13", "21:00", "HAI", "SCO", "Boston",                 "Gillette Stadium",          "C", 1],
  [ 8, "2026-06-13", "18:00", "AUS", "TUR", "Vancouver",              "BC Place",                  "D", 1],
  [ 9, "2026-06-14", "13:00", "GER", "CUW", "Houston",                "NRG Stadium",               "E", 1],
  [10, "2026-06-14", "19:00", "CIV", "ECU", "Philadelphia",           "Lincoln Financial Field",   "E", 1],
  [11, "2026-06-14", "16:00", "NED", "JPN", "Dallas",                 "AT&T Stadium",              "F", 1],
  [12, "2026-06-14", "22:00", "SWE", "TUN", "Monterrey",              "Estadio BBVA",              "F", 1],
  [13, "2026-06-15", "21:00", "IRN", "NZL", "Los Angeles",            "SoFi Stadium",              "G", 1],
  [14, "2026-06-15", "15:00", "BEL", "EGY", "Seattle",                "Lumen Field",               "G", 1],
  [15, "2026-06-15", "12:00", "ESP", "CPV", "Atlanta",                "Mercedes-Benz Stadium",     "H", 1],
  [16, "2026-06-15", "18:00", "SAU", "URU", "Miami",                  "Hard Rock Stadium",         "H", 1],
  [17, "2026-06-16", "15:00", "FRA", "SEN", "New York/New Jersey",    "MetLife Stadium",           "I", 1],
  [18, "2026-06-16", "18:00", "IRQ", "NOR", "Boston",                 "Gillette Stadium",          "I", 1],
  [19, "2026-06-16", "21:00", "ARG", "ALG", "Kansas City",            "Arrowhead Stadium",         "J", 1],
  [20, "2026-06-16", "18:00", "AUT", "JOR", "San Francisco Bay Area", "Levi's Stadium",            "J", 1],
  [21, "2026-06-17", "13:00", "POR", "COD", "Houston",                "NRG Stadium",               "K", 1],
  [22, "2026-06-17", "22:00", "UZB", "COL", "Mexico City",            "Estadio Azteca",            "K", 1],
  [23, "2026-06-17", "16:00", "ENG", "CRO", "Dallas",                 "AT&T Stadium",              "L", 1],
  [24, "2026-06-17", "19:00", "GHA", "PAN", "Toronto",                "BMO Field",                 "L", 1],

  // ── Jornada 2 ─────────────────────────────────────────────────────────────
  [25, "2026-06-18", "12:00", "CZE", "RSA", "Atlanta",                "Mercedes-Benz Stadium",     "A", 2],
  [26, "2026-06-18", "21:00", "MEX", "KOR", "Guadalajara",            "Estadio Akron",             "A", 2],
  [27, "2026-06-18", "15:00", "SUI", "BIH", "Los Angeles",            "SoFi Stadium",              "B", 2],
  [28, "2026-06-18", "18:00", "CAN", "QAT", "Vancouver",              "BC Place",                  "B", 2],
  [29, "2026-06-19", "18:00", "SCO", "MAR", "Boston",                 "Gillette Stadium",          "C", 2],
  [30, "2026-06-19", "21:00", "BRA", "HAI", "Philadelphia",           "Lincoln Financial Field",   "C", 2],
  [31, "2026-06-19", "15:00", "USA", "AUS", "Seattle",                "Lumen Field",               "D", 2],
  [32, "2026-06-19", "18:00", "TUR", "PAR", "San Francisco Bay Area", "Levi's Stadium",            "D", 2],
  [33, "2026-06-20", "16:00", "GER", "CIV", "Toronto",                "BMO Field",                 "E", 2],
  [34, "2026-06-20", "20:00", "ECU", "CUW", "Kansas City",            "Arrowhead Stadium",         "E", 2],
  [35, "2026-06-20", "13:00", "NED", "SWE", "Houston",                "NRG Stadium",               "F", 2],
  [36, "2026-06-20", "22:00", "TUN", "JPN", "Monterrey",              "Estadio BBVA",              "F", 2],
  [37, "2026-06-21", "15:00", "BEL", "IRN", "Los Angeles",            "SoFi Stadium",              "G", 2],
  [38, "2026-06-21", "21:00", "NZL", "EGY", "Vancouver",              "BC Place",                  "G", 2],
  [39, "2026-06-21", "12:00", "ESP", "SAU", "Atlanta",                "Mercedes-Benz Stadium",     "H", 2],
  [40, "2026-06-21", "18:00", "URU", "CPV", "Miami",                  "Hard Rock Stadium",         "H", 2],
  [41, "2026-06-22", "17:00", "FRA", "IRQ", "Philadelphia",           "Lincoln Financial Field",   "I", 2],
  [42, "2026-06-22", "20:00", "NOR", "SEN", "New York/New Jersey",    "MetLife Stadium",           "I", 2],
  [43, "2026-06-22", "13:00", "ARG", "AUT", "Dallas",                 "AT&T Stadium",              "J", 2],
  [44, "2026-06-22", "18:00", "JOR", "ALG", "San Francisco Bay Area", "Levi's Stadium",            "J", 2],
  [45, "2026-06-23", "13:00", "POR", "UZB", "Houston",                "NRG Stadium",               "K", 2],
  [46, "2026-06-23", "22:00", "COL", "COD", "Guadalajara",            "Estadio Akron",             "K", 2],
  [47, "2026-06-23", "16:00", "ENG", "GHA", "Boston",                 "Gillette Stadium",          "L", 2],
  [48, "2026-06-23", "19:00", "PAN", "CRO", "Toronto",                "BMO Field",                 "L", 2],

  // ── Jornada 3 (partidos simultáneos por grupo) ────────────────────────────
  [49, "2026-06-24", "21:00", "CZE", "MEX", "Mexico City",            "Estadio Azteca",            "A", 3],
  [50, "2026-06-24", "21:00", "RSA", "KOR", "Monterrey",              "Estadio BBVA",              "A", 3],
  [51, "2026-06-24", "15:00", "SUI", "CAN", "Vancouver",              "BC Place",                  "B", 3],
  [52, "2026-06-24", "15:00", "BIH", "QAT", "Seattle",                "Lumen Field",               "B", 3],
  [53, "2026-06-24", "18:00", "SCO", "BRA", "Miami",                  "Hard Rock Stadium",         "C", 3],
  [54, "2026-06-24", "18:00", "MAR", "HAI", "Atlanta",                "Mercedes-Benz Stadium",     "C", 3],
  [55, "2026-06-25", "18:00", "TUR", "USA", "Los Angeles",            "SoFi Stadium",              "D", 3],
  [56, "2026-06-25", "18:00", "PAR", "AUS", "San Francisco Bay Area", "Levi's Stadium",            "D", 3],
  [57, "2026-06-25", "16:00", "ECU", "GER", "New York/New Jersey",    "MetLife Stadium",           "E", 3],
  [58, "2026-06-25", "16:00", "CUW", "CIV", "Philadelphia",           "Lincoln Financial Field",   "E", 3],
  [59, "2026-06-25", "19:00", "JPN", "SWE", "Dallas",                 "AT&T Stadium",              "F", 3],
  [60, "2026-06-25", "19:00", "TUN", "NED", "Kansas City",            "Arrowhead Stadium",         "F", 3],
  [61, "2026-06-26", "19:00", "EGY", "IRN", "Seattle",                "Lumen Field",               "G", 3],
  [62, "2026-06-26", "19:00", "NZL", "BEL", "Vancouver",              "BC Place",                  "G", 3],
  [63, "2026-06-26", "20:00", "CPV", "SAU", "Houston",                "NRG Stadium",               "H", 3],
  [64, "2026-06-26", "20:00", "URU", "ESP", "Guadalajara",            "Estadio Akron",             "H", 3],
  [65, "2026-06-26", "15:00", "NOR", "FRA", "Boston",                 "Gillette Stadium",          "I", 3],
  [66, "2026-06-26", "15:00", "SEN", "IRQ", "Toronto",                "BMO Field",                 "I", 3],
  [67, "2026-06-27", "20:00", "ALG", "AUT", "Kansas City",            "Arrowhead Stadium",         "J", 3],
  [68, "2026-06-27", "20:00", "JOR", "ARG", "Dallas",                 "AT&T Stadium",              "J", 3],
  [69, "2026-06-27", "19:30", "COL", "POR", "Miami",                  "Hard Rock Stadium",         "K", 3],
  [70, "2026-06-27", "19:30", "COD", "UZB", "Atlanta",                "Mercedes-Benz Stadium",     "K", 3],
  [71, "2026-06-27", "17:00", "PAN", "ENG", "New York/New Jersey",    "MetLife Stadium",           "L", 3],
  [72, "2026-06-27", "17:00", "CRO", "GHA", "Philadelphia",           "Lincoln Financial Field",   "L", 3],
];

const groupMatches: Match[] = GROUP_ROWS.map(([no, date, time, home, away, city, venue, group, md]) => ({
  id: `G${group}-J${md}-${home}-${away}`,
  matchNumber: no,
  stage: "group",
  group,
  matchday: md,
  kickoff: toUTCISO(date, time, city),
  home,
  away,
  venue,
  city,
}));

// ───────────────────────────── ELIMINATORIAS (32) ─────────────────────────────
// Los emparejamientos son los del cuadro oficial FIFA. Los nombres de los rivales
// se rellenarán al avanzar el torneo.
type KORow = [
  number,                // matchNumber FIFA
  Match["stage"],
  string,                // date
  string,                // local time
  string,                // homePlaceholder
  string,                // awayPlaceholder
  string,                // city
  string,                // venue
];

const KO_ROWS: KORow[] = [
  // ── Dieciseisavos (Round of 32) — 16 partidos
  [73, "round32", "2026-06-28", "15:00", "1A", "2B",            "Los Angeles",            "SoFi Stadium"],
  [74, "round32", "2026-06-29", "16:30", "1E", "3 A/B/C/D/F",   "Boston",                 "Gillette Stadium"],
  [75, "round32", "2026-06-29", "21:00", "1F", "2C",            "Monterrey",              "Estadio BBVA"],
  [76, "round32", "2026-06-29", "13:00", "1C", "2F",            "Houston",                "NRG Stadium"],
  [77, "round32", "2026-06-30", "17:00", "1I", "3 C/D/F/G/H",   "New York/New Jersey",    "MetLife Stadium"],
  [78, "round32", "2026-06-30", "13:00", "2E", "2I",            "Dallas",                 "AT&T Stadium"],
  [79, "round32", "2026-06-30", "21:00", "1A", "3 C/E/F/H/I",   "Mexico City",            "Estadio Azteca"],
  [80, "round32", "2026-07-01", "12:00", "1L", "3 E/H/I/J/K",   "Atlanta",                "Mercedes-Benz Stadium"],
  [81, "round32", "2026-07-01", "20:00", "1D", "3 B/E/F/I/J",   "San Francisco Bay Area", "Levi's Stadium"],
  [82, "round32", "2026-07-01", "16:00", "1G", "3 A/E/H/I/J",   "Seattle",                "Lumen Field"],
  [83, "round32", "2026-07-02", "19:00", "2K", "2L",            "Toronto",                "BMO Field"],
  [84, "round32", "2026-07-02", "15:00", "1H", "2J",            "Los Angeles",            "SoFi Stadium"],
  [85, "round32", "2026-07-02", "23:00", "1B", "3 E/F/G/I/J",   "Vancouver",              "BC Place"],
  [86, "round32", "2026-07-03", "18:00", "1J", "2H",            "Miami",                  "Hard Rock Stadium"],
  [87, "round32", "2026-07-03", "21:30", "1K", "3 D/E/I/J/L",   "Kansas City",            "Arrowhead Stadium"],
  [88, "round32", "2026-07-03", "14:00", "2D", "2G",            "Dallas",                 "AT&T Stadium"],

  // ── Octavos (Round of 16) — 8 partidos
  [89, "round16", "2026-07-04", "17:00", "Gan. M-74", "Gan. M-77", "Philadelphia",        "Lincoln Financial Field"],
  [90, "round16", "2026-07-04", "13:00", "Gan. M-73", "Gan. M-75", "Houston",             "NRG Stadium"],
  [91, "round16", "2026-07-05", "16:00", "Gan. M-76", "Gan. M-78", "New York/New Jersey", "MetLife Stadium"],
  [92, "round16", "2026-07-05", "20:00", "Gan. M-79", "Gan. M-80", "Mexico City",         "Estadio Azteca"],
  [93, "round16", "2026-07-06", "15:00", "Gan. M-83", "Gan. M-84", "Dallas",              "AT&T Stadium"],
  [94, "round16", "2026-07-06", "20:00", "Gan. M-81", "Gan. M-82", "Seattle",             "Lumen Field"],
  [95, "round16", "2026-07-07", "12:00", "Gan. M-86", "Gan. M-88", "Atlanta",             "Mercedes-Benz Stadium"],
  [96, "round16", "2026-07-07", "16:00", "Gan. M-85", "Gan. M-87", "Vancouver",           "BC Place"],

  // ── Cuartos de final — 4 partidos
  [ 97, "quarter", "2026-07-09", "16:00", "Gan. M-89", "Gan. M-90",  "Boston",      "Gillette Stadium"],
  [ 98, "quarter", "2026-07-10", "15:00", "Gan. M-93", "Gan. M-94",  "Los Angeles", "SoFi Stadium"],
  [ 99, "quarter", "2026-07-11", "17:00", "Gan. M-91", "Gan. M-92",  "Miami",       "Hard Rock Stadium"],
  [100, "quarter", "2026-07-11", "21:00", "Gan. M-95", "Gan. M-96",  "Kansas City", "Arrowhead Stadium"],

  // ── Semifinales — 2 partidos
  [101, "semi",    "2026-07-14", "15:00", "Gan. M-97", "Gan. M-98",  "Dallas",  "AT&T Stadium"],
  [102, "semi",    "2026-07-15", "15:00", "Gan. M-99", "Gan. M-100", "Atlanta", "Mercedes-Benz Stadium"],

  // ── Tercer puesto y Final
  [103, "thirdplace", "2026-07-18", "17:00", "Perd. M-101", "Perd. M-102", "Miami",               "Hard Rock Stadium"],
  [104, "final",      "2026-07-19", "15:00", "Gan. M-101",  "Gan. M-102",  "New York/New Jersey", "MetLife Stadium"],
];

const koMatches: Match[] = KO_ROWS.map(([no, stage, date, time, hp, ap, city, venue]) => ({
  id: `M${no}`,
  matchNumber: no,
  stage,
  kickoff: toUTCISO(date, time, city),
  home: null,
  away: null,
  homePlaceholder: hp,
  awayPlaceholder: ap,
  venue,
  city,
}));

// Lista cruda (sin enriquecer) — uso interno
const RAW_MATCHES: Match[] = [...groupMatches, ...koMatches].sort((a, b) =>
  a.kickoff.localeCompare(b.kickoff),
);

// Lista enriquecida con resultados reales, ganadores de KO y equipos resueltos
// del cuadro (a partir de results.ts). Es lo que consume la app.
import { enrichMatches } from "./bracket";
export const ALL_MATCHES: Match[] = enrichMatches(RAW_MATCHES);

export function getMatch(id: string): Match | undefined {
  return ALL_MATCHES.find((m) => m.id === id);
}

export function matchesByMatchday(): { key: string; label: string; matches: Match[] }[] {
  const buckets = new Map<string, Match[]>();
  for (const m of ALL_MATCHES) {
    let key: string;
    if (m.stage === "group") {
      key = `group-${m.matchday}`;
    } else {
      key = m.stage;
    }
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(m);
  }
  // Orden: J1, J2, J3, R32, R16, QF, SF, 3º, Final
  const stageOrder: Record<string, number> = {
    "group-1": 1,
    "group-2": 2,
    "group-3": 3,
    round32: 4,
    round16: 5,
    quarter: 6,
    semi: 7,
    thirdplace: 8,
    final: 9,
  };
  return Array.from(buckets.entries())
    .sort(([a], [b]) => (stageOrder[a] ?? 0) - (stageOrder[b] ?? 0))
    .map(([key, matches]) => ({
      key,
      label: key.startsWith("group-")
        ? `Fase de grupos · Jornada ${matches[0].matchday}`
        : stageLabel(matches[0].stage),
      matches,
    }));
}

export function stageLabel(stage: Match["stage"]): string {
  switch (stage) {
    case "group":      return "Fase de grupos";
    case "round32":    return "Dieciseisavos";
    case "round16":    return "Octavos";
    case "quarter":    return "Cuartos";
    case "semi":       return "Semifinales";
    case "thirdplace": return "Tercer puesto";
    case "final":      return "Final";
  }
}
