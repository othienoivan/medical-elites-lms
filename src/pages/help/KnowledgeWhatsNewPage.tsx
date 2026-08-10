import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { KnowledgeArticleCard, KnowledgeService } from "../../domains/knowledge";
export default function KnowledgeWhatsNewPage(){const {role}=useAuth();const articles=KnowledgeService.listByCategory("release-notes",role);return <main className="mx-auto min-h-screen max-w-6xl px-4 py-10 sm:px-6"><Link to="/help" className="text-sm font-bold text-blue-700">← Knowledge Center</Link><h1 className="mt-4 text-3xl font-black">What’s New</h1><p className="mt-2 text-slate-600">Version-aware release notes for Medical Elites LMS.</p><section className="mt-8 grid gap-4 md:grid-cols-2">{articles.map(article=><KnowledgeArticleCard key={article.id} article={article}/>)}</section></main>}
