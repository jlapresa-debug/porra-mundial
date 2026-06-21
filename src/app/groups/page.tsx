"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Header } from "@/components/Header";
import { useGroups } from "@/hooks/useGroups";

// La página /groups ya no muestra una lista — redirige automáticamente al
// único grupo activo (Ako Gay). Los registros nuevos están cerrados y no se
// crean ni se unen grupos nuevos.
export default function GroupsRedirectPage() {
  const router = useRouter();
  const { groups, loading } = useGroups();

  useEffect(() => {
    if (loading) return;
    if (groups.length > 0) {
      router.replace(`/groups/${groups[0].id}`);
    }
  }, [loading, groups, router]);

  return (
    <AppShell>
      <Header title="Clasificación" />
      <div className="container-app mt-8 text-center text-sm text-muted">
        {loading
          ? "Cargando…"
          : groups.length === 0
            ? "No estás en ningún grupo. Pídele al administrador que te añada."
            : "Abriendo clasificación…"}
      </div>
    </AppShell>
  );
}
