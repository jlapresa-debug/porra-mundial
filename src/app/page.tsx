"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";

export default function Landing() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.replace("/matches");
  }, [user, loading, router]);

  return (
    <main className="min-h-screen flex flex-col">
      <div className="flex-1 container-app pt-16 flex flex-col items-center text-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-brand blur-3xl opacity-30" />
          <div className="relative w-24 h-24 rounded-3xl bg-gradient-brand grid place-items-center shadow-2xl shadow-brand/30">
            <span className="text-4xl">⚽</span>
          </div>
        </div>
        <h1 className="font-display text-4xl font-bold tracking-tight text-balance mb-3">
          La Porra del Mundial
        </h1>
        <p className="text-muted max-w-xs text-balance mb-12">
          Apuesta con tus amigos, pica en el grupo y demuestra quién sabe de fútbol en el Mundial 2026.
        </p>

        <div className="grid gap-3 w-full max-w-xs">
          <Link href="/register">
            <Button size="lg" fullWidth>Empezar gratis</Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="secondary" fullWidth>Ya tengo cuenta</Button>
          </Link>
        </div>
      </div>

      <footer className="container-app py-8 text-center text-xs text-muted">
        Mundial 2026 · USA · Canadá · México
      </footer>
    </main>
  );
}
