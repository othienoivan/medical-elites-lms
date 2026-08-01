import { useState, type ReactNode } from "react";
import {
  Activity, Bell, Building2, ChevronRight, Flag, Gauge,
  KeyRound, LayoutDashboard, LifeBuoy, LogOut, Menu, Palette, ReceiptText, ShoppingBag, WalletCards,
  Road, Settings, ShieldCheck, Sparkles, Users, X,
} from "lucide-react";
import { signOut } from "firebase/auth";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { auth } from "../../config/firebase";
import HeaderActions from "../HeaderActions";

const groups = [
  { title: "Platform", items: [
    ["Overview", "/platform", LayoutDashboard],
    ["Tenants", "/platform/tenants", Building2],
    ["Independent Tutors", "/platform/tutors", Users],
    ["Licenses", "/platform/licenses", KeyRound],
  ]},
  { title: "Commercial control", items: [
    ["Plans", "/platform/plans", ReceiptText],
    ["Marketplace", "/platform/marketplace", ShoppingBag],
    ["Marketplace Intelligence", "/platform/marketplace/intelligence", Gauge],
    ["Marketplace Operations", "/platform/marketplace/operations", ShieldCheck],
    ["Finance Centre", "/platform/finance", WalletCards],
    ["Flutterwave Commerce", "/platform/finance/commerce", ReceiptText],
    ["Revenue Sharing", "/platform/finance/revenue-sharing", ReceiptText],
    ["Finance Operations", "/platform/finance/operations", Activity],
    ["Feature Flags", "/platform/feature-flags", Flag],
    ["Usage", "/platform/usage", Gauge],
  ]},
  { title: "Operations", items: [
    ["Operations Centre", "/platform/operations", Activity],
    ["Audit Centre", "/platform/audit", ShieldCheck],
    ["Support", "/platform/support", LifeBuoy],
    ["Announcements", "/platform/announcements", Bell],
    ["Roadmap", "/platform/roadmap", Road],
  ]},
  { title: "Configuration", items: [
    ["Branding", "/platform/branding", Palette],
    ["Platform Settings", "/platform/settings", Settings],
    ["System Health", "/founder/diagnostics", Activity],
    ["AI Operations", "/platform/usage", Sparkles],
  ]},
] as const;

function Sidebar({ close }: { close?: () => void }) {
  const navigate = useNavigate();
  async function logout() { await signOut(auth); navigate("/login", { replace: true }); }
  return <div className="flex h-full flex-col bg-slate-950 text-white">
    <div className="border-b border-slate-800 p-6">
      <Link to="/platform" onClick={close}><h1 className="text-xl font-black text-cyan-300">Medical Elites</h1><p className="mt-1 text-sm text-slate-400">Platform Console</p></Link>
    </div>
    <nav className="flex-1 space-y-6 overflow-y-auto p-4">{groups.map((group) => <div key={group.title}>
      <p className="mb-2 px-3 text-xs font-bold uppercase tracking-wider text-slate-500">{group.title}</p>
      <div className="space-y-1">{group.items.map(([label, path, Icon]) => <NavLink key={path} to={path} end={path === "/platform"} onClick={close}
        className={({ isActive }) => `flex min-h-11 items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${isActive ? "bg-cyan-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}>
        <Icon size={18}/><span>{label}</span></NavLink>)}</div>
    </div>)}</nav>
    <div className="border-t border-slate-800 p-4"><button onClick={() => void logout()} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-300 hover:bg-red-950/40"><LogOut size={18}/> Logout</button></div>
  </div>;
}

export default function PlatformLayout({ title, subtitle, children, actions }: { title: string; subtitle?: string; children: ReactNode; actions?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean).slice(1);
  return <div className="min-h-screen bg-slate-100">
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 lg:block"><Sidebar/></aside>
      {open && <div className="fixed inset-0 z-50 lg:hidden"><button aria-label="Close navigation" className="absolute inset-0 bg-slate-950/60" onClick={() => setOpen(false)}/><aside className="relative h-full w-[min(19rem,88vw)]"><button aria-label="Close menu" className="absolute right-3 top-3 z-10 rounded-lg p-2 text-white" onClick={() => setOpen(false)}><X/></button><Sidebar close={() => setOpen(false)}/></aside></div>}
      <main id="main-content" className="min-w-0 flex-1">
        <header className="border-b bg-white px-4 py-5 sm:px-6 lg:px-10 lg:py-8"><div className="mx-auto max-w-[1600px]">
          <div className="flex items-start justify-between gap-4"><div className="flex min-w-0 items-start gap-3"><button aria-label="Open navigation" className="mt-0.5 rounded-xl border p-2.5 lg:hidden" onClick={() => setOpen(true)}><Menu size={22}/></button><div>
            <nav className="mb-2 flex flex-wrap items-center gap-1 text-sm text-slate-500"><Link to="/platform" className="font-semibold hover:text-cyan-700">Platform</Link>{segments.map((segment) => <span key={segment} className="flex items-center gap-1"><ChevronRight size={14}/><span className="capitalize">{segment.replaceAll("-", " ")}</span></span>)}</nav>
            <h1 className="text-2xl font-black text-slate-950 sm:text-3xl">{title}</h1>{subtitle && <p className="mt-2 max-w-4xl text-sm text-slate-600 sm:text-base">{subtitle}</p>}
          </div></div><div className="flex items-center gap-3">{actions}<HeaderActions/></div></div>
        </div></header>
        <section className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-10">{children}</section>
      </main>
    </div>
  </div>;
}
