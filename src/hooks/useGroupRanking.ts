"use client";

import { useEffect, useState } from "react";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { GroupMemberScore, Prediction, SpecialBets } from "@/lib/types";
import { ALL_MATCHES } from "@/lib/matches";
import { DEFAULT_RULES, totalScore } from "@/lib/scoring";

export function useGroupRanking(memberIds: string[]) {
  const [ranking, setRanking] = useState<GroupMemberScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!db || memberIds.length === 0) {
        setRanking([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const results = await Promise.all(
        memberIds.map(async (uid) => {
          const profileDoc = await getDoc(doc(db!, "users", uid));
          const profile = profileDoc.data() ?? { displayName: "Anónimo", photoURL: null };
          const predsSnap = await getDocs(collection(db!, "users", uid, "predictions"));
          const predictions: Record<string, Prediction> = {};
          predsSnap.forEach((d) => (predictions[d.id] = d.data() as Prediction));
          const specialsDoc = await getDoc(doc(db!, "users", uid, "meta", "specials"));
          const specials = (specialsDoc.data() as SpecialBets) ?? {};
          const { total, exact, signs } = totalScore(predictions, specials, ALL_MATCHES, {}, DEFAULT_RULES);
          return {
            uid,
            displayName: (profile.displayName as string) ?? "Anónimo",
            photoURL: (profile.photoURL as string | null) ?? null,
            points: total,
            exact,
            signs,
          };
        }),
      );
      if (!cancelled) {
        setRanking(results.sort((a, b) => b.points - a.points || b.exact - a.exact));
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [memberIds.join(",")]);

  return { ranking, loading };
}
