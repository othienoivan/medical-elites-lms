import { useEffect, useMemo, useState } from "react";
import { Eye, Pencil, PlusCircle, Search } from "lucide-react";
import { Link } from "react-router-dom";
import TutorLayout from "../../components/layout/TutorLayout";
import useAuth from "../../hooks/useAuth";
import { MarketplaceService, type MarketplaceProduct } from "../../domains/marketplace";

export default function TutorProductsPage() {
  const { currentUser } = useAuth();
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [term, setTerm] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    void MarketplaceService.listSellerProducts(currentUser.uid, true)
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [currentUser]);

  const filtered = useMemo(() => products.filter((p) => {
    const matchesTerm = !term || [p.title, p.type, p.categoryName].join(" ").toLowerCase().includes(term.toLowerCase());
    return matchesTerm && (!status || p.status === status);
  }), [products, status, term]);

  return (
    <TutorLayout title="My Products" subtitle="Manage everything you sell through Medical Elites.">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-1 flex-wrap gap-3">
            <label className="relative min-w-64 flex-1"><Search className="absolute left-3 top-3.5 text-slate-400" size={18}/><input value={term} onChange={(e)=>setTerm(e.target.value)} placeholder="Search products" className="w-full rounded-xl border bg-white py-3 pl-10 pr-4"/></label>
            <select value={status} onChange={(e)=>setStatus(e.target.value)} className="rounded-xl border bg-white px-4 py-3"><option value="">All statuses</option><option value="draft">Draft</option><option value="submitted">Submitted</option><option value="review">In review</option><option value="published">Published</option><option value="archived">Archived</option></select>
          </div>
          <Link to="/tutor/commerce/products/new" className="inline-flex items-center gap-2 rounded-xl bg-cyan-700 px-4 py-3 font-bold text-white"><PlusCircle size={18}/>Create product</Link>
        </div>

        <div className="overflow-hidden rounded-2xl border bg-white">
          {loading ? <p className="p-6 text-slate-600">Loading products…</p> : filtered.length === 0 ? <div className="p-10 text-center"><p className="font-bold">No products found.</p><p className="text-sm text-slate-500">Create your first product or change the filters.</p></div> : <div className="divide-y">{filtered.map((p)=><div key={p.id} className="flex flex-wrap items-center justify-between gap-4 p-5"><div><p className="font-black text-slate-900">{p.title}</p><p className="text-sm text-slate-500">{p.type.replaceAll("_", " ")} · {p.status} · {p.price.currency} {p.price.amount.toLocaleString()}</p></div><div className="flex gap-2"><Link to={`/marketplace/products/${p.id}`} className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm font-bold"><Eye size={16}/>View</Link><Link to={`/tutor/commerce/products/${p.id}/edit`} className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm font-bold"><Pencil size={16}/>Manage</Link></div></div>)}</div>}
        </div>
      </div>
    </TutorLayout>
  );
}
