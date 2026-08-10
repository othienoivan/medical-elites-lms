import { Link } from "react-router-dom";
const faqs=[
["Where are my purchased learning resources?","Open Student navigation and select My Library. Only active, fulfilled purchases are displayed."],
["Why can I no longer start a quiz?","The maximum number of attempts configured by the tutor has been reached."],
["Why is my marketplace order pending?","Payment verification or reconciliation may still be processing. Open My Purchases and retry the payment completion flow before contacting support."],
["Can tutors preview PDF or PowerPoint files in the browser?","No. PDF and PowerPoint learning resources are delivered as downloads under the current security and delivery policy."],
["How do I open my tutor storefront?","Open Tutor Commerce and select My Storefront. Only published products appear publicly."],
];
export default function KnowledgeFaqPage(){return <main className="mx-auto min-h-screen max-w-4xl px-4 py-10 sm:px-6"><Link to="/help" className="text-sm font-bold text-blue-700">← Knowledge Center</Link><h1 className="mt-4 text-3xl font-black">Frequently Asked Questions</h1><div className="mt-8 space-y-4">{faqs.map(([question,answer])=><details key={question} className="rounded-2xl border bg-white p-5 shadow-sm"><summary className="cursor-pointer font-black text-slate-950">{question}</summary><p className="mt-3 leading-7 text-slate-600">{answer}</p></details>)}</div></main>}
