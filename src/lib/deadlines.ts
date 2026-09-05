// Plazos de la porra de Champions League 2026/27.

// Las apuestas especiales (campeón/subcampeón/máximo goleador) cierran al
// pitido inicial del primer partido de la fase de liga.
export const SPECIALS_DEADLINE = new Date("2026-09-08T16:45:00Z"); // 18:45 CEST, J1

export function isSpecialsLocked(): boolean {
  return Date.now() >= SPECIALS_DEADLINE.getTime();
}

// Cualquier partido (fase de liga o eliminatoria) cierra 1 hora antes del pitido
export function isMatchLocked(kickoffISO: string): boolean {
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

// Próximo cierre entre una lista de kickoffs (para mostrar "próximo plazo")
export function nextMatchDeadline(kickoffs: string[]): string | null {
  const now = Date.now();
  const upcoming = kickoffs
    .map((k) => new Date(k))
    .filter((d) => d.getTime() - 3_600_000 > now)
    .sort((a, b) => a.getTime() - b.getTime());
  return upcoming[0]?.toISOString() ?? null;
}
