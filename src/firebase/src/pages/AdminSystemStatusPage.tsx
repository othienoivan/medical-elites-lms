import { Activity, Database, HardDrive, Sparkles, Wifi } from "lucide-react";
import AdminLayout from "../components/layout/AdminLayout";
import SystemHealthWidget from "../components/dashboard/SystemHealthWidget";
import DashboardWidget from "../components/dashboard/DashboardWidget";

export default function AdminSystemStatusPage() {
  const services = [
    { label: "Network", value: navigator.onLine ? "Online" : "Offline", icon: Wifi },
    { label: "Firestore", value: "Connected", icon: Database },
    { label: "Storage", value: "Configured", icon: HardDrive },
    { label: "Medi", value: "Available", icon: Sparkles },
  ];
  return <AdminLayout title="System Status" subtitle="Institution-focused operational status and support information."><div className="grid gap-6 lg:grid-cols-2"><DashboardWidget title="Service Health" description="Current platform services"><SystemHealthWidget /></DashboardWidget><DashboardWidget title="Environment" description="Current browser-session indicators"><div className="grid gap-3 sm:grid-cols-2">{services.map(({ label, value, icon: Icon }) => <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><Icon className="text-violet-700" size={20}/><p className="mt-3 text-sm font-semibold text-slate-500">{label}</p><p className="mt-1 font-bold text-slate-950">{value}</p></div>)}</div><a href="/founder/diagnostics" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-violet-700 hover:underline"><Activity size={17}/> Open advanced diagnostics</a></DashboardWidget></div></AdminLayout>;
}
