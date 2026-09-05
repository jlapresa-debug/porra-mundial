import type { Match } from "./types";

// Champions League 2026/27.
//
// FASE DE LIGA: 36 equipos, tabla única, 8 jornadas (144 partidos).
// Calendario y emparejamientos oficiales (sorteo del 27 ago 2026, Mónaco).
// Fuente: UEFA.com — "2026/27 Champions League: All the league phase fixtures".
//
// Horarios: no hay franja horaria pública por partido salvo la J1 (donde sí
// se conocen 4 partidos con inicio anticipado a las 18:45 CET/CEST). Para el
// resto se usa el horario habitual de la Champions, 21:00 hora española.
// Cuando la UEFA confirme un horario distinto para un partido concreto, se
// corrige aquí.
//
// ELIMINATORIAS (play-off, octavos, cuartos, semis, final): a partir de la
// fase de liga, CADA ronda se decide por SORTEO (no hay cuadro fijo como en
// un Mundial). Los emparejamientos no se conocen hasta que se sortean, así
// que no aparecen en este archivo hasta entonces — se añaden aquí (ida y
// vuelta) en cuanto la UEFA los publica. La única excepción es la FINAL
// (partido único, sede ya fijada).

function toUTCISO(dateLocal: string, timeLocal: string, offsetHours: number): string {
  const [y, mo, d] = dateLocal.split("-").map(Number);
  const [h, mn] = timeLocal.split(":").map(Number);
  return new Date(Date.UTC(y, mo - 1, d, h - offsetHours, mn)).toISOString();
}

// España usa CEST (UTC+2) hasta el último domingo de octubre, luego CET (UTC+1)
// hasta el último domingo de marzo.
function offsetFor(dateLocal: string): number {
  return dateLocal >= "2026-10-25" && dateLocal < "2027-03-28" ? 1 : 2;
}

// Tuplas: [matchday, date, time, home, away]
type LeagueRow = [number, string, string, string, string];

