import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";

import useAuth from "../hooks/useAuth";
import useNotifications from "../hooks/useNotifications";

export default function NotificationBell() {
  const { role } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const path = role === "tutor" || role === "admin"
    ? "/tutor/notifications"
    : "/notifications";

  return (
    <button
      type="button"
      onClick={() => navigate(path)}
      className="relative rounded-xl border border-slate-200 bg-white p-3 text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
      aria-label="Open notifications"
    >
      <Bell size={20} />
      {unreadCount > 0 && (
        <span className="absolute -right-2 -top-2 min-w-5 rounded-full bg-red-600 px-1.5 py-0.5 text-center text-xs font-bold text-white">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );
}
