import PublicLayout from "../components/layout/PublicLayout";
import Card from "../components/ui/Card";
import Container from "../components/ui/Container";

const sections = [
  ["Acceptance of terms", "By accessing Medical Elites, you agree to these terms and any applicable institutional policies."],
  ["Accounts", "Users must provide accurate information, protect their credentials, and use only accounts they are authorized to access."],
  ["Acceptable use", "Users must not disrupt the service, bypass access controls, upload malicious content, misuse another person's data, or use the platform for unlawful purposes."],
  ["Academic integrity", "Users must comply with examination rules, assessment instructions, plagiarism policies, and professional standards. AI tools must not be used to misrepresent authorship or bypass academic requirements."],
  ["Clinical information", "Patient names, phone numbers, addresses, hospital numbers, photographs, or other identifying information must not be entered into clinical logbooks or AI prompts unless expressly authorized and legally permitted."],
  ["Intellectual property", "Platform software, branding, designs, and original content remain protected. Institutions and users retain rights to their own lawful uploaded content, subject to permissions needed to provide the service."],
  ["Payments and finance", "Finance records displayed in the platform are based on institutional entries. Users should report discrepancies promptly. The platform does not replace official institutional financial controls."],
  ["Service availability", "We aim to provide reliable access but do not guarantee uninterrupted service. Maintenance, network failures, third-party outages, and security events may affect availability."],
  ["Account suspension", "Accounts may be restricted or suspended for security concerns, non-compliance, abuse, or institutional instruction."],
  ["Limitation of liability", "Medical Elites provides educational and administrative tools. It does not replace professional clinical judgment, institutional governance, or legally required records."],
  ["Contact", "Questions about these terms may be sent to admin@medicalelites.org."],
];

export default function TermsPage() {
  return (
    <PublicLayout>
      <Container className="py-16">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-blue-700">Legal</p>
          <h1 className="mt-3 text-5xl font-extrabold text-slate-950">Terms &amp; Conditions</h1>
          <p className="mt-4 text-slate-600">Effective date: 2026</p>
          <Card className="mt-8 space-y-8">
            {sections.map(([title, text]) => (
              <section key={title}>
                <h2 className="text-2xl font-bold text-slate-950">{title}</h2>
                <p className="mt-3 leading-8 text-slate-600">{text}</p>
              </section>
            ))}
          </Card>
        </div>
      </Container>
    </PublicLayout>
  );
}
