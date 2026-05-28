"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading, configured } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && configured && !user) {
      router.replace("/login");
    }
  }, [loading, user, configured, router]);

  if (!configured) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-sm text-center space-y-3">
          <h2 className="text-xl font-display font-bold">Configura Firebase</h2>
          <p className="text-sm text-muted">
            Copia <code className="bg-bg-card px-1.5 py-0.5 rounded">.env.local.example</code> a{" "}
            <code className="bg-bg-card px-1.5 py-0.5 rounded">.env.local</code> y rellena las claves de Firebase.
          </p>
        </div>
      </div>
    );
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-white/20 border-t-brand animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
