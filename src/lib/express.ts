// Apuestas Express: apuestas concretas y puntuales para un partido específico,
// con plazo limitado.
//
// Cómo añadir una nueva apuesta express: añade un objeto a EXPRESS_BETS más abajo.
// Cada pregunta genérica (no-template) va en el array `questions`, en el orden
// exacto en que debe mostrarse. Todas comparten el mismo almacén de respuestas
// (ExpressPrediction.binaryAnswers / ExpressOutcome.binaryAnswers), indexado
// por el `id` de cada pregunta.

import type { ExpressOutcome, TeamCode } from "./types";

// Resultado posible en Q1 (perspectiva del equipo principal)
export type ExpressResult = "win" | "draw" | "lose";

export const RESULT_LABEL: Record<ExpressResult, string> = {
  win:   "Ganar",
  draw:  "Empatar",
  lose:  "Perder",
};

// Pregunta binaria (2 opciones) o de opción múltiple (3+ opciones).
// La respuesta guardada es el índice de la opción elegida, como string ("0","1",...).
export interface OptionsQuestion {
  kind: "options";
  id: string;
  text: string;
  options: string[]; // 2 o más opciones excluyentes
  points: number;
}

// Pregunta cuya respuesta es un jugador de una convocatoria concreta.
// La respuesta guardada es el nombre del jugador tal cual aparece en `squad`.
export interface PlayerQuestion {
  kind: "player";
  id: string;
  text: string;
  squad: string[];
  points: number;
}

// Pregunta numérica: selector de un valor entero entre min y max.
// La respuesta guardada es el número como string. Si `maxLabel` está
// definido, la última opción del selector se muestra con ese texto
// (ej. "10 o más") aunque el valor almacenado sea `max`. Al aplicar el
// resultado real, cualquier valor ≥ max debe guardarse también como `max`
// para que coincida con lo que pudo elegir el usuario.
export interface NumberQuestion {
  kind: "number";
  id: string;
  text: string;
  min: number;
  max: number;
  maxLabel?: string;
  points: number;
}

export type AnswerQuestion = OptionsQuestion | PlayerQuestion | NumberQuestion;

export interface ExpressBet {
  id: string;
  title: string;
  matchId: string;        // ID del partido al que está vinculada (de matches.ts)
  deadline: string;       // ISO UTC
  team: TeamCode;         // Equipo principal
  opponent: TeamCode;
  // Template-1: bloque clásico Q1+Q2+Q3 (resultado/marcador/goleadores)
  q1?: { points: number };
  q2?: { points: number; maxGoals: number };
  q3?: { pointsPerHit: number; squad: string[] };
  // Genérico: preguntas en el orden exacto de visualización
  questions?: AnswerQuestion[];
}

// Convocatoria oficial de España para el Mundial 2026 (26 jugadores)
// Fuente: Luis de la Fuente / RFEF — junio 2026
export const SPAIN_SQUAD_2026 = [
  // Porteros
  "Unai Simón",
  "David Raya",
  "Joan García",
  // Defensas
  "Pedro Porro",
  "Marc Cucurella",
  "Álex Grimaldo",
  "Pau Cubarsí",
  "Aymeric Laporte",
  "Marc Pubill",
  "Eric García",
  "Marcos Llorente",
  // Centrocampistas
  "Rodri",
  "Martín Zubimendi",
  "Pedri",
  "Fabián Ruiz",
  "Mikel Merino",
  "Gavi",
  "Álex Baena",
  // Delanteros
  "Mikel Oyarzabal",
  "Lamine Yamal",
  "Ferran Torres",
  "Borja Iglesias",
  "Dani Olmo",
  "Víctor Muñoz",
  "Nico Williams",
  "Yeremy Pino",
];

