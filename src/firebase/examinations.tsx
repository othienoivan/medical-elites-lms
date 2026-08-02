import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "../config/firebase";
import type { Examination } from "../models/Examination";
import { writeAuditLog } from "./auditLogs";
import type { AccessScope } from "./accessScope";
import { listScopedRecords, tenantAuditFields } from "./repositoryScope";

const COLLECTION = "examinations";

export async function createExamination(
  examination: Examination,
  scope?: AccessScope,
): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...examination,
    ...(scope ? tenantAuditFields(scope) : {}),
    id: "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await updateDoc(doc(db, COLLECTION, docRef.id), {
    id: docRef.id,
  });

  if (examination.createdByUid) {
    void writeAuditLog({
      action: "examination.create",
      actorUid: examination.createdByUid,
      actorRole: "tutor",
      institutionId: examination.institutionId ?? null,
      resourceType: "examination",
      resourceId: docRef.id,
      summary: `Created examination: ${examination.title}`,
      metadata: { status: examination.status, totalMarks: examination.totalMarks },
    });
  }

  return docRef.id;
}

export async function getExaminations(scope: AccessScope): Promise<Examination[]> {
  const records = await listScopedRecords(COLLECTION, scope, {
    ownerFields: ["createdByUid", "createdBy", "ownerUserId"],
    assignedTutorField: "assignedTutorIds",
  });

  return records
    .map((record) => ({
      ...(record.data as Omit<Examination, "id">),
      id: record.id,
    }))
    .sort((a, b) => a.title.localeCompare(b.title));
}

export async function getExaminationById(
  id: string
): Promise<Examination | null> {
  const snapshot = await getDoc(doc(db, COLLECTION, id));

  if (!snapshot.exists()) {
    return null;
  }

  return {
    ...(snapshot.data() as Omit<Examination, "id">),
    id: snapshot.id,
  };
}

export async function updateExamination(
  id: string,
  data: Partial<Examination>,
  actor?: { uid: string; role: "tutor" | "admin"; institutionId?: string | null }
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });

  if (actor) {
    void writeAuditLog({
      action: "examination.update",
      actorUid: actor.uid,
      actorRole: actor.role,
      institutionId: actor.institutionId ?? null,
      resourceType: "examination",
      resourceId: id,
      summary: "Updated examination",
      metadata: { status: data.status ?? null },
    });
  }
}

export async function deleteExamination(
  id: string,
  actor?: { uid: string; role: "tutor" | "admin"; institutionId?: string | null }
): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
  if (actor) {
    void writeAuditLog({
      action: "examination.delete",
      actorUid: actor.uid,
      actorRole: actor.role,
      institutionId: actor.institutionId ?? null,
      resourceType: "examination",
      resourceId: id,
      summary: "Deleted examination",
    });
  }
}
function shuffled<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }
  return copy;
}

export async function createExaminationVersions(
  examination: Examination,
  count: number
): Promise<string[]> {
  const safeCount = Math.min(Math.max(count, 1), 4);
  const ids: string[] = [];
  for (let index = 0; index < safeCount; index += 1) {
    const label = String.fromCharCode(65 + index);
    const sections = examination.sections.map((section) => ({
      ...section,
      id: crypto.randomUUID(),
      questions: shuffled(section.questions).map((question, order) => ({
        ...question,
        id: crypto.randomUUID(),
        order: order + 1,
      })),
    }));
    ids.push(await createExamination({
      ...examination,
      id: "",
      title: `${examination.title} - Version ${label}`,
      versionLabel: label,
      sourceExaminationId: examination.id || undefined,
      sections,
      status: "draft",
    }));
  }
  return ids;
}
