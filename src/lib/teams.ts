import type { Team } from "./types";

// Champions League 2026/27 — 36 equipos de la fase de liga.
// Sorteo oficial: 27 de agosto de 2026, Grimaldi Forum, Mónaco.
// Fuente: UEFA.com

export const TEAMS: Team[] = [
  { code: "AEK", name: "AEK Athens",           country: "Grecia" },
  { code: "ARS", name: "Arsenal",              country: "Inglaterra" },
  { code: "AVL", name: "Aston Villa",          country: "Inglaterra" },
  { code: "ATM", name: "Atlético de Madrid",   country: "España" },
  { code: "BAR", name: "Barcelona",            country: "España" },
  { code: "BAY", name: "Bayern München",       country: "Alemania" },
  { code: "BOD", name: "Bodø/Glimt",           country: "Noruega" },
  { code: "DOR", name: "Borussia Dortmund",    country: "Alemania" },
  { code: "BRU", name: "Club Brugge",          country: "Bélgica" },
  { code: "COM", name: "Como",                 country: "Italia" },
  { code: "FEN", name: "Fenerbahçe",           country: "Turquía" },
  { code: "FEY", name: "Feyenoord",            country: "Países Bajos" },
  { code: "GAL", name: "Galatasaray",          country: "Turquía" },
  { code: "INT", name: "Inter",                country: "Italia" },
  { code: "LAS", name: "LASK",                 country: "Austria" },
  { code: "LEI", name: "RB Leipzig",           country: "Alemania" },
  { code: "LEN", name: "Lens",                 country: "Francia" },
  { code: "LIL", name: "Lille",                country: "Francia" },
  { code: "LIV", name: "Liverpool",            country: "Inglaterra" },
  { code: "MCI", name: "Manchester City",      country: "Inglaterra" },
  { code: "MUN", name: "Manchester United",    country: "Inglaterra" },
  { code: "NAP", name: "Napoli",               country: "Italia" },
  { code: "PSG", name: "Paris Saint-Germain",  country: "Francia" },
  { code: "POR", name: "Porto",                country: "Portugal" },
  { code: "PSV", name: "PSV Eindhoven",        country: "Países Bajos" },
  { code: "BET", name: "Real Betis",           country: "España" },
  { code: "RMA", name: "Real Madrid",          country: "España" },
  { code: "ROM", name: "Roma",                 country: "Italia" },
  { code: "SAB", name: "Sabah",                country: "Azerbaiyán" },
  { code: "SHK", name: "Shakhtar Donetsk",     country: "Ucrania" },
  { code: "SLA", name: "Slavia Praha",         country: "Chequia" },
  { code: "SVK", name: "Slovan Bratislava",    country: "Eslovaquia" },
  { code: "SCP", name: "Sporting CP",          country: "Portugal" },
  { code: "STU", name: "VfB Stuttgart",        country: "Alemania" },
  { code: "VIL", name: "Villarreal",           country: "España" },
  { code: "VIK", name: "Viking",               country: "Noruega" },
];

export const TEAMS_BY_CODE: Record<string, Team> = Object.fromEntries(
  TEAMS.map((t) => [t.code, t]),
);

export function getTeam(code: string | null | undefined): Team | undefined {
  if (!code) return undefined;
  return TEAMS_BY_CODE[code];
}
