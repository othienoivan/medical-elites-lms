import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  type DocumentData,
} from "firebase/firestore";
import { db } from "../../../config/firebase";

export type PlatformCollectionName =
  | "tenants"
  | "plans"
  | "featureFlags"
  | "auditLogs"
  | "supportTickets"
  | "platformAnnouncements"
  | "platformUsage"
  | "roadmapItems"
  | "licenseGrants"
  | "platformSettings";

function clean<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined)) as T;
}

export async function listPlatformRecords<T extends { id: string }>(
  collectionName: PlatformCollectionName,
  maximum = 200,
): Promise<T[]> {
  const base = collection(db, collectionName);
  let snapshot;
  try {
    snapshot = await getDocs(query(base, orderBy("updatedAt", "desc"), limit(maximum)));
  } catch {
    snapshot = await getDocs(query(base, limit(maximum)));
  }
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as T));
}

export async function createPlatformRecord<T extends Record<string, unknown>>(
  collectionName: PlatformCollectionName,
  payload: T,
): Promise<string> {
  const ref = await addDoc(collection(db, collectionName), clean({
    ...payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }));
  return ref.id;
}

export async function savePlatformRecord<T extends Record<string, unknown>>(
  collectionName: PlatformCollectionName,
  id: string,
  payload: T,
): Promise<void> {
  await setDoc(doc(db, collectionName, id), clean({
    ...payload,
    updatedAt: serverTimestamp(),
  }), { merge: true });
}

export async function updatePlatformRecord<T extends Record<string, unknown>>(
  collectionName: PlatformCollectionName,
  id: string,
  payload: T,
): Promise<void> {
  await updateDoc(doc(db, collectionName, id), clean({
    ...payload,
    updatedAt: serverTimestamp(),
  }) as DocumentData);
}

export async function removePlatformRecord(
  collectionName: PlatformCollectionName,
  id: string,
): Promise<void> {
  await deleteDoc(doc(db, collectionName, id));
}
