"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Las apuestas se hacen en la página principal /matches.
// Esta ruta redirige automáticamente.
export default function MatchRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/matches"); }, [router]);
  return null;
}
