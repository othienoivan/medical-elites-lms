import {
  Banknote,
  CheckCircle2,
  FileText,
  PlusCircle,
  ReceiptText,
  Search,
  WalletCards,
} from "lucide-react";
import { useMemo, useState } from "react";

import TutorLayout from "../components/layout/TutorLayout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { createNotification } from "../firebase/notifications";
import useAuth from "../hooks/useAuth";
import useFinance from "../hooks/useFinance";
import useProgrammes from "../hooks/useProgrammes";
import useStudents from "../hooks/useStudents";
import type { FeeItem, PaymentMethod } from "../models/Finance";

function money(value: number) {
  return `UGX ${Math.round(value || 0).toLocaleString()}`;
}

export default function FinanceManagerPage() {
  const { currentUser, userProfile } = useAuth();
  const { programmes } = useProgrammes();
  const { students } = useStudents();
  const {
    feeStructures,
    invoices,
    payments,
    loading,
    error,
    createFeeStructure,
    createStudentInvoice,
    recordFinancePayment,
  } = useFinance();

  const [tab, setTab] = useState<"overview" | "fees" | "billing" | "payments">("overview");
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  const [feeTitle, setFeeTitle] = useState("");
  const [programmeId, setProgrammeId] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [semester, setSemester] = useState("");
  const [feeItems, setFeeItems] = useState<FeeItem[]>([
    { id: crypto.randomUUID(), name: "Tuition", amount: 0, required: true },
  ]);

  const [invoiceStudentId, setInvoiceStudentId] = useState("");
  const [feeStructureId, setFeeStructureId] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [scholarshipAmount, setScholarshipAmount] = useState(0);
  const [penaltyAmount, setPenaltyAmount] = useState(0);
  const [invoiceNotes, setInvoiceNotes] = useState("");

  const [paymentInvoiceId, setPaymentInvoiceId] = useState("");
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");

  const selectedProgramme = programmes.find((item) => item.id === programmeId);
  const selectedStudent = students.find((item) => item.id === invoiceStudentId);
  const selectedFee = feeStructures.find((item) => item.id === feeStructureId);
  const selectedInvoice = invoices.find((item) => item.id === paymentInvoiceId);

  const totalBilled = invoices.reduce((sum, item) => sum + item.amountDue, 0);
  const totalCollected = payments.reduce((sum, item) => sum + item.amount, 0);
  const totalOutstanding = invoices.reduce((sum, item) => sum + item.balance, 0);
  const clearedStudents = new Set(invoices.filter((item) => item.status === "paid").map((item) => item.studentId)).size;

  const filteredInvoices = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return invoices;
    return invoices.filter((item) =>
      [item.studentName, item.registrationNumber, item.programmeTitle, item.feeStructureTitle]
        .some((value) => value.toLowerCase().includes(keyword))
    );
  }, [invoices, search]);

  async function handleCreateFee() {
    const validItems = feeItems
      .map((item) => ({ ...item, name: item.name.trim(), amount: Number(item.amount) || 0 }))
      .filter((item) => item.name && item.amount > 0);

    if (!feeTitle.trim() || !selectedProgramme || !academicYear.trim() || !semester.trim() || validItems.length === 0) {
      alert("Complete the fee structure details and add at least one valid fee item.");
      return;
    }

    try {
      setSaving(true);
      await createFeeStructure({
        title: feeTitle.trim(),
        programmeId: selectedProgramme.id,
        programmeTitle: selectedProgramme.title,
        academicYear: academicYear.trim(),
        semester: semester.trim(),
        currency: "UGX",
        items: validItems,
        totalAmount: validItems.reduce((sum, item) => sum + item.amount, 0),
        published: true,
        createdByUid: currentUser?.uid || "",
        createdByName: userProfile?.fullName || currentUser?.email || "Finance Officer",
      });
      setFeeTitle("");
      setProgrammeId("");
      setAcademicYear("");
      setSemester("");
      setFeeItems([{ id: crypto.randomUUID(), name: "Tuition", amount: 0, required: true }]);
      alert("Fee structure created successfully.");
    } catch (caughtError) {
      alert(caughtError instanceof Error ? caughtError.message : "Failed to create fee structure.");
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateInvoice() {
    if (!selectedStudent || !selectedFee) {
      alert("Select a student and fee structure.");
      return;
    }

    const amountDue = Math.max(
      0,
      selectedFee.totalAmount - discountAmount - scholarshipAmount + penaltyAmount
    );

    try {
      setSaving(true);
      await createStudentInvoice({
        studentId: selectedStudent.id,
        ...(selectedStudent.authUid ? { studentAuthUid: selectedStudent.authUid } : {}),
        studentEmail: selectedStudent.email.trim().toLowerCase(),
        studentName: selectedStudent.fullName,
        registrationNumber: selectedStudent.registrationNumber,
        programmeId: selectedStudent.programmeId,
        programmeTitle: selectedStudent.programmeTitle,
        feeStructureId: selectedFee.id,
        feeStructureTitle: selectedFee.title,
        academicYear: selectedFee.academicYear,
        semester: selectedFee.semester,
        currency: "UGX",
        grossAmount: selectedFee.totalAmount,
        discountAmount,
        scholarshipAmount,
        penaltyAmount,
        amountDue,
        amountPaid: 0,
        balance: amountDue,
        status: amountDue === 0 ? "paid" : "unpaid",
        notes: invoiceNotes.trim(),
        issuedByUid: currentUser?.uid || "",
        issuedByName: userProfile?.fullName || currentUser?.email || "Finance Officer",
      });
      if (selectedStudent.authUid) {
        void createNotification({
          userUid: selectedStudent.authUid,
          title: "New fees invoice",
          body: `${selectedFee.title}: ${money(amountDue)} is now available on your fees statement.`,
          type: "system",
          link: "/finance",
        }).catch((notificationError) =>
          console.warn("Invoice saved but notification failed:", notificationError)
        );
      }
      setInvoiceStudentId("");
      setFeeStructureId("");
      setDiscountAmount(0);
      setScholarshipAmount(0);
      setPenaltyAmount(0);
      setInvoiceNotes("");
      alert("Student invoice created successfully.");
    } catch (caughtError) {
      alert(caughtError instanceof Error ? caughtError.message : "Failed to create invoice.");
    } finally {
      setSaving(false);
    }
  }

  async function handlePayment() {
    if (!selectedInvoice || paymentAmount <= 0) {
      alert("Select an invoice and enter a valid payment amount.");
      return;
    }

    try {
      setSaving(true);
      await recordFinancePayment({
        invoiceId: selectedInvoice.id,
        studentId: selectedInvoice.studentId,
        ...(selectedInvoice.studentAuthUid ? { studentAuthUid: selectedInvoice.studentAuthUid } : {}),
        studentEmail: selectedInvoice.studentEmail,
        studentName: selectedInvoice.studentName,
        registrationNumber: selectedInvoice.registrationNumber,
        amount: paymentAmount,
        currency: "UGX",
        method: paymentMethod,
        reference: paymentReference.trim(),
        notes: paymentNotes.trim(),
        receivedByUid: currentUser?.uid || "",
        receivedByName: userProfile?.fullName || currentUser?.email || "Finance Officer",
      });
      if (selectedInvoice.studentAuthUid) {
        void createNotification({
          userUid: selectedInvoice.studentAuthUid,
          title: "Payment received",
          body: `${money(paymentAmount)} has been credited to your fees account.`,
          type: "system",
          link: "/finance",
        }).catch((notificationError) =>
          console.warn("Payment saved but notification failed:", notificationError)
        );
      }
      setPaymentInvoiceId("");
      setPaymentAmount(0);
      setPaymentReference("");
      setPaymentNotes("");
      alert("Payment recorded successfully.");
    } catch (caughtError) {
      alert(caughtError instanceof Error ? caughtError.message : "Failed to record payment.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <TutorLayout
      title="Finance Management"
      subtitle="Manage fee structures, student billing, payments, receipts and financial clearance."
    >
      <section className="mb-8 rounded-3xl bg-gradient-to-r from-emerald-700 to-teal-700 p-8 text-white">
        <h2 className="text-3xl font-bold">Institution Finance Centre</h2>
        <p className="mt-2 max-w-3xl text-emerald-100">
          Track billing, collections, balances, scholarships, discounts and student clearance from one workspace.
        </p>
      </section>

      <div className="mb-6 flex flex-wrap gap-2">
        {(["overview", "fees", "billing", "payments"] as const).map((item) => (
          <Button key={item} variant={tab === item ? "primary" : "outline"} onClick={() => setTab(item)}>
            {item === "overview" ? "Overview" : item === "fees" ? "Fee Structures" : item === "billing" ? "Student Billing" : "Record Payment"}
          </Button>
        ))}
      </div>

      {error && <Card className="mb-6 border border-red-200 text-red-700">{error}</Card>}

      {tab === "overview" && (
        <>
          <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Stat title="Total Billed" value={money(totalBilled)} icon={FileText} />
            <Stat title="Collected" value={money(totalCollected)} icon={Banknote} />
            <Stat title="Outstanding" value={money(totalOutstanding)} icon={WalletCards} />
            <Stat title="Cleared Students" value={clearedStudents} icon={CheckCircle2} />
          </section>

          <Card>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-950">Student Accounts</h3>
                <p className="mt-1 text-sm text-slate-600">Current invoices, balances and clearance status.</p>
              </div>
              <div className="relative md:w-96">
                <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
                <input value={search} onChange={(event) => setSearch(event.target.value)} className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4" placeholder="Search student or programme" />
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="bg-slate-100 text-left text-sm text-slate-600">
                  <tr>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Fee Structure</th>
                    <th className="px-4 py-3">Due</th>
                    <th className="px-4 py-3">Paid</th>
                    <th className="px-4 py-3">Balance</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="border-t border-slate-200">
                      <td className="px-4 py-4"><p className="font-semibold text-slate-900">{invoice.studentName}</p><p className="text-sm text-slate-500">{invoice.registrationNumber}</p></td>
                      <td className="px-4 py-4 text-slate-700">{invoice.feeStructureTitle}</td>
                      <td className="px-4 py-4">{money(invoice.amountDue)}</td>
                      <td className="px-4 py-4">{money(invoice.amountPaid)}</td>
                      <td className="px-4 py-4 font-semibold">{money(invoice.balance)}</td>
                      <td className="px-4 py-4"><StatusBadge status={invoice.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!loading && filteredInvoices.length === 0 && <p className="p-8 text-center text-slate-500">No student invoices found.</p>}
            </div>
          </Card>
        </>
      )}

      {tab === "fees" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <h3 className="text-xl font-bold">Create Fee Structure</h3>
            <div className="mt-5 grid gap-4">
              <Field label="Structure Title"><input value={feeTitle} onChange={(e) => setFeeTitle(e.target.value)} className="input" placeholder="Semester I Fees" /></Field>
              <Field label="Programme"><select value={programmeId} onChange={(e) => setProgrammeId(e.target.value)} className="input"><option value="">Select programme</option>{programmes.map((programme) => <option key={programme.id} value={programme.id}>{programme.title}</option>)}</select></Field>
              <div className="grid gap-4 md:grid-cols-2"><Field label="Academic Year"><input value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} className="input" placeholder="2026/2027" /></Field><Field label="Semester"><input value={semester} onChange={(e) => setSemester(e.target.value)} className="input" placeholder="Semester I" /></Field></div>
              <div>
                <div className="mb-3 flex items-center justify-between"><p className="font-semibold">Fee Items</p><Button size="sm" variant="outline" onClick={() => setFeeItems((items) => [...items, { id: crypto.randomUUID(), name: "", amount: 0, required: true }])}><PlusCircle size={16} /> Add Item</Button></div>
                <div className="space-y-3">{feeItems.map((item) => <div key={item.id} className="grid gap-3 md:grid-cols-[1fr_180px_auto]"><input value={item.name} onChange={(e) => setFeeItems((items) => items.map((row) => row.id === item.id ? { ...row, name: e.target.value } : row))} className="input" placeholder="Fee item" /><input type="number" min="0" value={item.amount || ""} onChange={(e) => setFeeItems((items) => items.map((row) => row.id === item.id ? { ...row, amount: Number(e.target.value) } : row))} className="input" placeholder="Amount" /><Button variant="outline" onClick={() => setFeeItems((items) => items.filter((row) => row.id !== item.id))}>Remove</Button></div>)}</div>
              </div>
              <div className="rounded-xl bg-emerald-50 p-4 text-lg font-bold text-emerald-800">Total: {money(feeItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0))}</div>
              <Button loading={saving} onClick={handleCreateFee}>Save Fee Structure</Button>
            </div>
          </Card>
          <Card>
            <h3 className="text-xl font-bold">Published Fee Structures</h3>
            <div className="mt-5 space-y-4">{feeStructures.map((fee) => <div key={fee.id} className="rounded-2xl border border-slate-200 p-4"><div className="flex justify-between gap-4"><div><h4 className="font-bold">{fee.title}</h4><p className="text-sm text-slate-500">{fee.programmeTitle} · {fee.academicYear} · {fee.semester}</p></div><p className="font-bold text-emerald-700">{money(fee.totalAmount)}</p></div></div>)}{!loading && feeStructures.length === 0 && <p className="text-slate-500">No fee structures created yet.</p>}</div>
          </Card>
        </div>
      )}

      {tab === "billing" && (
        <Card className="max-w-3xl">
          <h3 className="text-xl font-bold">Issue Student Invoice</h3>
          <div className="mt-5 grid gap-4">
            <Field label="Student"><select value={invoiceStudentId} onChange={(e) => setInvoiceStudentId(e.target.value)} className="input"><option value="">Select student</option>{students.filter((student) => student.status === "active").map((student) => <option key={student.id} value={student.id}>{student.fullName} — {student.registrationNumber}</option>)}</select></Field>
            <Field label="Fee Structure"><select value={feeStructureId} onChange={(e) => setFeeStructureId(e.target.value)} className="input"><option value="">Select fee structure</option>{feeStructures.filter((fee) => !selectedStudent || fee.programmeId === selectedStudent.programmeId).map((fee) => <option key={fee.id} value={fee.id}>{fee.title} — {money(fee.totalAmount)}</option>)}</select></Field>
            <div className="grid gap-4 md:grid-cols-3"><Field label="Discount"><input type="number" min="0" value={discountAmount || ""} onChange={(e) => setDiscountAmount(Number(e.target.value))} className="input" /></Field><Field label="Scholarship/Bursary"><input type="number" min="0" value={scholarshipAmount || ""} onChange={(e) => setScholarshipAmount(Number(e.target.value))} className="input" /></Field><Field label="Penalty"><input type="number" min="0" value={penaltyAmount || ""} onChange={(e) => setPenaltyAmount(Number(e.target.value))} className="input" /></Field></div>
            <Field label="Notes"><textarea value={invoiceNotes} onChange={(e) => setInvoiceNotes(e.target.value)} className="input min-h-24" /></Field>
            {selectedFee && <div className="rounded-xl bg-slate-50 p-4"><p>Gross: <strong>{money(selectedFee.totalAmount)}</strong></p><p className="mt-2">Amount Due: <strong>{money(Math.max(0, selectedFee.totalAmount - discountAmount - scholarshipAmount + penaltyAmount))}</strong></p></div>}
            <Button loading={saving} onClick={handleCreateInvoice}>Create Invoice</Button>
          </div>
        </Card>
      )}

      {tab === "payments" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <h3 className="text-xl font-bold">Record Payment</h3>
            <div className="mt-5 grid gap-4">
              <Field label="Outstanding Invoice"><select value={paymentInvoiceId} onChange={(e) => setPaymentInvoiceId(e.target.value)} className="input"><option value="">Select invoice</option>{invoices.filter((invoice) => invoice.balance > 0).map((invoice) => <option key={invoice.id} value={invoice.id}>{invoice.studentName} — {invoice.registrationNumber} — Balance {money(invoice.balance)}</option>)}</select></Field>
              <Field label="Amount"><input type="number" min="0" max={selectedInvoice?.balance} value={paymentAmount || ""} onChange={(e) => setPaymentAmount(Number(e.target.value))} className="input" /></Field>
              <Field label="Payment Method"><select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)} className="input"><option value="cash">Cash</option><option value="mobile-money">Mobile Money</option><option value="bank">Bank</option><option value="card">Card</option><option value="other">Other</option></select></Field>
              <Field label="Transaction / Deposit Reference"><input value={paymentReference} onChange={(e) => setPaymentReference(e.target.value)} className="input" placeholder="Optional reference" /></Field>
              <Field label="Notes"><textarea value={paymentNotes} onChange={(e) => setPaymentNotes(e.target.value)} className="input min-h-24" /></Field>
              <Button loading={saving} onClick={handlePayment}><ReceiptText size={18} /> Record Payment</Button>
            </div>
          </Card>
          <Card>
            <h3 className="text-xl font-bold">Recent Receipts</h3>
            <div className="mt-5 space-y-4">{payments.slice(0, 15).map((payment) => <div key={payment.id} className="rounded-2xl border border-slate-200 p-4"><div className="flex justify-between gap-4"><div><p className="font-bold">{payment.studentName}</p><p className="text-sm text-slate-500">{payment.receiptNumber} · {payment.method.replace("-", " ")}</p></div><p className="font-bold text-emerald-700">{money(payment.amount)}</p></div></div>)}{!loading && payments.length === 0 && <p className="text-slate-500">No payments recorded yet.</p>}</div>
          </Card>
        </div>
      )}
    </TutorLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>{children}</label>;
}

function Stat({ title, value, icon: Icon }: { title: string; value: string | number; icon: React.ElementType }) {
  return <Card><div className="flex items-center justify-between"><div><p className="text-sm font-semibold text-slate-500">{title}</p><p className="mt-2 text-2xl font-bold text-slate-950">{value}</p></div><Icon className="text-emerald-700" size={32} /></div></Card>;
}

function StatusBadge({ status }: { status: string }) {
  const classes = status === "paid" ? "bg-green-100 text-green-700" : status === "partially-paid" ? "bg-amber-100 text-amber-800" : status === "waived" ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700";
  return <span className={`rounded-full px-3 py-1 text-sm font-semibold capitalize ${classes}`}>{status.replace("-", " ")}</span>;
}
