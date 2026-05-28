"use client";

import { useEffect, useState } from "react";
import {
  collection,
  doc,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  arrayUnion,
  getDocs,
  serverTimestamp,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./useAuth";
import type { Group } from "@/lib/types";

function randomCode(len = 6) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export function useGroups() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !db) return;
    const q = query(collection(db, "groups"), where("memberIds", "array-contains", user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const list: Group[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...(d.data() as Omit<Group, "id">) }));
      setGroups(list.sort((a, b) => b.createdAt - a.createdAt));
      setLoading(false);
    });
    return unsub;
  }, [user]);

  async function createGroup(name: string): Promise<Group> {
    if (!user || !db) throw new Error("No autenticado");
    const code = randomCode();
    const ref = await addDoc(collection(db, "groups"), {
      name,
      code,
      ownerId: user.uid,
      memberIds: [user.uid],
      createdAt: Date.now(),
      createdAtServer: serverTimestamp(),
    });
    return {
      id: ref.id,
      name,
      code,
      ownerId: user.uid,
      memberIds: [user.uid],
      createdAt: Date.now(),
    };
  }

  async function joinByCode(code: string): Promise<Group> {
    if (!user || !db) throw new Error("No autenticado");
    const q = query(collection(db, "groups"), where("code", "==", code.toUpperCase()), limit(1));
    const snap = await getDocs(q);
    if (snap.empty) throw new Error("No existe un grupo con ese código");
    const d = snap.docs[0];
    await updateDoc(doc(db, "groups", d.id), { memberIds: arrayUnion(user.uid) });
    return { id: d.id, ...(d.data() as Omit<Group, "id">) };
  }

  return { groups, loading, createGroup, joinByCode };
}
