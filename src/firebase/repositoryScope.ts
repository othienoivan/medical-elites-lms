import {
  collection,
  getDocs,
  query,
  where,
  type DocumentData,
  type QueryConstraint,
  type QueryDocumentSnapshot,
  type QuerySnapshot,
} from "firebase/firestore";

import { db } from "../config/firebase";
import { requireAccessScope, type AccessScope } from "./accessScope";

export type ScopedRecord = {
  id: string;
  data: DocumentData;
};

type ScopeOptions = {
  ownerFields?: string[];
  assignedTutorField?: string;
  extraConstraints?: QueryConstraint[];
};

function dedupe(snapshots: QueryDocumentSnapshot<DocumentData>[][]): ScopedRecord[] {
  const records = new Map<string, ScopedRecord>();
  snapshots.flat().forEach((item) => {
    records.set(item.id, { id: item.id, data: item.data() });
  });
  return [...records.values()];
}

export async function listScopedRecords(
  collectionName: string,
  rawScope: AccessScope | null | undefined,
  options: ScopeOptions = {},
): Promise<ScopedRecord[]> {
  const scope = requireAccessScope(rawScope);
  const constraints = options.extraConstraints ?? [];
  const source = collection(db, collectionName);

  if (scope.role === "tutor") {
    const ownerFields = options.ownerFields?.length
      ? options.ownerFields
      : ["ownerUserId", "createdByUid", "createdBy", "tutorUid", "tutorId"];

    const reads = ownerFields.map((field) =>
      getDocs(query(source, where(field, "==", scope.uid), ...constraints))
    );

    if (options.assignedTutorField) {
      reads.push(
        getDocs(
          query(
            source,
            where(options.assignedTutorField, "array-contains", scope.uid),
            ...constraints,
          ),
        ),
      );
    }

    const settled = await Promise.allSettled(reads);
    return dedupe(
      settled
        .filter((item): item is PromiseFulfilledResult<QuerySnapshot<DocumentData>> => item.status === "fulfilled")
        .map((item) => item.value.docs),
    );
  }

  const tenantReads: Promise<QuerySnapshot<DocumentData>>[] = [];
  if (scope.tenantId) {
    tenantReads.push(getDocs(query(source, where("tenantId", "==", scope.tenantId), ...constraints)));
  }
  if (scope.institutionId && scope.institutionId !== scope.tenantId) {
    tenantReads.push(
      getDocs(query(source, where("institutionId", "==", scope.institutionId), ...constraints)),
    );
  }

  if (!tenantReads.length) {
    throw new Error("An active tenant workspace is required to load this data.");
  }

  const settled = await Promise.allSettled(tenantReads);
  return dedupe(
    settled
      .filter((item): item is PromiseFulfilledResult<QuerySnapshot<DocumentData>> => item.status === "fulfilled")
      .map((item) => item.value.docs),
  );
}

export function tenantAuditFields(scope: AccessScope): Record<string, string> {
  return {
    createdByUid: scope.uid,
    ownerUserId: scope.uid,
    ...(scope.tenantId ? { tenantId: scope.tenantId } : {}),
    ...(scope.institutionId ? { institutionId: scope.institutionId } : {}),
  };
}