// Convocatoria oficial de Bélgica para el Mundial 2026 (26 jugadores)
// Fuente: Rudi García — mayo 2026
export const BELGIUM_SQUAD_2026 = [
  // Porteros
  "Thibaut Courtois",
  "Senne Lammens",
  "Mike Penders",
  // Defensas
  "Timothy Castagne",
  "Zeno Debast",
  "Maxim De Cuyper",
  "Koni De Winter",
  "Brandon Mechele",
  "Thomas Meunier",
  "Nathan Ngoy",
  "Joaquin Seys",
  "Arthur Theate",
  // Centrocampistas
  "Kevin De Bruyne",
  "Amadou Onana",
  "Nicolas Raskin",
  "Youri Tielemans",
  "Hans Vanaken",
  "Axel Witsel",
  // Delanteros
  "Charles De Ketelaere",
  "Jeremy Doku",
  "Matias Fernandez-Pardo",
  "Romelu Lukaku",
  "Dodi Lukebakio",
  "Diego Moreira",
  "Alexis Saelemaekers",
  "Leandro Trossard",
];

// Convocatoria oficial de Francia para el Mundial 2026 (26 jugadores)
// Fuente: Didier Deschamps — mayo 2026
export const FRANCE_SQUAD_2026 = [
  // Porteros
  "Mike Maignan",
  "Robin Risser",
  "Brice Samba",
  // Defensas
  "Lucas Digne",
  "Malo Gusto",
  "Lucas Hernandez",
  "Theo Hernandez",
  "Ibrahima Konaté",
  "Jules Koundé",
  "Maxence Lacroix",
  "William Saliba",
  "Dayot Upamecano",
  // Centrocampistas
  "N'Golo Kanté",
  "Manu Koné",
  "Adrien Rabiot",
  "Aurélien Tchouaméni",
  "Warren Zaïre-Emery",
  // Delanteros
  "Maghnes Akliouche",
  "Bradley Barcola",
  "Rayan Cherki",
  "Ousmane Dembélé",
  "Désiré Doué",
  "Jean-Philippe Mateta",
  "Kylian Mbappé",
  "Michael Olise",
  "Marcus Thuram",
];

