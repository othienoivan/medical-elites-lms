import { Bell, BookOpen, Home, LayoutDashboard, UserRound } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const PUBLIC_PREFIXES = ["/about", "/courses", "/marketplace", "/testimonials", "/contact", "/privacy", "/terms", "/login", "/register", "/join"];
const LAYOUT_PREFIXES = ["/tutor", "/admin", "/platform", "/founder"];

export default function GlobalWorkspaceNavigation() {
  const { currentUser, role } = useAuth();
  const { pathname } = useLocation();
  if (!currentUser || pathname === "/" || PUBLIC_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)) || LAYOUT_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) return null;

  const dashboard = role === "admin" ? "/admin" : role === "tutor" ? "/tutor" : "/dashboard";
  const profilePath = role === "admin" ? "/admin/settings" : role === "tutor" ? "/tutor/profile" : "/profile";
  return (
    <nav aria-label="Workspace navigation" className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex min-h-14 max-w-[1600px] items-center gap-1 overflow-x-auto px-3 sm:px-6">
        <Link to={dashboard} className="flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100"><LayoutDashboard size={17}/>Dashboard</Link>
        <Link to="/my-courses" className="flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"><BookOpen size={17}/>My Courses</Link>
        <Link to="/notifications" className="flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"><Bell size={17}/>Notifications</Link>
        <Link to={profilePath} className="flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"><UserRound size={17}/>Profile</Link>
        <Link to="/" className="ml-auto flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"><Home size={17}/>Home</Link>
      </div>
    </nav>
  );
}
