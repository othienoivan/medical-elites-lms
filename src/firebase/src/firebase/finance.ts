import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "../config/firebase";
import type {
  FeeStructure,
  FinancePayment,
  InvoiceStatus,
  StudentInvoice,
} from "../models/Finance";

const FEE_STRUCTURES = "feeStructures";
const INVOICES = "studentInvoices";
const PAYMENTS = "financePayments";

function toDate(value: unknown): Date | undefined {
  if (value instanceof Date) return value;
  if (value && typeof value === "object" && "toDate" in value) {
    return (value as { toDate: () => Date }).toDate();
  }
  return undefined;
}

function clean<T>(value: T): T {
  if (Array.isArray(value)) return value.map(clean) as T;
  if (value && typeof value === "object" && !(value instanceof Date)) {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, item]) => item !== undefined)
        .map(([key, item]) => [key, clean(item)])
    ) as T;
  }
  return value;
}

function feeFromSnapshot(id: string, data: Record<string, unknown>): FeeStructure {
  return {
    ...(data as unknown as FeeStructure),
    id,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

function invoiceFromSnapshot(id: string, data: Record<string, unknown>): StudentInvoice {
  return {
    ...(data as unknown as StudentInvoice),
    id,
    issuedAt: toDate(data.issuedAt),
    updatedAt: toDate(data.updatedAt),
  };
}

function paymentFromSnapshot(id: string, data: Record<string, unknown>): FinancePayment {
  return {
    ...(data as unknown as FinancePayment),
    id,
    paidAt: toDate(data.paidAt),
    createdAt: toDate(data.createdAt),
  };
}

export async function createFeeStructure(
  input: Omit<FeeStructure, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const reference = await addDoc(collection(db, FEE_STRUCTURES), clean({
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }));
  return reference.id;
}

export async function getFeeStructures(tutorUid: string): Promise<FeeStructure[]> {
  if (!tutorUid) return [];
  const snapshot = await getDocs(
    query(collection(db, FEE_STRUCTURES), where("createdByUid", "==", tutorUid), orderBy("createdAt", "desc"))
  );
  return snapshot.docs.map((item) => feeFromSnapshot(item.id, item.data()));
}

export async function updateFeeStructure(
  feeStructureId: string,
  updates: Partial<FeeStructure>
): Promise<void> {
  await updateDoc(doc(db, FEE_STRUCTURES, feeStructureId), clean({
    ...updates,
    updatedAt: serverTimestamp(),
  }));
}

export async function createStudentInvoice(
  input: Omit<StudentInvoice, "id" | "issuedAt" | "updatedAt">
): Promise<string> {
  const existing = await getDocs(
    query(collection(db, INVOICES), where("studentId", "==", input.studentId))
  );
  if (existing.docs.some((item) => item.data().feeStructureId === input.feeStructureId)) {
    throw new Error("This fee structure has already been billed to the student.");
  }

  const reference = await addDoc(collection(db, INVOICES), clean({
    ...input,
    issuedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }));
  return reference.id;
}

export async function getStudentInvoices(tutorUid: string): Promise<StudentInvoice[]> {
  if (!tutorUid) return [];
  const snapshot = await getDocs(
    query(collection(db, INVOICES), where("issuedByUid", "==", tutorUid), orderBy("issuedAt", "desc"))
  );
  return snapshot.docs.map((item) => invoiceFromSnapshot(item.id, item.data()));
}

async function runOwnedQuery<T>(operation: Promise<T>): Promise<T | null> {
  try {
    return await operation;
  } catch (error) {
    console.warn("Finance identity query skipped:", error);
    return null;
  }
}

export async function getInvoicesForStudent(
  studentId: string,
  authUid?: string,
  email?: string | null
): Promise<StudentInvoice[]> {
  const results = new Map<string, StudentInvoice>();
  const normalizedEmail = email?.trim().toLowerCase() || "";
  const searches = [];

  if (authUid) {
    searches.push(runOwnedQuery(getDocs(query(collection(db, INVOICES), where("studentAuthUid", "==", authUid)))));
  }
  if (normalizedEmail) {
    searches.push(runOwnedQuery(getDocs(query(collection(db, INVOICES), where("studentEmail", "==", normalizedEmail)))));
  }
  if (!authUid && !normalizedEmail && studentId) {
    searches.push(runOwnedQuery(getDocs(query(collection(db, INVOICES), where("studentId", "==", studentId)))));
  }

  const snapshots = await Promise.all(searches);
  snapshots.forEach((snapshot) => {
    snapshot?.docs.forEach((item) => results.set(item.id, invoiceFromSnapshot(item.id, item.data())));
  });

  return [...results.values()].sort(
    (a, b) => (b.issuedAt?.getTime() || 0) - (a.issuedAt?.getTime() || 0)
  );
}

export async function recordFinancePayment(
  input: Omit<FinancePayment, "id" | "receiptNumber" | "paidAt" | "createdAt">
): Promise<string> {
  if (input.amount <= 0) throw new Error("Payment amount must be greater than zero.");

  const invoiceRef = doc(db, INVOICES, input.invoiceId);
  const paymentRef = doc(collection(db, PAYMENTS));
  const receiptNumber = `ME-${new Date().getFullYear()}-${paymentRef.id.slice(0, 8).toUpperCase()}`;

  await runTransaction(db, async (transaction) => {
    const invoiceSnapshot = await transaction.get(invoiceRef);
    if (!invoiceSnapshot.exists()) throw new Error("The selected invoice no longer exists.");

    const invoice = invoiceFromSnapshot(invoiceSnapshot.id, invoiceSnapshot.data());
    if (input.amount > invoice.balance) {
      throw new Error(`Payment exceeds the outstanding balance of UGX ${invoice.balance.toLocaleString()}.`);
    }

    const amountPaid = invoice.amountPaid + input.amount;
    const balance = Math.max(0, invoice.amountDue - amountPaid);
    const status: InvoiceStatus = balance === 0 ? "paid" : "partially-paid";

    transaction.set(paymentRef, clean({
      ...input,
      receiptNumber,
      paidAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    }));

    transaction.update(invoiceRef, {
      amountPaid,
      balance,
      status,
      updatedAt: serverTimestamp(),
    });
  });

  return paymentRef.id;
}

export async function getFinancePayments(tutorUid: string): Promise<FinancePayment[]> {
  if (!tutorUid) return [];
  const snapshot = await getDocs(
    query(collection(db, PAYMENTS), where("receivedByUid", "==", tutorUid), orderBy("createdAt", "desc"))
  );
  return snapshot.docs.map((item) => paymentFromSnapshot(item.id, item.data()));
}

export async function getPaymentsForStudent(
  studentId: string,
  authUid?: string,
  email?: string | null
): Promise<FinancePayment[]> {
  const results = new Map<string, FinancePayment>();
  const normalizedEmail = email?.trim().toLowerCase() || "";
  const searches = [];

  if (authUid) searches.push(runOwnedQuery(getDocs(query(collection(db, PAYMENTS), where("studentAuthUid", "==", authUid)))));
  if (normalizedEmail) searches.push(runOwnedQuery(getDocs(query(collection(db, PAYMENTS), where("studentEmail", "==", normalizedEmail)))));
  if (!authUid && !normalizedEmail && studentId) {
    searches.push(runOwnedQuery(getDocs(query(collection(db, PAYMENTS), where("studentId", "==", studentId)))));
  }

  const snapshots = await Promise.all(searches);
  snapshots.forEach((snapshot) => {
    snapshot?.docs.forEach((item) => results.set(item.id, paymentFromSnapshot(item.id, item.data())));
  });
  return [...results.values()].sort(
    (a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
  );
}

export async function getInvoiceById(invoiceId: string): Promise<StudentInvoice | null> {
  const snapshot = await getDoc(doc(db, INVOICES, invoiceId));
  return snapshot.exists() ? invoiceFromSnapshot(snapshot.id, snapshot.data()) : null;
}
