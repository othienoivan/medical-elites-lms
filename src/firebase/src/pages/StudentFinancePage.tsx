import { CheckCircle2, FileText, Printer, ReceiptText, WalletCards } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Container from "../components/ui/Container";
import { getInvoicesForStudent, getPaymentsForStudent } from "../firebase/finance";
import { getStudentByAuthIdentity } from "../firebase/students";
import useAuth from "../hooks/useAuth";
import type { FinancePayment, StudentInvoice } from "../models/Finance";
import type { Student } from "../models/Student";

function money(value: number) {
  return `UGX ${Math.round(value || 0).toLocaleString()}`;
}

export default function StudentFinancePage() {
  const { currentUser } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  const [invoices, setInvoices] = useState<StudentInvoice[]>([]);
  const [payments, setPayments] = useState<FinancePayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const linkedStudent = await getStudentByAuthIdentity(currentUser.uid, currentUser.email);
        setStudent(linkedStudent);
        if (!linkedStudent) {
          setInvoices([]);
          setPayments([]);
          return;
        }
        const [bills, receipts] = await Promise.all([
          getInvoicesForStudent(linkedStudent.id, currentUser.uid, currentUser.email),
          getPaymentsForStudent(linkedStudent.id, currentUser.uid, currentUser.email),
        ]);
        setInvoices(bills);
        setPayments(receipts);
      } catch (caughtError) {
        console.error("Failed to load student finance account:", caughtError);
        setError(caughtError instanceof Error ? caughtError.message : "Failed to load finance account.");
      } finally {
        setLoading(false);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [currentUser]);

  const totals = useMemo(() => ({
    billed: invoices.reduce((sum, item) => sum + item.amountDue, 0),
    paid: invoices.reduce((sum, item) => sum + item.amountPaid, 0),
    balance: invoices.reduce((sum, item) => sum + item.balance, 0),
  }), [invoices]);

  if (loading) return <main className="min-h-screen bg-slate-50 p-8">Loading your fees statement...</main>;

  return (
    <main className="min-h-screen bg-slate-50 py-10 print:bg-white">
      <Container>
        <section className="rounded-3xl bg-gradient-to-r from-emerald-700 to-teal-700 p-8 text-white print:bg-white print:text-black">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div><h1 className="text-3xl font-bold">My Fees Statement</h1><p className="mt-2 text-emerald-100 print:text-slate-600">{student?.fullName || currentUser?.email} · {student?.registrationNumber || "Student account"}</p></div>
            <Button className="print:hidden" onClick={() => window.print()}><Printer size={18} /> Print Statement</Button>
          </div>
        </section>

        {error && <Card className="mt-6 border border-red-200 text-red-700">{error}</Card>}

        <section className="mt-8 grid gap-4 md:grid-cols-4">
          <Stat title="Total Billed" value={money(totals.billed)} icon={FileText} />
          <Stat title="Total Paid" value={money(totals.paid)} icon={ReceiptText} />
          <Stat title="Balance" value={money(totals.balance)} icon={WalletCards} />
          <Stat title="Clearance" value={totals.balance === 0 && invoices.length > 0 ? "Cleared" : "Not Cleared"} icon={CheckCircle2} />
        </section>

        <Card className="mt-8 overflow-x-auto p-0">
          <div className="border-b p-6"><h2 className="text-xl font-bold">Invoices</h2></div>
          <table className="w-full min-w-[850px]"><thead className="bg-slate-100 text-left text-sm text-slate-600"><tr><th className="px-5 py-4">Period</th><th className="px-5 py-4">Description</th><th className="px-5 py-4">Due</th><th className="px-5 py-4">Paid</th><th className="px-5 py-4">Balance</th><th className="px-5 py-4">Status</th></tr></thead><tbody>{invoices.map((invoice) => <tr key={invoice.id} className="border-t"><td className="px-5 py-4">{invoice.academicYear}<br/><span className="text-sm text-slate-500">{invoice.semester}</span></td><td className="px-5 py-4 font-semibold">{invoice.feeStructureTitle}</td><td className="px-5 py-4">{money(invoice.amountDue)}</td><td className="px-5 py-4">{money(invoice.amountPaid)}</td><td className="px-5 py-4 font-bold">{money(invoice.balance)}</td><td className="px-5 py-4 capitalize">{invoice.status.replace("-", " ")}</td></tr>)}</tbody></table>
          {invoices.length === 0 && <p className="p-10 text-center text-slate-500">No fee invoices are available yet.</p>}
        </Card>

        <Card className="mt-8 overflow-x-auto p-0">
          <div className="border-b p-6"><h2 className="text-xl font-bold">Payment Receipts</h2></div>
          <table className="w-full min-w-[760px]"><thead className="bg-slate-100 text-left text-sm text-slate-600"><tr><th className="px-5 py-4">Date</th><th className="px-5 py-4">Receipt Number</th><th className="px-5 py-4">Method</th><th className="px-5 py-4">Reference</th><th className="px-5 py-4">Amount</th></tr></thead><tbody>{payments.map((payment) => <tr key={payment.id} className="border-t"><td className="px-5 py-4">{payment.paidAt?.toLocaleDateString() || "—"}</td><td className="px-5 py-4 font-semibold">{payment.receiptNumber}</td><td className="px-5 py-4 capitalize">{payment.method.replace("-", " ")}</td><td className="px-5 py-4">{payment.reference || "—"}</td><td className="px-5 py-4 font-bold text-emerald-700">{money(payment.amount)}</td></tr>)}</tbody></table>
          {payments.length === 0 && <p className="p-10 text-center text-slate-500">No payments have been recorded yet.</p>}
        </Card>
      </Container>
    </main>
  );
}

function Stat({ title, value, icon: Icon }: { title: string; value: string; icon: React.ElementType }) {
  return <Card><Icon size={28} className="text-emerald-700" /><p className="mt-3 text-sm font-semibold text-slate-500">{title}</p><p className="mt-1 text-2xl font-bold text-slate-950">{value}</p></Card>;
}
