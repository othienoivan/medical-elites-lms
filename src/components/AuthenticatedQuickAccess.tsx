import { Bell, MessageCircle } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import useAuth from "../hooks/useAuth";
import useNotifications from "../hooks/useNotifications";

const PUBLIC_PATHS = new Set([
  "/",
  "/login",
  "/register",
  "/about",
  "/privacy",
  "/terms",
  "/testimonials",
  "/contact",
]);

export default function AuthenticatedQuickAccess() {
  const { currentUser, role } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  if (!currentUser || role !== "student" || PUBLIC_PATHS.has(location.pathname)) {
    return null;
  }

  return (
    <div className="fixed right-4 top-4 z-40 flex items-center gap-2 print:hidden sm:right-6 sm:top-5">
      <button
        type="button"
        onClick={() => navigate("/messages")}
        className="rounded-xl border border-slate-200 bg-white p-3 text-slate-700 shadow-md transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
        aria-label="Open messages"
        title="Messages"
      >
        <MessageCircle size={20} />
      </button>

      <button
        type="button"
        onClick={() => navigate("/notifications")}
        className="relative rounded-xl border border-slate-200 bg-white p-3 text-slate-700 shadow-md transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
        aria-label="Open notifications"
        title="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -right-2 -top-2 min-w-5 rounded-full bg-red-600 px-1.5 py-0.5 text-center text-xs font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}
