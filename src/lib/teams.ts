import type { Team } from "./types";

// Mundial 2026 — 48 selecciones. Sorteo de grupos placeholder (los grupos reales se
// asignan tras el sorteo oficial). Banderas vía flagcdn.com con código ISO 3166-1 alpha-2.
// Si una selección no tiene código ISO directo (ej. Inglaterra), usamos un emoji fallback.

export const TEAMS: Team[] = [
  // Grupo A
  { code: "MEX", name: "México",         flag: "mx", group: "A", confederation: "CONCACAF" },
  { code: "POR", name: "Portugal",       flag: "pt", group: "A", confederation: "UEFA" },
  { code: "ECU", name: "Ecuador",        flag: "ec", group: "A", confederation: "CONMEBOL" },
  { code: "MAR", name: "Marruecos",      flag: "ma", group: "A", confederation: "CAF" },
  // Grupo B
  { code: "CAN", name: "Canadá",         flag: "ca", group: "B", confederation: "CONCACAF" },
  { code: "BEL", name: "Bélgica",        flag: "be", group: "B", confederation: "UEFA" },
  { code: "URU", name: "Uruguay",        flag: "uy", group: "B", confederation: "CONMEBOL" },
  { code: "EGY", name: "Egipto",         flag: "eg", group: "B", confederation: "CAF" },
  // Grupo C
  { code: "USA", name: "Estados Unidos", flag: "us", group: "C", confederation: "CONCACAF" },
  { code: "NED", name: "Países Bajos",   flag: "nl", group: "C", confederation: "UEFA" },
  { code: "JPN", name: "Japón",          flag: "jp", group: "C", confederation: "AFC" },
  { code: "SEN", name: "Senegal",        flag: "sn", group: "C", confederation: "CAF" },
  // Grupo D
  { code: "ARG", name: "Argentina",      flag: "ar", group: "D", confederation: "CONMEBOL" },
  { code: "GER", name: "Alemania",       flag: "de", group: "D", confederation: "UEFA" },
  { code: "KOR", name: "Corea del Sur",  flag: "kr", group: "D", confederation: "AFC" },
  { code: "CIV", name: "Costa de Marfil",flag: "ci", group: "D", confederation: "CAF" },
  // Grupo E
  { code: "BRA", name: "Brasil",         flag: "br", group: "E", confederation: "CONMEBOL" },
  { code: "ITA", name: "Italia",         flag: "it", group: "E", confederation: "UEFA" },
  { code: "AUS", name: "Australia",      flag: "au", group: "E", confederation: "AFC" },
  { code: "NGA", name: "Nigeria",        flag: "ng", group: "E", confederation: "CAF" },
  // Grupo F
  { code: "ESP", name: "España",         flag: "es", group: "F", confederation: "UEFA" },
  { code: "COL", name: "Colombia",       flag: "co", group: "F", confederation: "CONMEBOL" },
  { code: "IRN", name: "Irán",           flag: "ir", group: "F", confederation: "AFC" },
  { code: "JAM", name: "Jamaica",        flag: "jm", group: "F", confederation: "CONCACAF" },
  // Grupo G
  { code: "FRA", name: "Francia",        flag: "fr", group: "G", confederation: "UEFA" },
  { code: "CRC", name: "Costa Rica",     flag: "cr", group: "G", confederation: "CONCACAF" },
  { code: "SAU", name: "Arabia Saudí",   flag: "sa", group: "G", confederation: "AFC" },
  { code: "TUN", name: "Túnez",          flag: "tn", group: "G", confederation: "CAF" },
  // Grupo H
  { code: "ENG", name: "Inglaterra",     flag: "gb-eng", group: "H", confederation: "UEFA" },
  { code: "CHL", name: "Chile",          flag: "cl", group: "H", confederation: "CONMEBOL" },
  { code: "QAT", name: "Catar",          flag: "qa", group: "H", confederation: "AFC" },
  { code: "GHA", name: "Ghana",          flag: "gh", group: "H", confederation: "CAF" },
  // Grupo I
  { code: "CRO", name: "Croacia",        flag: "hr", group: "I", confederation: "UEFA" },
  { code: "PAN", name: "Panamá",         flag: "pa", group: "I", confederation: "CONCACAF" },
  { code: "PER", name: "Perú",           flag: "pe", group: "I", confederation: "CONMEBOL" },
  { code: "ALG", name: "Argelia",        flag: "dz", group: "I", confederation: "CAF" },
  // Grupo J
  { code: "DEN", name: "Dinamarca",      flag: "dk", group: "J", confederation: "UEFA" },
  { code: "SUI", name: "Suiza",          flag: "ch", group: "J", confederation: "UEFA" },
  { code: "PAR", name: "Paraguay",       flag: "py", group: "J", confederation: "CONMEBOL" },
  { code: "NZL", name: "Nueva Zelanda",  flag: "nz", group: "J", confederation: "OFC" },
  // Grupo K
  { code: "SCO", name: "Escocia",        flag: "gb-sct", group: "K", confederation: "UEFA" },
  { code: "AUT", name: "Austria",        flag: "at", group: "K", confederation: "UEFA" },
  { code: "VEN", name: "Venezuela",      flag: "ve", group: "K", confederation: "CONMEBOL" },
  { code: "RSA", name: "Sudáfrica",      flag: "za", group: "K", confederation: "CAF" },
  // Grupo L
  { code: "TUR", name: "Turquía",        flag: "tr", group: "L", confederation: "UEFA" },
  { code: "NOR", name: "Noruega",        flag: "no", group: "L", confederation: "UEFA" },
  { code: "UZB", name: "Uzbekistán",     flag: "uz", group: "L", confederation: "AFC" },
  { code: "CPV", name: "Cabo Verde",     flag: "cv", group: "L", confederation: "CAF" },
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
