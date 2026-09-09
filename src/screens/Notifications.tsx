import { ArrowLeft, Bell, CheckCircle2, XCircle, Clock, DollarSign, CheckCheck } from "lucide-react";
import { useApp } from "../context";

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

export default function Notifications() {
  const { goBack, state, dispatch } = useApp();
  const { notifications } = state;
  const unread = notifications.filter((n) => !n.read).length;

  function markAll() {
    dispatch({ type: "MARK_ALL_READ" });
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-950 screen-enter">
      <div className="flex items-center justify-between px-5 pt-5 pb-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <button onClick={goBack} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-90 transition-all">
            <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
          <span className="font-semibold text-gray-800 dark:text-gray-100">Notifications</span>
          {unread > 0 && <span className="text-xs font-bold px-2 py-0.5 bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400 rounded-full">{unread}</span>}
        </div>
        {unread > 0 && (
          <button onClick={markAll} className="flex items-center gap-1.5 text-xs font-semibold text-[#1e3058] dark:text-green-400 active:opacity-60">
            <CheckCheck size={15} /> Mark all read
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400 dark:text-gray-500">
            <Bell size={48} className="opacity-30" />
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => dispatch({ type: "MARK_NOTIFICATION_READ", id: n.id })}
                className={`w-full flex items-start gap-4 px-5 py-4 text-left transition-colors ${
                  n.read ? "bg-white dark:bg-gray-900" : "bg-blue-50/50 dark:bg-blue-950/10"
                } hover:bg-gray-50 dark:hover:bg-gray-800/50 active:bg-gray-100 dark:active:bg-gray-800`}
              >
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                  n.type === "success" ? "bg-green-100 dark:bg-green-950" :
                  n.type === "received" ? "bg-blue-100 dark:bg-blue-950" :
                  n.type === "failed" ? "bg-red-100 dark:bg-red-950" :
                  "bg-purple-100 dark:bg-purple-950"
                }`}>
                  {n.type === "success" && <CheckCircle2 size={20} className="text-green-500" />}
                  {n.type === "received" && <DollarSign size={20} className="text-blue-500" />}
                  {n.type === "failed" && <XCircle size={20} className="text-red-500" />}
                  {n.type === "request" && <Bell size={20} className="text-purple-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className={`text-sm font-semibold ${n.read ? "text-gray-700 dark:text-gray-300" : "text-gray-900 dark:text-white"}`}>{n.title}</p>
                    {!n.read && <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 ml-2" />}
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">{n.message}</p>
                  <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">{formatTime(n.date)}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