// Ordenadas por relevancia: la apuesta más reciente arriba.
export const EXPRESS_BETS: ExpressBet[] = [
  {
    id: "FRA-ESP-SF",
    title: "Francia vs España · Semifinal",
    matchId: "M101",
    deadline: "2026-07-14T18:00:00Z", // 20:00 ES, 1h antes del pitido
    team: "ESP",
    opponent: "FRA",
    questions: [
      {
        kind: "options",
        id: "first-shot-on-target",
        text: "¿Qué selección hará el primer tiro a puerta?",
        options: ["España", "Francia"],
        points: 6,
      },
      {
        kind: "number",
        id: "first-corner-minute",
        text: "¿En qué minuto se pitará el primer córner del partido?",
        min: 1,
        max: 120,
        points: 15,
      },
      {
        kind: "number",
        id: "total-offsides",
        text: "¿Cuántos fueras de juego habrá en total?",
        min: 0,
        max: 15,
        maxLabel: "15 o más",
        points: 6,
      },
      {
        kind: "options",
        id: "header-goal",
        text: "¿Habrá algún gol de cabeza?",
        options: ["Sí", "No"],
        points: 3,
      },
      {
        kind: "options",
        id: "most-fouls",
        text: "¿Qué selección hará más faltas?",
        options: ["España", "Francia", "Empate"],
        points: 4,
      },
      {
        kind: "options",
        id: "var-key-play",
        text: "¿Se consultará el VAR para alguna jugada clave?",
        options: ["Sí", "No"],
        points: 5,
      },
      {
        kind: "options",
        id: "first-substitution",
        text: "¿Qué selección hará sustituciones antes?",
        options: ["España", "Francia"],
        points: 3,
      },
      {
        kind: "options",
        id: "set-piece-goal",
        text: "¿Habrá algún gol a balón parado (falta o córner)?",
        options: ["Sí", "No"],
        points: 5,
      },
      {
        kind: "number",
        id: "spain-keeper-saves",
        text: "¿Cuántas paradas hará el portero de España?",
        min: 0,
        max: 10,
        maxLabel: "10 o más",
        points: 7,
      },
      {
        kind: "options",
        id: "goal-and-assist-same-player",
        text: "¿Algún jugador marcará y asistirá en el mismo partido?",
        options: ["Sí", "No"],
        points: 5,
      },
      {
        kind: "options",
        id: "hit-post-or-bar",
        text: "¿Habrá algún disparo al palo o al larguero?",
        options: ["Sí", "No"],
        points: 5,
      },
      {
        kind: "player",
        id: "match-mvp",
        text: "¿Quién será elegido MVP del partido?",
        squad: [...SPAIN_SQUAD_2026, ...FRANCE_SQUAD_2026],
        points: 5,
      },
    ],
  },
  {
    id: "ESP-BEL-QF",
    title: "España vs Bélgica · Cuartos",
    matchId: "M98",
    deadline: "2026-07-10T18:00:00Z", // 20:00 ES, 1h antes del pitido
    team: "ESP",
    opponent: "BEL",
    questions: [
      {
        kind: "number",
        id: "first-goal-minute",
        text: "¿En qué minuto se marcará el primer gol?",
        min: 1,
        max: 120,
        points: 3,
      },
      {
        kind: "options",
        id: "first-scoring-team",
        text: "¿Qué equipo marcará primero?",
        options: ["España", "Bélgica", "Ninguno (0-0)"],
        points: 3,
      },
      {
        kind: "options",
        id: "total-goals",
        text: "¿Cuántos goles habrá en total en el partido?",
        options: ["0", "1", "2", "3", "4 o más"],
        points: 3,
      },
      {
        kind: "options",
        id: "goal-first-15",
        text: "¿Habrá gol en los primeros 15 minutos?",
        options: ["Sí", "No"],
        points: 3,
      },
      {
        kind: "player",
        id: "first-scorer",
        text: "¿Quién marcará el primer gol?",
        squad: [...SPAIN_SQUAD_2026, ...BELGIUM_SQUAD_2026],
        points: 3,
      },
      {
        kind: "options",
        id: "any-penalty",
        text: "¿Habrá algún penalti en el partido?",
        options: ["Sí", "No"],
        points: 3,
      },
      {
        kind: "number",
        id: "total-cards",
        text: "¿Cuántas tarjetas habrá en total (amarillas + rojas)?",
        min: 0,
        max: 10,
        maxLabel: "10 o más",
        points: 3,
      },
      {
        kind: "options",
        id: "any-brace",
        text: "¿Algún jugador marcará doblete?",
        options: ["Sí", "No"],
        points: 3,
      },
      {
        kind: "options",
        id: "goal-outside-box",
        text: "¿Se marcará algún gol desde fuera del área?",
        options: ["Sí", "No"],
        points: 3,
      },
      {
        kind: "options",
        id: "goal-stoppage-time",
        text: "¿Habrá gol en el descuento de alguna parte?",
        options: ["Sí", "No"],
        points: 3,
      },
      {
        kind: "options",
        id: "spain-possession",
        text: "Posesión final aproximada de España",
        options: ["<50%", "50–60%", "60–70%", ">70%"],
        points: 3,
      },
    ],
  },
  {
    id: "POR-ESP-R16",
    title: "Portugal vs España · Octavos",
    matchId: "M93",
    deadline: "2026-07-06T18:00:00Z", // 20:00 ES, 1h antes del pitido
    team: "ESP",
    opponent: "POR",
    questions: [
      {
        kind: "options",
        id: "cr7-shots-on-target",
        text: "¿Cuántos tiros a puerta hará CR7?",
        options: ["0", "1", "2", "Más de dos"],
        points: 3,
      },
      {
        kind: "options",
        id: "cr7-yellow",
        text: "¿Le sacarán tarjeta amarilla a CR7?",
        options: ["Sí", "No"],
        points: 3,
      },
      {
        kind: "options",
        id: "yamal-fouls",
        text: "¿Cuántas faltas cometerán sobre Lamine Yamal?",
        options: ["0", "1", "2", "3", "Más de 3"],
        points: 3,
      },
      {
        kind: "options",
        id: "baena-goals",
        text: "¿Cuántos goles meterá Baena?",
        options: ["0", "1", "2", "Más de dos"],
        points: 3,
      },
      {
        kind: "options",
        id: "ramos-goals",
        text: "¿Cuántos goles meterá Gonçalo Ramos?",
        options: ["0", "1", "2", "Más de dos"],
        points: 3,
      },
      {
        kind: "options",
        id: "vitinha-yellow",
        text: "¿Le sacarán tarjeta amarilla a Vitinha?",
        options: ["Sí", "No"],
        points: 3,
      },
      {
        kind: "options",
        id: "extra-time",
        text: "¿Habrá prórroga?",
        options: ["Sí", "No"],
        points: 3,
      },
      {
        kind: "options",
        id: "penalty-shootout",
        text: "¿Habrá tanda de penaltis?",
        options: ["Sí", "No"],
        points: 3,
      },
    ],
  },
  {
    id: "ESP-AUT-R32",
    title: "España vs Austria · Dieciseisavos",
    matchId: "M84",
    deadline: "2026-07-02T19:00:00Z", // 21:00 ES, pitido inicial
    team: "ESP",
    opponent: "AUT",
    questions: [
      {
        kind: "player",
        id: "esp-first-sub-out",
        text: "¿Quién será el primer jugador sustituido en España?",
        squad: SPAIN_SQUAD_2026,
        points: 2,
      },
      {
        kind: "player",
        id: "esp-first-sub-in",
        text: "¿Quién será el primer suplente en entrar por España?",
        squad: SPAIN_SQUAD_2026,
        points: 2,
      },
      {
        kind: "options",
        id: "cards-1h",
        text: "¿Cuántas tarjetas habrá en el primer tiempo?",
        options: ["0", "1", "2", "Más de dos"],
        points: 2,
      },
      {
        kind: "options",
        id: "goals-2h",
        text: "¿Cuántos goles habrá en el segundo tiempo?",
        options: ["0", "1", "2", "Más de dos"],
        points: 2,
      },
      {
        kind: "options",
        id: "any-penalty",
        text: "¿Habrá algún penalty lanzado en el partido?",
        options: ["Sí", "No"],
        points: 2,
      },
      {
        kind: "options",
        id: "delafuente-outfit",
        text: "¿Se cambiará de ropa De la Fuente en el descanso?",
        options: ["Sí", "No"],
        points: 2,
      },
      {
        kind: "options",
        id: "yamal-goals",
        text: "¿Cuántos goles meterá Lamine Yamal?",
        options: ["0", "1", "2", "Más de dos"],
        points: 2,
      },
    ],
  },
  {
    id: "URU-ESP-J3",
    title: "Uruguay vs España",
    matchId: "GH-J3-URU-ESP",
    deadline: "2026-06-26T18:00:00Z", // 20:00 ES del 26 jun
    team: "ESP",
    opponent: "URU",
    questions: [
      {
        kind: "options",
        id: "uru-corners",
        text: "¿Cuántos saques de esquina hará Uruguay?",
        options: ["3 o menos", "4 o más"],
        points: 2,
      },
      {
        kind: "options",
        id: "valverde-clean",
        text: "¿Acabará Valverde el partido sin tarjetas?",
        options: ["Sí", "No"],
        points: 2,
      },
      {
        kind: "options",
        id: "oyarzabal-goal",
        text: "¿Meterá gol Oyarzábal?",
        options: ["Sí", "No"],
        points: 2,
      },
      {
        kind: "options",
        id: "esp-win",
        text: "¿Ganará España?",
        options: ["Sí", "No"],
        points: 2,
      },
      {
        kind: "options",
        id: "zubimendi-plays",
        text: "¿Jugará Zubimendi?",
        options: ["Sí", "No"],
        points: 3,
      },
      {
        kind: "options",
        id: "esp-yellows",
        text: "¿Cuántas amarillas sacarán a España?",
        options: ["1 o menos", "2 o más"],
        points: 2,
      },
    ],
  },
  {
    id: "ESP-SAU-J2",
    title: "España vs Arabia Saudí",
    matchId: "GH-J2-ESP-SAU",
    deadline: "2026-06-21T14:00:00Z",
    team: "ESP",
    opponent: "SAU",
    q1: { points: 2 },
    q2: { points: 4, maxGoals: 8 },
    q3: { pointsPerHit: 2, squad: SPAIN_SQUAD_2026 },
  },
];

