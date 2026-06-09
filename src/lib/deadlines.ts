// Plazos oficiales de la porra
// España usa CEST (UTC+2) en junio de 2026

// Grupos y apuestas especiales: viernes 12 de junio a las 20:00h (España)
export const GROUP_DEADLINE = new Date("2026-06-12T18:00:00Z"); // 20:00 CEST = 18:00 UTC
export const SPECIALS_DEADLINE = GROUP_DEADLINE;

export function isGroupsLocked(): boolean {
  return Date.now() >= GROUP_DEADLINE.getTime();
}

export function isSpecialsLocked(): boolean {
  return Date.now() >= SPECIALS_DEADLINE.getTime();
}

// Eliminatorias: cierre 1 hora antes del pitido inicial
export function isKnockoutLocked(kickoffISO: string): boolean {
  return Date.now() >= new Date(kickoffISO).getTime() - 3_600_000;
}

// Formatea una fecha en hora española
export function formatDeadlineSpain(date: Date): string {
  return date.toLocaleString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Madrid",
  });
}

// Próximo partido KO cuyo plazo aún no ha pasado
export function nextKnockoutDeadline(kickoffs: string[]): string | null {
  const now = Date.now();
  const upcoming = kickoffs
    .map((k) => new Date(k))
    .filter((d) => d.getTime() - 3_600_000 > now)
    .sort((a, b) => a.getTime() - b.getTime());
  return upcoming[0]?.toISOString() ?? null;
}