const LEAGUE_ROWS: LeagueRow[] = [
  // ── Jornada 1 (8-10 sep 2026) ──────────────────────────────────
  [1, "2026-09-08", "18:45", "AEK", "LAS"],
  [1, "2026-09-08", "18:45", "BRU", "AVL"],
  [1, "2026-09-08", "21:00", "DOR", "VIL"],
  [1, "2026-09-08", "21:00", "POR", "MCI"],
  [1, "2026-09-08", "21:00", "LIL", "BET"],
  [1, "2026-09-08", "21:00", "RMA", "INT"],
  [1, "2026-09-09", "18:45", "BAR", "FEY"],
  [1, "2026-09-09", "18:45", "STU", "VIK"],
  [1, "2026-09-09", "21:00", "LIV", "ATM"],
  [1, "2026-09-09", "21:00", "PSG", "SVK"],
  [1, "2026-09-09", "21:00", "SCP", "GAL"],
  [1, "2026-09-09", "21:00", "NAP", "ARS"],
  [1, "2026-09-10", "21:00", "FEN", "ROM"],
  [1, "2026-09-10", "21:00", "PSV", "SHK"],
  [1, "2026-09-10", "21:00", "COM", "LEI"],
  [1, "2026-09-10", "21:00", "BAY", "BOD"],
  [1, "2026-09-10", "21:00", "MUN", "SAB"],
  [1, "2026-09-10", "21:00", "SLA", "LEN"],

  // ── Jornada 2 (13-14 oct 2026) ─────────────────────────────────
  [2, "2026-10-13", "21:00", "LEN", "SCP"],
  [2, "2026-10-13", "21:00", "SAB", "SLA"],
  [2, "2026-10-13", "21:00", "ARS", "LIL"],
  [2, "2026-10-13", "21:00", "ATM", "MUN"],
  [2, "2026-10-13", "21:00", "INT", "BRU"],
  [2, "2026-10-13", "21:00", "GAL", "BAR"],
  [2, "2026-10-13", "21:00", "LEI", "PSV"],
  [2, "2026-10-13", "21:00", "VIK", "BAY"],
  [2, "2026-10-13", "21:00", "VIL", "NAP"],
  [2, "2026-10-14", "21:00", "FEY", "COM"],
  [2, "2026-10-14", "21:00", "LAS", "LIV"],
  [2, "2026-10-14", "21:00", "ROM", "RMA"],
  [2, "2026-10-14", "21:00", "AVL", "FEN"],
  [2, "2026-10-14", "21:00", "SHK", "AEK"],
  [2, "2026-10-14", "21:00", "BOD", "DOR"],
  [2, "2026-10-14", "21:00", "MCI", "PSG"],
  [2, "2026-10-14", "21:00", "BET", "POR"],
  [2, "2026-10-14", "21:00", "SVK", "STU"],

  // ── Jornada 3 (20-21 oct 2026) ─────────────────────────────────
  [3, "2026-10-20", "21:00", "FEN", "SLA"],
  [3, "2026-10-20", "21:00", "SAB", "DOR"],
  [3, "2026-10-20", "21:00", "ROM", "SVK"],
  [3, "2026-10-20", "21:00", "POR", "PSV"],
  [3, "2026-10-20", "21:00", "LIV", "VIL"],
  [3, "2026-10-20", "21:00", "MCI", "AEK"],
  [3, "2026-10-20", "21:00", "PSG", "BAR"],
  [3, "2026-10-20", "21:00", "NAP", "BOD"],
  [3, "2026-10-20", "21:00", "STU", "ATM"],
  [3, "2026-10-21", "21:00", "COM", "MUN"],
  [3, "2026-10-21", "21:00", "LIL", "GAL"],
  [3, "2026-10-21", "21:00", "AVL", "VIK"],
  [3, "2026-10-21", "21:00", "BRU", "LEN"],
  [3, "2026-10-21", "21:00", "BAY", "ARS"],
  [3, "2026-10-21", "21:00", "INT", "SHK"],
  [3, "2026-10-21", "21:00", "RMA", "LEI"],
  [3, "2026-10-21", "21:00", "BET", "FEY"],
  [3, "2026-10-21", "21:00", "SCP", "LAS"],

  // ── Jornada 4 (3-4 nov 2026) ───────────────────────────────────
  [4, "2026-11-03", "21:00", "SHK", "SCP"],
  [4, "2026-11-03", "21:00", "GAL", "STU"],
  [4, "2026-11-03", "21:00", "ATM", "BAY"],
  [4, "2026-11-03", "21:00", "BAR", "AVL"],
  [4, "2026-11-03", "21:00", "FEY", "INT"],
  [4, "2026-11-03", "21:00", "BOD", "LIL"],
  [4, "2026-11-03", "21:00", "LAS", "SVK"],
  [4, "2026-11-03", "21:00", "MUN", "ROM"],
  [4, "2026-11-03", "21:00", "VIL", "PSG"],
  [4, "2026-11-04", "21:00", "AEK", "RMA"],
  [4, "2026-11-04", "21:00", "FEN", "LIV"],
  [4, "2026-11-04", "21:00", "DOR", "BET"],
  [4, "2026-11-04", "21:00", "POR", "NAP"],
  [4, "2026-11-04", "21:00", "PSV", "BRU"],
  [4, "2026-11-04", "21:00", "LEI", "MCI"],
  [4, "2026-11-04", "21:00", "LEN", "COM"],
  [4, "2026-11-04", "21:00", "SLA", "ARS"],
  [4, "2026-11-04", "21:00", "VIK", "SAB"],

  // ── Jornada 5 (24-25 nov 2026) ─────────────────────────────────
  [5, "2026-11-24", "21:00", "BOD", "LAS"],
  [5, "2026-11-24", "21:00", "GAL", "AVL"],
  [5, "2026-11-24", "21:00", "ARS", "DOR"],
  [5, "2026-11-24", "21:00", "COM", "AEK"],
  [5, "2026-11-24", "21:00", "FEY", "POR"],
  [5, "2026-11-24", "21:00", "MCI", "NAP"],
  [5, "2026-11-24", "21:00", "LEI", "LEN"],
  [5, "2026-11-24", "21:00", "RMA", "PSV"],
  [5, "2026-11-24", "21:00", "SVK", "BET"],
  [5, "2026-11-25", "21:00", "SAB", "BAR"],
  [5, "2026-11-25", "21:00", "SLA", "VIL"],
  [5, "2026-11-25", "21:00", "ATM", "VIK"],
  [5, "2026-11-25", "21:00", "BRU", "LIV"],
  [5, "2026-11-25", "21:00", "INT", "STU"],
  [5, "2026-11-25", "21:00", "SHK", "FEN"],
  [5, "2026-11-25", "21:00", "LIL", "BAY"],
  [5, "2026-11-25", "21:00", "PSG", "ROM"],
  [5, "2026-11-25", "21:00", "SCP", "MUN"],

  // ── Jornada 6 (8-9 dic 2026) ───────────────────────────────────
  [6, "2026-12-08", "21:00", "VIK", "FEY"],
  [6, "2026-12-08", "21:00", "VIL", "SAB"],
  [6, "2026-12-08", "21:00", "AEK", "GAL"],
  [6, "2026-12-08", "21:00", "ROM", "SCP"],
  [6, "2026-12-08", "21:00", "AVL", "PSG"],
  [6, "2026-12-08", "21:00", "BAR", "MCI"],
  [6, "2026-12-08", "21:00", "BAY", "SLA"],
  [6, "2026-12-08", "21:00", "MUN", "LEI"],
  [6, "2026-12-08", "21:00", "NAP", "BRU"],
  [6, "2026-12-09", "21:00", "BET", "COM"],
  [6, "2026-12-09", "21:00", "SVK", "SHK"],
  [6, "2026-12-09", "21:00", "ARS", "RMA"],
  [6, "2026-12-09", "21:00", "DOR", "INT"],
  [6, "2026-12-09", "21:00", "LAS", "FEN"],
  [6, "2026-12-09", "21:00", "LIV", "POR"],
  [6, "2026-12-09", "21:00", "PSV", "ATM"],
  [6, "2026-12-09", "21:00", "LEN", "BOD"],
  [6, "2026-12-09", "21:00", "STU", "LIL"],

  // ── Jornada 7 (19-20 ene 2027) ─────────────────────────────────
  [7, "2027-01-19", "21:00", "BOD", "ATM"],
  [7, "2027-01-19", "21:00", "GAL", "FEY"],
  [7, "2027-01-19", "21:00", "AEK", "ROM"],
  [7, "2027-01-19", "21:00", "AVL", "DOR"],
  [7, "2027-01-19", "21:00", "INT", "LIV"],
  [7, "2027-01-19", "21:00", "POR", "SLA"],
  [7, "2027-01-19", "21:00", "LIL", "SVK"],
  [7, "2027-01-19", "21:00", "RMA", "LAS"],
  [7, "2027-01-19", "21:00", "STU", "BRU"],
  [7, "2027-01-20", "21:00", "FEN", "VIL"],
  [7, "2027-01-20", "21:00", "SAB", "NAP"],
  [7, "2027-01-20", "21:00", "COM", "PSG"],
  [7, "2027-01-20", "21:00", "MUN", "BAY"],
  [7, "2027-01-20", "21:00", "LEI", "SHK"],
  [7, "2027-01-20", "21:00", "LEN", "MCI"],
  [7, "2027-01-20", "21:00", "BET", "ARS"],
  [7, "2027-01-20", "21:00", "SCP", "BAR"],
  [7, "2027-01-20", "21:00", "VIK", "PSV"],

  // ── Jornada 8 (27 ene 2027 — todos simultáneos) ─────────────────
  [8, "2027-01-27", "21:00", "ARS", "SAB"],
  [8, "2027-01-27", "21:00", "ROM", "LIL"],
  [8, "2027-01-27", "21:00", "ATM", "FEN"],
  [8, "2027-01-27", "21:00", "DOR", "AEK"],
  [8, "2027-01-27", "21:00", "BRU", "BOD"],
  [8, "2027-01-27", "21:00", "BAY", "BET"],
  [8, "2027-01-27", "21:00", "BAR", "COM"],
  [8, "2027-01-27", "21:00", "SHK", "RMA"],
  [8, "2027-01-27", "21:00", "FEY", "LEI"],
  [8, "2027-01-27", "21:00", "LAS", "POR"],
  [8, "2027-01-27", "21:00", "LIV", "LEN"],
  [8, "2027-01-27", "21:00", "MCI", "SCP"],
  [8, "2027-01-27", "21:00", "PSG", "GAL"],
  [8, "2027-01-27", "21:00", "PSV", "STU"],
  [8, "2027-01-27", "21:00", "SLA", "AVL"],
  [8, "2027-01-27", "21:00", "NAP", "VIK"],
  [8, "2027-01-27", "21:00", "VIL", "MUN"],
  [8, "2027-01-27", "21:00", "SVK", "INT"],
];

