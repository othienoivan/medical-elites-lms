import { useCallback, useEffect, useState } from "react";

import {
  createFeeStructure,
  createStudentInvoice,
  getFeeStructures,
  getFinancePayments,
  getStudentInvoices,
  recordFinancePayment,
  updateFeeStructure,
} from "../firebase/finance";
import type { FeeStructure, FinancePayment, StudentInvoice } from "../models/Finance";

export default function useFinance() {
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [invoices, setInvoices] = useState<StudentInvoice[]>([]);
  const [payments, setPayments] = useState<FinancePayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFinance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [fees, bills, receipts] = await Promise.all([
        getFeeStructures(),
        getStudentInvoices(),
        getFinancePayments(),
      ]);
      setFeeStructures(fees);
      setInvoices(bills);
      setPayments(receipts);
    } catch (caughtError) {
      console.error("Failed to load finance records:", caughtError);
      setError(caughtError instanceof Error ? caughtError.message : "Failed to load finance records.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadFinance(), 0);
    return () => window.clearTimeout(timer);
  }, [loadFinance]);

  return {
    feeStructures,
    invoices,
    payments,
    loading,
    error,
    loadFinance,
    createFeeStructure: async (input: Parameters<typeof createFeeStructure>[0]) => {
      const id = await createFeeStructure(input);
      await loadFinance();
      return id;
    },
    updateFeeStructure: async (id: string, updates: Partial<FeeStructure>) => {
      await updateFeeStructure(id, updates);
      await loadFinance();
    },
    createStudentInvoice: async (input: Parameters<typeof createStudentInvoice>[0]) => {
      const id = await createStudentInvoice(input);
      await loadFinance();
      return id;
    },
    recordFinancePayment: async (input: Parameters<typeof recordFinancePayment>[0]) => {
      const id = await recordFinancePayment(input);
      await loadFinance();
      return id;
    },
  };
}
