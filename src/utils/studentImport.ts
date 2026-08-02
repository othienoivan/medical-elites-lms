import * as XLSX from "xlsx";

export type StudentImportRow = {
  rowNumber: number;
  fullName: string;
  registrationNumber: string;
  studentNumber: string;
  programme: string;
  academicYear: string;
  intake: string;
  yearOfStudy: string;
  semester: string;
  email: string;
  phone: string;
  gender: string;
  dateOfBirth: string;
  nationalId: string;
  guardianName: string;
  guardianPhone: string;
  emergencyContact: string;
  sponsor: string;
  admissionDate: string;
  status: "active" | "deferred" | "completed" | "graduated";
  errors: string[];
};

const aliases: Record<string, string[]> = {
  fullName: ["full name", "name", "student name"],
  registrationNumber: ["registration number", "registration no", "reg no", "reg number"],
  studentNumber: ["student number", "student no", "student id"],
  programme: ["programme", "program", "course", "programme title"],
  academicYear: ["academic year", "academic session"],
  intake: ["intake"],
  yearOfStudy: ["year of study", "study year", "year"],
  semester: ["semester", "term"],
  email: ["email", "email address"],
  phone: ["phone", "telephone", "mobile", "phone number"],
  gender: ["gender", "sex"],
  dateOfBirth: ["date of birth", "dob"],
  nationalId: ["national id", "nin"],
  guardianName: ["guardian name", "next of kin"],
  guardianPhone: ["guardian phone", "next of kin phone"],
  emergencyContact: ["emergency contact"],
  sponsor: ["sponsor"],
  admissionDate: ["admission date", "date admitted"],
  status: ["status", "student status"],
};

function normalizeHeader(value: unknown): string {
  return String(value ?? "").trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
}

function cell(record: Record<string, unknown>, field: string): string {
  const accepted = aliases[field] ?? [];
  for (const [key, value] of Object.entries(record)) {
    if (accepted.includes(normalizeHeader(key))) return String(value ?? "").trim();
  }
  return "";
}

function normalizeStatus(value: string): StudentImportRow["status"] {
  const normalized = value.trim().toLowerCase();
  return normalized === "deferred" || normalized === "completed" || normalized === "graduated"
    ? normalized
    : "active";
}

export async function parseStudentImportFile(file: File): Promise<StudentImportRow[]> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: "array", cellDates: true });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) throw new Error("The uploaded workbook does not contain a worksheet.");

  const records = XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[firstSheetName], {
    defval: "",
    raw: false,
  });

  if (records.length === 0) throw new Error("The uploaded file does not contain any student rows.");

  return records.map((record, index) => {
    const row: StudentImportRow = {
      rowNumber: index + 2,
      fullName: cell(record, "fullName"),
      registrationNumber: cell(record, "registrationNumber"),
      studentNumber: cell(record, "studentNumber"),
      programme: cell(record, "programme"),
      academicYear: cell(record, "academicYear"),
      intake: cell(record, "intake"),
      yearOfStudy: cell(record, "yearOfStudy"),
      semester: cell(record, "semester"),
      email: cell(record, "email").toLowerCase(),
      phone: cell(record, "phone"),
      gender: cell(record, "gender"),
      dateOfBirth: cell(record, "dateOfBirth"),
      nationalId: cell(record, "nationalId"),
      guardianName: cell(record, "guardianName"),
      guardianPhone: cell(record, "guardianPhone"),
      emergencyContact: cell(record, "emergencyContact"),
      sponsor: cell(record, "sponsor"),
      admissionDate: cell(record, "admissionDate"),
      status: normalizeStatus(cell(record, "status")),
      errors: [],
    };

    if (!row.fullName) row.errors.push("Full name is required.");
    if (!row.registrationNumber) row.errors.push("Registration number is required.");
    if (!row.programme) row.errors.push("Programme is required.");
    if (!row.academicYear) row.errors.push("Academic year is required.");
    if (!row.email) row.errors.push("Email is required.");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) row.errors.push("Email format is invalid.");

    return row;
  });
}

export function downloadStudentImportTemplate(): void {
  const rows = [{
    "Full Name": "Jane Doe",
    "Registration Number": "DCM/2026/001",
    "Student Number": "STU-0001",
    Programme: "Diploma in Clinical Medicine",
    "Academic Year": "2026/2027",
    Intake: "August 2026",
    "Year of Study": "Year 1",
    Semester: "Semester 1",
    Email: "jane.doe@example.com",
    Phone: "0700000000",
    Gender: "Female",
    "Date of Birth": "2004-01-15",
    "National ID": "",
    "Guardian Name": "John Doe",
    "Guardian Phone": "0700000001",
    "Emergency Contact": "0700000001",
    Sponsor: "Self",
    "Admission Date": "2026-08-01",
    Status: "active",
  }];
  const sheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Students");
  XLSX.writeFile(workbook, "Medical-Elites-Student-Import-Template.xlsx");
}