const leagueMatches: Match[] = LEAGUE_ROWS.map(([md, date, time, home, away], i) => ({
  id: `L${md}-${home}-${away}`,
  matchNumber: i + 1,
  stage: "league",
  matchday: md,
  kickoff: toUTCISO(date, time, offsetFor(date)),
  home,
  away,
}));

// ── FINAL ──────────────────────────────────────────────────────────
// Único partido conocido de antemano en la fase eliminatoria: sede fija
// (Estadio Metropolitano, Madrid), fecha fija, rivales aún por decidir.
const finalMatch: Match = {
  id: "FINAL",
  stage: "final",
  kickoff: toUTCISO("2027-06-05", "21:00", 2), // CEST en junio
  home: null,
  away: null,
  homePlaceholder: "Finalista 1",
  awayPlaceholder: "Finalista 2",
  venue: "Estadio Metropolitano",
  city: "Madrid",
};

// Lista base. Los partidos de play-off/octavos/cuartos/semis se añaden aquí
// en cuanto la UEFA sortea cada ronda (no existe cuadro fijo: cada ronda,
// desde el play-off hasta semifinales, se sortea de nuevo).
const RAW_MATCHES: Match[] = [...leagueMatches, finalMatch].sort((a, b) =>
  a.kickoff.localeCompare(b.kickoff),
);

