import { MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

import useAuth from "../hooks/useAuth";
import NotificationBell from "./NotificationBell";

export default function HeaderActions() {
  const { role } = useAuth();
  const navigate = useNavigate();
  const messagesPath = role === "student" ? "/messages" : "/tutor/messages";

  return (
    <div className="flex shrink-0 items-center gap-2">
      <button
        type="button"
        onClick={() => navigate(messagesPath)}
        className="rounded-xl border border-slate-200 bg-white p-3 text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
        aria-label="Open messages"
        title="Messages"
      >
        <MessageCircle size={20} />
      </button>
      <NotificationBell />
    </div>
  );
}
