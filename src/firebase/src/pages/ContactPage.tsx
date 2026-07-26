import { Building2, Mail, MessageCircle, Phone } from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

import PublicLayout from "../components/layout/PublicLayout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Container from "../components/ui/Container";
import Input from "../components/ui/Input";
import { createContactRequest } from "../firebase/contactRequests";

export default function ContactPage() {
  const location = useLocation();
  const preset = useMemo(
    () => new URLSearchParams(location.search).get("subject") || "",
    [location.search]
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState(
    preset === "partnership"
      ? "Partnership enquiry"
      : preset === "admin-access"
        ? "Administrator access request"
        : "Request a demonstration"
  );
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      alert("Please complete all contact form fields.");
      return;
    }

    try {
      setSending(true);
      await createContactRequest({ name, email, subject, message });
      setSubmitted(true);
      setName("");
      setEmail("");
      setMessage("");
      alert("Your enquiry has been sent successfully.");
    } catch (error) {
      console.error("Failed to submit contact request:", error);
      alert("Your enquiry could not be sent. Please try again or email othienoivan@gmail.com.");
    } finally {
      setSending(false);
    }
  }

  return (
    <PublicLayout>
      <Container className="py-16">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-blue-700">Contact Us</p>
            <h1 className="mt-3 text-5xl font-extrabold text-slate-950">Let’s discuss your institution’s needs</h1>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              Request a product demonstration, partnership discussion, deployment support, training, or technical assistance.
            </p>

            <div className="mt-8 space-y-4">
              <ContactItem icon={Mail} title="Email" value="othienoivan@gmail.com" />
              <ContactItem icon={Phone} title="Telephone" value="Available on request" />
              <ContactItem icon={Building2} title="Location" value="Uganda" />
              <ContactItem icon={MessageCircle} title="Support" value="Academic, technical, and institutional support" />
            </div>
          </div>

          <Card>
            <h2 className="text-2xl font-bold text-slate-950">Send an enquiry</h2>
            {submitted && (
              <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4 text-green-800">
                Thank you. Your enquiry has been received and will be reviewed.
              </div>
            )}
            <form className="mt-6 space-y-5" onSubmit={submit}>
              <Field label="Full Name"><Input value={name} onChange={(e) => setName(e.target.value)} required /></Field>
              <Field label="Email Address"><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></Field>
              <Field label="Subject"><Input value={subject} onChange={(e) => setSubject(e.target.value)} required /></Field>
              <Field label="Message">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={7}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                  placeholder="Tell us about your institution or request."
                />
              </Field>
              <Button type="submit" className="w-full" disabled={sending}>
                {sending ? "Sending..." : "Send Enquiry"}
              </Button>
            </form>
          </Card>
        </div>
      </Container>
    </PublicLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-2 block font-semibold text-slate-700">{label}</span>{children}</label>;
}

function ContactItem({ icon: Icon, title, value }: { icon: React.ElementType; title: string; value: string }) {
  return (
    <div className="flex items-start gap-4 rounded-2xl bg-white p-5 shadow-sm">
      <div className="rounded-xl bg-blue-100 p-3 text-blue-700"><Icon size={22} /></div>
      <div><p className="font-bold text-slate-950">{title}</p><p className="mt-1 text-slate-600">{value}</p></div>
    </div>
  );
}
