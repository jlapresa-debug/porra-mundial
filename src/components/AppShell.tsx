import { BottomNav } from "./BottomNav";
import { AuthGate } from "./AuthGate";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <div className="min-h-screen pb-28">{children}</div>
      <BottomNav />
    </AuthGate>
  );
}
