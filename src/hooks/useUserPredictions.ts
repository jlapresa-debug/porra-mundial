"use client";

import { useEffect, useState } from "react";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { SpecialBets } from "@/lib/types";

export interface UserPredictionsData {
  displayName: string;
  photoURL: string | null;
  groupPredictions: Record<string, string[]>; // "A" → ["MEX","RSA","KOR","CZE"]
  knockoutPredictions: Record<string, string>; // "M73" → "MEX"
  specials: SpecialBets;
}

export function useUserPredictions(uid: string) {
  const [data, setData] = useState<UserPredictionsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db || !uid) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      const [profileSnap, predsSnap, specialsSnap] = await Promise.all([
        getDoc(doc(db!, "users", uid)),
        getDocs(collection(db!, "users", uid, "predictions")),
        getDoc(doc(db!, "users", uid, "meta", "specials")),
      ]);

      const profile = profileSnap.data() ?? {};
      const groupPredictions: Record<string, string[]> = {};
      const knockoutPredictions: Record<string, string> = {};

      predsSnap.forEach((d) => {
        if (d.id.startsWith("GROUP_")) {
          const order = d.data().order;
          if (Array.isArray(order)) {
            groupPredictions[d.id.replace("GROUP_", "")] = order;
          }
        } else {
          const winner = d.data().winner as string | undefined;
          if (winner) knockoutPredictions[d.id] = winner;
        }
      });

      if (!cancelled) {
        setData({
          displayName: (profile.displayName as string) || "Anónimo",
          photoURL: (profile.photoURL as string | null) ?? null,
          groupPredictions,
          knockoutPredictions,
          specials: (specialsSnap.data() as SpecialBets) ?? {},
        });
        setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [uid]);

  return { data, loading };
}
