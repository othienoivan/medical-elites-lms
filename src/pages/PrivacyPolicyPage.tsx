import PublicLayout from "../components/layout/PublicLayout";
import Card from "../components/ui/Card";
import Container from "../components/ui/Container";

const sections = [
  ["Information we collect", "We may collect account details, student and tutor profiles, enrolment information, learning activity, assessment records, attendance, finance records, clinical logbook entries, messages, notifications, uploaded files, and technical usage data."],
  ["How information is used", "Information is used to provide and secure the platform, manage academic services, support learning and assessment, generate reports, improve performance, communicate with users, and meet institutional obligations."],
  ["AI features", "Prompts submitted to AI features may be processed by configured AI service providers. Users must not submit patient-identifying information, confidential institutional material, or other sensitive data that is not required for the educational task."],
  ["Data sharing", "We do not sell personal data. Information may be shared with the relevant institution, authorized service providers, or public authorities where legally required."],
  ["Data security", "We use authentication, access controls, encrypted connections, role-based permissions, and platform monitoring. No system can guarantee absolute security, so users must protect their passwords and report suspected misuse."],
  ["Data retention", "Records are retained for as long as required to provide services, meet academic and legal obligations, resolve disputes, and support institutional recordkeeping."],
  ["Your rights", "Depending on applicable law and institutional policy, users may request access, correction, restriction, or deletion of eligible personal information."],
  ["Contact", "Privacy questions may be sent to othienoivan@gmail.com."],
];

export default function PrivacyPolicyPage() {
  return (
    <PublicLayout>
      <Container className="py-16">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-blue-700">Legal</p>
          <h1 className="mt-3 text-5xl font-extrabold text-slate-950">Privacy Policy</h1>
          <p className="mt-4 text-slate-600">Effective date: 2026</p>
          <Card className="mt-8 space-y-8">
            <p className="leading-8 text-slate-600">
              This policy explains how Medical Elites collects, uses, protects, and manages personal information when users access the platform.
            </p>
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
