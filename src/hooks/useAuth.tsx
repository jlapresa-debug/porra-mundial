"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider, isFirebaseConfigured } from "@/lib/firebase";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  configured: boolean;
  signInEmail: (email: string, password: string) => Promise<void>;
  registerEmail: (email: string, password: string, displayName: string) => Promise<void>;
  signInGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      configured: isFirebaseConfigured,
      async signInEmail(email, password) {
        if (!auth) throw new Error("Firebase no configurado");
        await signInWithEmailAndPassword(auth, email, password);
      },
      async registerEmail() {
        // La inscripción está cerrada — el Mundial 2026 ya empezó.
        throw new Error("Inscripción cerrada. No se admiten nuevos usuarios.");
      },
      async signInGoogle() {
        if (!auth || !db) throw new Error("Firebase no configurado");
        const cred = await signInWithPopup(auth, googleProvider);
        const userRef = doc(db, "users", cred.user.uid);
        const existing = await getDoc(userRef);
        if (!existing.exists()) {
          // Nuevo usuario: registro cerrado, cerrar sesión y avisar
          await signOut(auth);
          throw new Error(
            "Inscripción cerrada. El Mundial ya está en marcha y no se admiten nuevos usuarios.",
          );
        }
        // Usuario existente: refrescar metadatos por si cambiaron en Google
        await setDoc(
          userRef,
          {
            uid: cred.user.uid,
            displayName: cred.user.displayName,
            email: cred.user.email,
            photoURL: cred.user.photoURL,
          },
          { merge: true },
        );
      },
      async logout() {
        if (!auth) return;
        await signOut(auth);
      },
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
