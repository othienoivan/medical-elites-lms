import { ArrowRight, Clock3 } from "lucide-react";
import { Link } from "react-router-dom";
import type { KnowledgeArticle } from "../domain/models";

export default function KnowledgeArticleCard({ article }: { article: KnowledgeArticle }) {
  return <Link to={`/help/articles/${article.slug}`} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-wide text-blue-700">{article.category.replaceAll("-", " ")}</p><h3 className="mt-2 text-lg font-black text-slate-950 group-hover:text-blue-800">{article.title}</h3></div><ArrowRight className="mt-1 shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-700" size={20} /></div><p className="mt-3 text-sm leading-6 text-slate-600">{article.summary}</p>{article.estimatedMinutes && <p className="mt-4 flex items-center gap-1.5 text-xs font-bold text-slate-500"><Clock3 size={14} /> {article.estimatedMinutes} min read</p>}</Link>;
}
