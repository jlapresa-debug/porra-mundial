"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Header } from "@/components/Header";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useGroups } from "@/hooks/useGroups";

export default function NewGroupPage() {
  const router = useRouter();
  const { createGroup } = useGroups();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const g = await createGroup(name.trim());
      router.replace(`/groups/${g.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <Header title="Crear grupo" back="/groups" />

      <form onSubmit={handleSubmit} className="container-app mt-6 grid gap-4">
        <Input
          label="Nombre del grupo"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej. La porra de los Cumpas"
          required
          minLength={3}
          maxLength={40}
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <Button type="submit" size="lg" loading={loading} disabled={name.trim().length < 3}>
          Crear grupo
        </Button>

        <p className="text-xs text-muted text-center mt-2">
          Se generará un código único de 6 caracteres para invitar a tus amigos.
        </p>
      </form>
    </AppShell>
  );
}