// Resultados reales de las apuestas Express (se rellenan tras cada partido).
// Cuando se añade una entrada aquí, los puntos se aplican automáticamente
// en el ranking y en el perfil de cada usuario.
//
// Formato:
//   "<betId>": {
//     q1: "win" | "draw" | "lose",
//     q2: { teamGoals, opponentGoals },
//     q3: ["Goleador 1", "Goleador 2", ...] // tantas entradas como goles marcó el equipo principal
//     binaryAnswers: { "<questionId>": "<índice o nombre de jugador>" }
//   }
//
// Ejemplo (España gana 3-1 con doblete de Yamal y gol de Olmo):
//   "ESP-SAU-J2": {
//     q1: "win",
//     q2: { teamGoals: 3, opponentGoals: 1 },
//     q3: ["Lamine Yamal", "Lamine Yamal", "Dani Olmo"],
//   }
export const EXPRESS_OUTCOMES: Record<string, ExpressOutcome> = {
  // España 4 - Arabia Saudí 0 (21 jun, Atlanta).
  "ESP-SAU-J2": {
    q1: "win",
    q2: { teamGoals: 4, opponentGoals: 0 },
    q3: ["Lamine Yamal", "Mikel Oyarzabal", "Mikel Oyarzabal", "Gol en propia (Arabia Saudí)"],
  },
  // Uruguay 0 - España 1 (26 jun, Guadalajara).
  "URU-ESP-J3": {
    binaryAnswers: {
      "uru-corners":     "0", // 3 o menos
      "valverde-clean":  "0", // Sí
      "oyarzabal-goal":  "1", // No
      "esp-win":         "0", // Sí
      "zubimendi-plays": "1", // No
      "esp-yellows":     "0", // 1 o menos
    },
  },
  // España 3 - Austria 0 (2 jul, Los Ángeles). Doblete Oyarzábal + gol Porro.
  "ESP-AUT-R32": {
    binaryAnswers: {
      "esp-first-sub-out": "Álex Baena",
      "esp-first-sub-in":  "Ferran Torres",
      "cards-1h":          "0", // 0 tarjetas
      "goals-2h":          "2", // 2 goles
      "any-penalty":       "1", // No
      "delafuente-outfit": "0", // Sí
      "yamal-goals":       "0", // 0 goles
    },
  },
  // Portugal 0 - España 1 (6 jul, Dallas). Gol de Merino al 91'.
  // Nota: "Baena goals" se recibió como "No" — interpretado como 0 goles,
  // consistente con el reporte del partido (Diogo Costa le paró dos
  // disparos a Baena, que no llegó a marcar).
  "POR-ESP-R16": {
    binaryAnswers: {
      "cr7-shots-on-target": "2",  // 2
      "cr7-yellow":          "1",  // No
      "yamal-fouls":         "2",  // 2
      "baena-goals":         "0",  // 0 (interpretado de "No")
      "ramos-goals":         "0",  // 0
      "vitinha-yellow":      "1",  // No
      "extra-time":          "1",  // No
      "penalty-shootout":    "1",  // No
    },
  },
  // España 2 - Bélgica 1 (10 jul, Los Ángeles). Fabián Ruiz (30') empata
  // De Ketelaere; Merino marca el definitivo tras entrar de banquillo.
  "ESP-BEL-QF": {
    binaryAnswers: {
      "first-goal-minute":  "30",            // minuto 30
      "first-scoring-team": "0",             // España
      "total-goals":        "3",             // 3 goles (2-1)
      "goal-first-15":      "1",             // No
      "first-scorer":       "Fabián Ruiz",   // gol del 30'
      "any-penalty":        "1",             // No
      "total-cards":        "4",             // 4 tarjetas
      "any-brace":          "1",             // No
      "goal-outside-box":   "1",             // No
      "goal-stoppage-time": "1",             // No
      "spain-possession":   "2",             // 60–70% (61%)
    },
  },
};

export function getExpressBet(id: string): ExpressBet | undefined {
  return EXPRESS_BETS.find((b) => b.id === id);
}

export function getExpressOutcome(id: string): ExpressOutcome | undefined {
  return EXPRESS_OUTCOMES[id];
}

export function isExpressLocked(bet: ExpressBet): boolean {
  return Date.now() >= new Date(bet.deadline).getTime();
}

export function isExpressResolved(id: string): boolean {
  return !!EXPRESS_OUTCOMES[id];
}
