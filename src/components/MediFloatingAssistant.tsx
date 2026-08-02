import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
export default function MediFloatingAssistant(){return <Link to="/ai-assistant" aria-label="Open Medi AI assistant" title="Ask Medi AI" className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-blue-700 text-white shadow-2xl transition hover:scale-105 hover:bg-blue-800"><Sparkles size={25}/></Link>}