import { enrichMatches } from "./bracket";
export const ALL_MATCHES: Match[] = enrichMatches(RAW_MATCHES);

export function getMatch(id: string): Match | undefined {
  return ALL_MATCHES.find((m) => m.id === id);
}

export function matchesByMatchday(): { key: string; label: string; matches: Match[] }[] {
  const buckets = new Map<string, Match[]>();
  for (const m of ALL_MATCHES) {
    const key = m.stage === "league" ? `league-${m.matchday}` : m.stage;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(m);
  }
  const stageOrder: Record<string, number> = {
    "league-1": 1, "league-2": 2, "league-3": 3, "league-4": 4,
    "league-5": 5, "league-6": 6, "league-7": 7, "league-8": 8,
    playoff: 9, round16: 10, quarter: 11, semi: 12, final: 13,
  };
  return Array.from(buckets.entries())
    .sort(([a], [b]) => (stageOrder[a] ?? 99) - (stageOrder[b] ?? 99))
    .map(([key, matches]) => ({
      key,
      label: key.startsWith("league-")
        ? `Fase de liga · Jornada ${matches[0].matchday}`
        : stageLabel(matches[0].stage),
      matches,
    }));
}

export function stageLabel(stage: Match["stage"]): string {
  switch (stage) {
    case "league":   return "Fase de liga";
    case "playoff":  return "Play-off";
    case "round16":  return "Octavos de final";
    case "quarter":  return "Cuartos de final";
    case "semi":     return "Semifinales";
    case "final":    return "Final";
  }
}
