export type InvoiceStatus = "unpaid" | "partially-paid" | "paid" | "waived";
export type PaymentMethod = "cash" | "mobile-money" | "bank" | "card" | "other";

export interface FeeItem {
  id: string;
  name: string;
  amount: number;
  required: boolean;
}

export interface FeeStructure {
  id: string;
  title: string;
  programmeId: string;
  programmeTitle: string;
  academicYear: string;
  semester: string;
  currency: "UGX";
  items: FeeItem[];
  totalAmount: number;
  published: boolean;
  createdByUid: string;
  createdByName: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface StudentInvoice {
  id: string;
  studentId: string;
  studentAuthUid?: string;
  studentEmail: string;
  studentName: string;
  registrationNumber: string;
  programmeId: string;
  programmeTitle: string;
  feeStructureId: string;
  feeStructureTitle: string;
  academicYear: string;
  semester: string;
  currency: "UGX";
  grossAmount: number;
  discountAmount: number;
  scholarshipAmount: number;
  penaltyAmount: number;
  amountDue: number;
  amountPaid: number;
  balance: number;
  status: InvoiceStatus;
  notes?: string;
  issuedByUid: string;
  issuedByName: string;
  issuedAt?: Date;
  updatedAt?: Date;
}

export interface FinancePayment {
  id: string;
  invoiceId: string;
  studentId: string;
  studentAuthUid?: string;
  studentEmail: string;
  studentName: string;
  registrationNumber: string;
  amount: number;
  currency: "UGX";
  method: PaymentMethod;
  reference: string;
  receiptNumber: string;
  notes?: string;
  receivedByUid: string;
  receivedByName: string;
  paidAt?: Date;
  createdAt?: Date;
}
