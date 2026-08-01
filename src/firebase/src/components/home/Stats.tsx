import { Bot, Building2, CircleDollarSign, ShoppingBag } from "lucide-react";

const strengths = [
  { icon: Building2, label: "Institution-ready", text: "Academic administration, tutor management, student workflows and institutional analytics." },
  { icon: Bot, label: "AI-enabled", text: "Assistance for lesson authoring, curriculum work, question generation and support." },
  { icon: ShoppingBag, label: "Marketplace-enabled", text: "Public catalogues, seller storefronts, carts, orders, reviews and entitlements." },
  { icon: CircleDollarSign, label: "Commerce-ready", text: "Flutterwave checkout, invoices, receipts, wallets and configurable revenue sharing." },
];

export default function Stats() {
  return (
    <section aria-label="Platform strengths" className="border-y border-slate-200 bg-white py-10">
      <div className="mx-auto grid max-w-7xl gap-5 px-6 sm:grid-cols-2 lg:grid-cols-4">
        {strengths.map(({ icon: Icon, label, text }) => (
          <div key={label} className="flex gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700"><Icon size={22} /></span>
            <div><p className="font-bold text-slate-900">{label}</p><p className="mt-1 text-sm leading-6 text-slate-600">{text}</p></div>
          </div>
        ))}
      </div>
    </section>
  );
}
