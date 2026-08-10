import { collection, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import { ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import TutorLayout from "../../components/layout/TutorLayout";
import { db } from "../../config/firebase";
import useAuth from "../../hooks/useAuth";
import type { MarketplaceOrder } from "../../domains/marketplace";

function money(amount: number, currency: string) {
  return new Intl.NumberFormat("en-UG", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}

export default function TutorSalesPage() {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState<MarketplaceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!currentUser) return;
    void getDocs(query(collection(db, "commerceOrders"), where("tutorId", "==", currentUser.uid), orderBy("createdAt", "desc"), limit(100)))
      .then((snapshot) => setOrders(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as MarketplaceOrder)))
      .finally(() => setLoading(false));
  }, [currentUser]);
  return <TutorLayout title="Sales & Orders" subtitle="Verified purchases of your marketplace products.">
    <div className="space-y-4">
      {loading ? <p className="rounded-2xl border bg-white p-8 text-center">Loading sales…</p> : orders.length === 0 ?
        <div className="rounded-2xl border bg-white p-10 text-center"><ShoppingBag className="mx-auto text-cyan-700"/><h2 className="mt-3 text-xl font-black">No sales yet</h2><p className="text-slate-600">Paid product orders will appear here.</p></div> :
        orders.map((order) => <article key={order.id} className="rounded-2xl border bg-white p-5"><div className="flex flex-wrap justify-between gap-4"><div><h2 className="font-black">{order.title}</h2><p className="text-sm text-slate-600">{order.customerName || order.customerEmail || order.customerUid}</p><p className="mt-1 text-xs text-slate-500">{order.transactionReference}</p></div><div className="text-right"><p className="font-black">{money(order.amount.amount, order.amount.currency)}</p><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase">{order.status}</span></div></div></article>)}
    </div>
  </TutorLayout>;
}
