import { ArrowLeft, Search, Send, HandCoins } from "lucide-react";
import { useApp } from "../context";
import { CONTACTS } from "../data";

export default function People() {
  const { goBack, navigate, dispatch } = useApp();

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-950 screen-enter">
      <div className="flex items-center gap-3 px-5 pt-5 pb-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <button onClick={goBack} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-90 transition-all">
          <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
        </button>
        <span className="font-semibold text-gray-800 dark:text-gray-100">People</span>
      </div>

      <div className="px-5 pt-4 pb-2 bg-white dark:bg-gray-900">
        <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <Search size={16} className="text-gray-400 shrink-0" />
          <input placeholder="Search people or UPI ID..." className="flex-1 bg-transparent text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pt-4 px-5">
        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-3">CONTACTS</p>
        <div className="space-y-3">
          {CONTACTS.map((c) => (
            <div key={c.id} className="bg-white dark:bg-gray-900 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0" style={{ background: c.color }}>
                {c.initials}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800 dark:text-gray-100">{c.name}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">{c.upiId}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate("send-money")}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1e3058] dark:bg-green-500 text-white text-xs font-semibold active:scale-90 transition-all"
                >
                  <Send size={13} /> Pay
                </button>
                <button
                  onClick={() => navigate("request-money")}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-xs font-semibold active:scale-90 transition-all"
                >
                  Request
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
