"use client";

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Header } from "@/components/Header";

// Los registros están cerrados — solo juegan los miembros ya invitados.
export default function RegisterClosedPage() {
  return (
    <AppShell>
      <Header title="Inscripción cerrada" back="/login" />

      <div className="container-app mt-10">
        <div className="rounded-2xl bg-bg-card border border-line p-6 text-center">
          <div className="text-4xl mb-3">🔒</div>
          <h2 className="font-display font-bold text-lg mb-2">Porra cerrada</h2>
          <p className="text-sm text-muted leading-relaxed">
            La inscripción a esta porra está cerrada — solo juegan los
            miembros ya invitados. Si ya tienes cuenta puedes acceder con
            normalidad.
          </p>
        </div>

        <Link
          href="/login"
          className="block mt-6 text-center text-brand font-medium text-sm"
        >
          ← Volver al inicio de sesión
        </Link>
      </div>
    </AppShell>
  );
}
