"use client";

import { useEffect, useState } from "react";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { ExpressPrediction, GroupMemberScore, SpecialBets } from "@/lib/types";
import { ALL_MATCHES } from "@/lib/matches";
import { DEFAULT_RULES, totalScore } from "@/lib/scoring";
import { EXPRESS_OUTCOMES } from "@/lib/express";
import { getAllFinalStandings } from "@/lib/bracket";
import { TOURNAMENT_OUTCOME } from "@/lib/results";

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

          const specialsDoc = await getDoc(doc(db!, "users", uid, "meta", "specials"));
          const specials = (specialsDoc.data() as SpecialBets) ?? {};

          const expressSnap = await getDocs(collection(db!, "users", uid, "express"));
          const expressPredictions: Record<string, ExpressPrediction> = {};
          expressSnap.forEach((d) => {
            expressPredictions[d.id] = d.data() as ExpressPrediction;
          });

          const { total, groupHits, koHits } = totalScore(
            groupPredictions,
            knockoutPredictions,
            specials,
            ALL_MATCHES,
            getAllFinalStandings(ALL_MATCHES),
            TOURNAMENT_OUTCOME,
            DEFAULT_RULES,
            expressPredictions,
            EXPRESS_OUTCOMES,
          );

          return {
            uid,
            displayName: (profile.displayName as string) ?? "Anónimo",
            photoURL: (profile.photoURL as string | null) ?? null,
            points: total,
            groupHits,
            koHits,
          };
        }),
      );

      if (!cancelled) {
        setRanking(results.sort((a, b) => b.points - a.points || b.groupHits - a.groupHits));
        setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberIds.join(",")]);

  return { ranking, loading };
}
