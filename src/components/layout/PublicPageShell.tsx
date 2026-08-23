import type { ReactNode } from "react";
import Navbar from "../home/Navbar";
import Footer from "./Footer";
export default function PublicPageShell({children}:{children:ReactNode}){return <div className="min-h-screen bg-slate-50 text-slate-900"><Navbar/><main id="main-content">{children}</main><Footer/></div>}