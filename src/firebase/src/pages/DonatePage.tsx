import { useMemo, useState } from "react";
import { CreditCard, HeartHandshake, Loader2, ShieldCheck, Smartphone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import StudentLayout from "../components/layout/StudentLayout";
import TutorLayout from "../components/layout/TutorLayout";
import AdminLayout from "../components/layout/AdminLayout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import useAuth from "../hooks/useAuth";
import { createDonationCheckout, type DonationFrequency, type DonationMethod } from "../firebase/donations";

const PRESETS = [10000, 25000, 50000, 100000];

export default function DonatePage() {
  const { currentUser, userProfile, role } = useAuth();
  const navigate = useNavigate();
  const [frequency, setFrequency] = useState<DonationFrequency>("one_time");
  const [method, setMethod] = useState<DonationMethod>("mobile_money");
  const [amount, setAmount] = useState(25000);
  const [customAmount, setCustomAmount] = useState("");
  const [fullName, setFullName] = useState(userProfile?.fullName || "");
  const [email, setEmail] = useState(currentUser?.email || userProfile?.email || "");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [purpose, setPurpose] = useState("Support Medical Elites learning access");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const finalAmount = useMemo(() => customAmount ? Number(customAmount) : amount, [customAmount, amount]);

  function chooseFrequency(value: DonationFrequency) {
    setFrequency(value);
    if (value === "monthly") setMethod("card");
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (!Number.isFinite(finalAmount) || finalAmount < 1000) return setError("Enter a donation of at least UGX 1,000.");
    if (!fullName.trim() || !email.trim()) return setError("Your name and email are required for payment confirmation.");
    if (method === "mobile_money" && !phoneNumber.trim()) return setError("Enter the Mobile Money telephone number.");
    try {
      setSubmitting(true);
      const result = await createDonationCheckout({
        amount: finalAmount,
        currency: "UGX",
        frequency,
        method,
        fullName: fullName.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim() || undefined,
        anonymous,
        purpose: purpose.trim() || undefined,
        returnUrl: `${window.location.origin}/dashboard?payment=complete`,
      });
      window.location.assign(result.checkoutUrl);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to start the donation checkout.");
    } finally { setSubmitting(false); }
  }

  const content = <main className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-10">
    <button type="button" onClick={() => navigate(-1)} className="mb-4 text-sm font-semibold text-blue-700 hover:underline">← Back</button>
    <section className="rounded-3xl bg-gradient-to-br from-rose-600 to-orange-500 p-8 text-white shadow-xl">
      <HeartHandshake size={46}/><h1 className="mt-4 text-3xl font-bold">Support Medical Elites</h1>
      <p className="mt-3 max-w-2xl text-rose-50">Your contribution supports learning resources, platform improvement and access to quality medical education.</p>
    </section>
    <Card className="mt-6"><form onSubmit={submit} className="space-y-7">
      <fieldset><legend className="text-lg font-bold text-slate-950">Donation frequency</legend><div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Choice active={frequency === "one_time"} title="One-time donation" description="Make a single contribution" onClick={() => chooseFrequency("one_time")}/>
        <Choice active={frequency === "monthly"} title="Monthly donation" description="Recurring card contribution" onClick={() => chooseFrequency("monthly")}/>
      </div></fieldset>
      <fieldset><legend className="text-lg font-bold text-slate-950">Amount</legend><div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {PRESETS.map(value => <button key={value} type="button" onClick={() => { setAmount(value); setCustomAmount(""); }} className={`rounded-xl border p-3 font-bold ${!customAmount && amount === value ? "border-blue-700 bg-blue-50 text-blue-800" : "border-slate-300"}`}>UGX {value.toLocaleString()}</button>)}
      </div><label className="mt-4 block font-semibold">Custom amount<Input type="number" min={1000} step={1000} value={customAmount} onChange={event => setCustomAmount(event.target.value)} placeholder="Enter amount in UGX"/></label></fieldset>
      <fieldset><legend className="text-lg font-bold text-slate-950">Payment method</legend><div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Choice icon={Smartphone} active={method === "mobile_money"} disabled={frequency === "monthly"} title="Mobile Money" description={frequency === "monthly" ? "Monthly automatic Mobile Money is unavailable" : "MTN or Airtel Money"} onClick={() => setMethod("mobile_money")}/>
        <Choice icon={CreditCard} active={method === "card"} title="Credit or debit card" description="Visa, Mastercard and supported cards" onClick={() => setMethod("card")}/>
      </div></fieldset>
      <div className="grid gap-4 md:grid-cols-2"><label className="font-semibold">Full name<Input value={fullName} onChange={event => setFullName(event.target.value)} required/></label><label className="font-semibold">Email<Input type="email" value={email} onChange={event => setEmail(event.target.value)} required/></label></div>
      {method === "mobile_money" && <label className="block font-semibold">Mobile Money number<Input type="tel" value={phoneNumber} onChange={event => setPhoneNumber(event.target.value)} placeholder="e.g. 0772 000 000" required/></label>}
      <label className="block font-semibold">Donation purpose<Input value={purpose} onChange={event => setPurpose(event.target.value)}/></label>
      <label className="flex items-center gap-3"><input type="checkbox" checked={anonymous} onChange={event => setAnonymous(event.target.checked)}/><span>Show this donation as anonymous</span></label>
      {error && <p className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>}
      <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900"><p className="flex items-center gap-2 font-semibold"><ShieldCheck size={18}/> Secure Flutterwave checkout</p><p className="mt-1">Payment is confirmed by the backend before a donation is marked successful.</p></div>
      <Button type="submit" disabled={submitting} className="w-full justify-center py-4 text-base">{submitting ? <><Loader2 className="animate-spin" size={18}/>Opening checkout...</> : `Donate UGX ${finalAmount.toLocaleString()}`}</Button>
    </form></Card>
  </main>;

  if (role === "admin") return <AdminLayout title="Donate" subtitle="Support the Medical Elites mission.">{content}</AdminLayout>;
  if (role === "tutor") return <TutorLayout title="Donate" subtitle="Support the Medical Elites mission.">{content}</TutorLayout>;
  return <StudentLayout>{content}</StudentLayout>;
}

function Choice({ title, description, active, onClick, icon: Icon, disabled = false }: { title: string; description: string; active: boolean; onClick: () => void; icon?: React.ElementType; disabled?: boolean }) {
  return <button type="button" disabled={disabled} onClick={onClick} className={`rounded-xl border p-4 text-left transition ${active ? "border-blue-700 bg-blue-50" : "border-slate-300 hover:border-blue-400"} disabled:cursor-not-allowed disabled:opacity-50`}>
    <span className="flex items-center gap-2 font-bold text-slate-950">{Icon && <Icon size={19}/>} {title}</span><span className="mt-1 block text-sm text-slate-600">{description}</span>
  </button>;
}
