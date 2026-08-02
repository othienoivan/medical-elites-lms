import { Inbox } from "lucide-react";
export default function EmptyPlatformState({ message }: { message: string }) { return <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center"><Inbox className="mx-auto text-slate-400"/><p className="mt-3 font-semibold text-slate-600">{message}</p></div>; }
