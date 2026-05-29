import type { Team } from "./types";

// Mundial 2026 — 48 selecciones, 12 grupos de 4.
// Grupos según el SORTEO OFICIAL del 5 de diciembre de 2025 (Kennedy Center, Washington D.C.).
// Banderas vía flagcdn.com con código ISO 3166-1 alpha-2 (o subcódigo para naciones del UK).

export const TEAMS: Team[] = [
  // Grupo A
  { code: "MEX", name: "México",                flag: "mx",     group: "A", confederation: "CONCACAF" },
  { code: "RSA", name: "Sudáfrica",             flag: "za",     group: "A", confederation: "CAF" },
  { code: "KOR", name: "Corea del Sur",         flag: "kr",     group: "A", confederation: "AFC" },
  { code: "CZE", name: "Chequia",               flag: "cz",     group: "A", confederation: "UEFA" },
  // Grupo B
  { code: "CAN", name: "Canadá",                flag: "ca",     group: "B", confederation: "CONCACAF" },
  { code: "BIH", name: "Bosnia y Herzegovina",  flag: "ba",     group: "B", confederation: "UEFA" },
  { code: "QAT", name: "Catar",                 flag: "qa",     group: "B", confederation: "AFC" },
  { code: "SUI", name: "Suiza",                 flag: "ch",     group: "B", confederation: "UEFA" },
  // Grupo C
  { code: "BRA", name: "Brasil",                flag: "br",     group: "C", confederation: "CONMEBOL" },
  { code: "MAR", name: "Marruecos",             flag: "ma",     group: "C", confederation: "CAF" },
  { code: "HAI", name: "Haití",                 flag: "ht",     group: "C", confederation: "CONCACAF" },
  { code: "SCO", name: "Escocia",               flag: "gb-sct", group: "C", confederation: "UEFA" },
  // Grupo D
  { code: "USA", name: "Estados Unidos",        flag: "us",     group: "D", confederation: "CONCACAF" },
  { code: "PAR", name: "Paraguay",              flag: "py",     group: "D", confederation: "CONMEBOL" },
  { code: "AUS", name: "Australia",             flag: "au",     group: "D", confederation: "AFC" },
  { code: "TUR", name: "Turquía",               flag: "tr",     group: "D", confederation: "UEFA" },
  // Grupo E
  { code: "GER", name: "Alemania",              flag: "de",     group: "E", confederation: "UEFA" },
  { code: "CUW", name: "Curazao",               flag: "cw",     group: "E", confederation: "CONCACAF" },
  { code: "CIV", name: "Costa de Marfil",       flag: "ci",     group: "E", confederation: "CAF" },
  { code: "ECU", name: "Ecuador",               flag: "ec",     group: "E", confederation: "CONMEBOL" },
  // Grupo F
  { code: "NED", name: "Países Bajos",          flag: "nl",     group: "F", confederation: "UEFA" },
  { code: "JPN", name: "Japón",                 flag: "jp",     group: "F", confederation: "AFC" },
  { code: "SWE", name: "Suecia",                flag: "se",     group: "F", confederation: "UEFA" },
  { code: "TUN", name: "Túnez",                 flag: "tn",     group: "F", confederation: "CAF" },
  // Grupo G
  { code: "BEL", name: "Bélgica",               flag: "be",     group: "G", confederation: "UEFA" },
  { code: "EGY", name: "Egipto",                flag: "eg",     group: "G", confederation: "CAF" },
  { code: "IRN", name: "Irán",                  flag: "ir",     group: "G", confederation: "AFC" },
  { code: "NZL", name: "Nueva Zelanda",         flag: "nz",     group: "G", confederation: "OFC" },
  // Grupo H
  { code: "ESP", name: "España",                flag: "es",     group: "H", confederation: "UEFA" },
  { code: "CPV", name: "Cabo Verde",            flag: "cv",     group: "H", confederation: "CAF" },
  { code: "SAU", name: "Arabia Saudí",          flag: "sa",     group: "H", confederation: "AFC" },
  { code: "URU", name: "Uruguay",               flag: "uy",     group: "H", confederation: "CONMEBOL" },
  // Grupo I
  { code: "FRA", name: "Francia",               flag: "fr",     group: "I", confederation: "UEFA" },
  { code: "SEN", name: "Senegal",               flag: "sn",     group: "I", confederation: "CAF" },
  { code: "IRQ", name: "Irak",                  flag: "iq",     group: "I", confederation: "AFC" },
  { code: "NOR", name: "Noruega",               flag: "no",     group: "I", confederation: "UEFA" },
  // Grupo J
  { code: "ARG", name: "Argentina",             flag: "ar",     group: "J", confederation: "CONMEBOL" },
  { code: "ALG", name: "Argelia",               flag: "dz",     group: "J", confederation: "CAF" },
  { code: "AUT", name: "Austria",               flag: "at",     group: "J", confederation: "UEFA" },
  { code: "JOR", name: "Jordania",              flag: "jo",     group: "J", confederation: "AFC" },
  // Grupo K
  { code: "POR", name: "Portugal",              flag: "pt",     group: "K", confederation: "UEFA" },
  { code: "COD", name: "RD del Congo",          flag: "cd",     group: "K", confederation: "CAF" },
  { code: "UZB", name: "Uzbekistán",            flag: "uz",     group: "K", confederation: "AFC" },
  { code: "COL", name: "Colombia",              flag: "co",     group: "K", confederation: "CONMEBOL" },
  // Grupo L
  { code: "ENG", name: "Inglaterra",            flag: "gb-eng", group: "L", confederation: "UEFA" },
  { code: "CRO", name: "Croacia",               flag: "hr",     group: "L", confederation: "UEFA" },
  { code: "GHA", name: "Ghana",                 flag: "gh",     group: "L", confederation: "CAF" },
  { code: "PAN", name: "Panamá",                flag: "pa",     group: "L", confederation: "CONCACAF" },
];

export const TEAMS_BY_CODE: Record<string, Team> = Object.fromEntries(
  TEAMS.map((t) => [t.code, t]),
);

export const TEAMS_BY_GROUP: Record<string, Team[]> = TEAMS.reduce((acc, t) => {
  (acc[t.group] ||= []).push(t);
  return acc;
}, {} as Record<string, Team[]>);

export function getTeam(code: string | null | undefined): Team | undefined {
  if (!code) return undefined;
  return TEAMS_BY_CODE[code];
}

export function flagUrl(team: Team | undefined, size: 40 | 80 | 160 = 80): string {
  if (!team) return "";
  return `https://flagcdn.com/w${size}/${team.flag}.png`;
}
