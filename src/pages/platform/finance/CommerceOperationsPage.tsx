import { useEffect, useState } from "react";
import { RefreshCw, RotateCcw, SearchCheck } from "lucide-react";
import PlatformLayout from "../../../components/platform/PlatformLayout";
import { listCommerceOrders, listCommercePayments, listCommerceRefunds, reconcileCommercePayment, requestCommerceRefund, type CommerceOrder, type CommercePayment, type CommerceRefund } from "../../../domains/finance/infrastructure/commerceRepository";

const money=(value?:{amount:number;currency:string})=>value?`${value.currency} ${value.amount.toLocaleString()}`:"—";
export default function CommerceOperationsPage(){
 const [orders,setOrders]=useState<CommerceOrder[]>([]); const [payments,setPayments]=useState<CommercePayment[]>([]); const [refunds,setRefunds]=useState<CommerceRefund[]>([]); const [busy,setBusy]=useState(false); const [message,setMessage]=useState("");
 async function load(){setBusy(true);setMessage("");try{const [a,b,c]=await Promise.all([listCommerceOrders(),listCommercePayments(),listCommerceRefunds()]);setOrders(a);setPayments(b);setRefunds(c);}catch(e){setMessage(e instanceof Error?e.message:"Unable to load commerce records.");}finally{setBusy(false);}}
 useEffect(()=>{void load();},[]);
 async function reconcile(){const ref=window.prompt("Medical Elites transaction reference");if(!ref)return;const id=window.prompt("Flutterwave transaction ID");if(!id)return;setBusy(true);try{await reconcileCommercePayment({transactionReference:ref,transactionId:id});setMessage("Payment reconciled successfully.");await load();}catch(e){setMessage(e instanceof Error?e.message:"Reconciliation failed.");}finally{setBusy(false);}}
 async function refund(){const ref=window.prompt("Transaction reference to refund");if(!ref)return;const amount=Number(window.prompt("Refund amount (whole currency units)"));if(!Number.isSafeInteger(amount)||amount<=0)return;setBusy(true);try{await requestCommerceRefund({transactionReference:ref,amount,comments:"Approved from Finance Operations Centre",idempotencyKey:crypto.randomUUID()});setMessage("Refund request submitted to Flutterwave.");await load();}catch(e){setMessage(e instanceof Error?e.message:"Refund failed.");}finally{setBusy(false);}}
 return <PlatformLayout title="Flutterwave Commerce" subtitle="Checkout, verification, reconciliation, receipts and refund operations." actions={<button onClick={()=>void load()} className="rounded-xl border bg-white p-2.5" aria-label="Refresh"><RefreshCw size={18}/></button>}>
  {message&&<div className="mb-5 rounded-xl border bg-white p-4 text-sm text-slate-700">{message}</div>}
  <div className="mb-6 flex flex-wrap gap-3"><button disabled={busy} onClick={()=>void reconcile()} className="inline-flex items-center gap-2 rounded-xl bg-cyan-700 px-4 py-3 font-bold text-white disabled:opacity-50"><SearchCheck size={18}/> Reconcile payment</button><button disabled={busy} onClick={()=>void refund()} className="inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-3 font-bold text-slate-800 disabled:opacity-50"><RotateCcw size={18}/> Initiate refund</button></div>
  <div className="grid gap-6 xl:grid-cols-3">
   <Panel title={`Orders (${orders.length})`} rows={orders.map(x=>({id:x.id,title:x.title,meta:`${money(x.amount)} · ${x.status}`}))}/><Panel title={`Payments (${payments.length})`} rows={payments.map(x=>({id:x.id,title:x.provider,meta:`${money(x.amount)} · ${x.status}`}))}/><Panel title={`Refunds (${refunds.length})`} rows={refunds.map(x=>({id:x.id,title:x.orderId,meta:`${money(x.amount)} · ${x.status}`}))}/>
  </div>
 </PlatformLayout>;
}
function Panel({title,rows}:{title:string;rows:{id:string;title:string;meta:string}[]}){return <section className="rounded-2xl border bg-white p-5 shadow-sm"><h2 className="text-lg font-black text-slate-950">{title}</h2><div className="mt-4 space-y-3">{rows.length?rows.slice(0,50).map(row=><div key={row.id} className="rounded-xl border p-3"><p className="truncate font-bold text-slate-900">{row.title}</p><p className="mt-1 text-xs text-slate-500">{row.meta}</p><p className="mt-1 truncate text-xs text-slate-400">{row.id}</p></div>):<p className="text-sm text-slate-500">No records found.</p>}</div></section>;}
