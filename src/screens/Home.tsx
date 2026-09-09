import { useState } from "react";
import {
  Eye, EyeOff, Bell, Plus, Send, QrCode, Smartphone, Zap, Droplets, Tv,
  Flame, Wifi, Car, Shield, CreditCard, Building2, ChevronRight, ArrowUpRight, ArrowDownLeft, BarChart3, Search
} from "lucide-react";
import Logo from "../components/Logo";
import TransactionCard from "../components/TransactionCard";
import { useApp } from "../context";
import { Screen } from "../types";

interface QuickAction { id: Screen | "scan"; icon: React.ReactNode; label: string; color: string; }

const QUICK_ACTIONS: QuickAction[] = [
  { id: "scan", icon: <QrCode size={22} />, label: "Scan & Pay", color: "bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400" },
  { id: "send-money", icon: <Send size={22} />, label: "Send Money", color: "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400" },
  { id: "request-money", icon: <Plus size={22} />, label: "Request", color: "bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400" },
  { id: "recharge", icon: <Smartphone size={22} />, label: "Recharge", color: "bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400" },
  { id: "electricity", icon: <Zap size={22} />, label: "Electricity", color: "bg-yellow-100 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-400" },
  { id: "water", icon: <Droplets size={22} />, label: "Water", color: "bg-cyan-100 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-400" },
  { id: "dth", icon: <Tv size={22} />, label: "DTH", color: "bg-pink-100 text-pink-600 dark:bg-pink-950 dark:text-pink-400" },
  { id: "fastag", icon: <Car size={22} />, label: "FASTag", color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400" },
  { id: "insurance", icon: <Shield size={22} />, label: "Insurance", color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400" },
  { id: "credit-card", icon: <CreditCard size={22} />, label: "Credit Card", color: "bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400" },
  { id: "gas", icon: <Flame size={22} />, label: "Gas", color: "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400" },
  { id: "broadband", icon: <Wifi size={22} />, label: "Broadband", color: "bg-teal-100 text-teal-600 dark:bg-teal-950 dark:text-teal-400" },
];

export default function Home() {
  const { state, dispatch, navigate } = useApp();
  const [balanceHidden, setBalanceHidden] = useState(state.settings.hideBalance);
  const [showAll, setShowAll] = useState(false);

  const today = new Date().toDateString();
  const todayTxs = state.transactions.filter((tx) => new Date(tx.date).toDateString() === today);
  const todaySent = todayTxs.filter((tx) => (tx.type === "sent" || tx.type === "bill" || tx.type === "recharge") && tx.status === "successful").reduce((s, t) => s + t.amount, 0);
  const todayReceived = todayTxs.filter((tx) => tx.type === "received" && tx.status === "successful").reduce((s, t) => s + t.amount, 0);
  const todayTotal = todaySent + todayReceived;
  const todaySuccessful = todayTxs.filter((tx) => tx.status === "successful").length;
  const todayFailed = todayTxs.filter((tx) => tx.status === "failed").length;
  const unread = state.notifications.filter((n) => !n.read).length;

  const visibleActions = showAll ? QUICK_ACTIONS : QUICK_ACTIONS.slice(0, 8);
  const recentTxs = state.transactions.slice(0, 5);

  function handleAction(id: Screen | "scan") {
    if (id === "scan") {
      navigate("scan");
    } else {
      navigate(id as Screen);
    }
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-950">
      <div className="bg-gradient-to-br from-[#1e3058] via-[#243868] to-[#1a2d4e] rounded-b-3xl pb-6 shadow-xl shadow-[#1e3058]/20">
        <div className="flex items-center justify-between px-5 pt-5 pb-4">
          <Logo size={34} light />
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("notifications")}
              className="relative w-9 h-9 rounded-full bg-white/10 flex items-center justify-center active:scale-90 transition-transform"
            >
              <Bell size={18} className="text-white" />
              {unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </button>
            <button
              onClick={() => navigate("profile")}
              className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center font-bold text-white text-sm active:scale-90 transition-transform"
            >
              HP
            </button>
          </div>
        </div>

        <div className="px-5">
          <p className="text-white/70 text-sm mb-0.5">Hi, Harish 👋</p>
          <p className="text-white/90 text-xs mb-4">Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}</p>

          <div className="bg-white/10 backdrop-blur rounded-2xl p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-white/70 text-xs font-medium">Harpay Balance</span>
              <button
                onClick={() => setBalanceHidden((v) => !v)}
                className="text-white/60 active:scale-90 transition-transform"
              >
                {balanceHidden ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-3xl font-bold text-white mb-4">
              {balanceHidden ? "₹ ••••••" : `₹${state.balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => navigate("send-money")}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-green-500 text-white text-xs font-semibold active:scale-95 transition-all shadow-md"
              >
                <Send size={14} /> Send
              </button>
              <button
                onClick={() => navigate("request-money")}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/15 text-white text-xs font-semibold active:scale-95 transition-all"
              >
                <Plus size={14} /> Request
              </button>
              <button
                onClick={() => navigate("scan")}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/15 text-white text-xs font-semibold active:scale-95 transition-all"
              >
                <QrCode size={14} /> Scan
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-gray-800 dark:text-gray-100">Quick Actions</span>
            <button onClick={() => setShowAll((v) => !v)} className="text-xs font-semibold text-[#1e3058] dark:text-green-400 active:opacity-60">
              {showAll ? "Show less" : "View all"}
            </button>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {visibleActions.map((action) => (
              <button
                key={action.id}
                onClick={() => handleAction(action.id)}
                className="flex flex-col items-center gap-2 active:scale-90 transition-transform"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${action.color}`}>
                  {action.icon}
                </div>
                <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400 text-center leading-tight">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => navigate("analytics")}
          className="mx-5 mb-4 w-[calc(100%-40px)] bg-gradient-to-br from-[#1e3058] to-[#2d4a7a] rounded-2xl p-4 text-white text-left shadow-lg shadow-[#1e3058]/15 active:scale-95 transition-transform"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-white/70 text-xs">{"Today's Transactions"}</p>
              <p className="text-xl font-bold">{todayTxs.length} Transactions</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
              <BarChart3 size={20} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white/10 rounded-xl p-2.5">
              <p className="text-white/60">Total</p>
              <p className="font-bold">₹{todayTotal.toLocaleString("en-IN")}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-2.5">
              <p className="text-white/60">Sent</p>
              <p className="font-bold text-red-300">₹{todaySent.toLocaleString("en-IN")}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-2.5">
              <p className="text-white/60">Received</p>
              <p className="font-bold text-green-300">₹{todayReceived.toLocaleString("en-IN")}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-2.5">
              <p className="text-white/60">Success / Failed</p>
              <p className="font-bold">{todaySuccessful} / {todayFailed}</p>
            </div>
          </div>
        </button>

        <div className="px-5 pb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-gray-800 dark:text-gray-100">Recent Transactions</span>
            <button onClick={() => navigate("transactions")} className="flex items-center gap-1 text-xs font-semibold text-[#1e3058] dark:text-green-400 active:opacity-60">
              View all <ChevronRight size={14} />
            </button>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm divide-y divide-gray-50 dark:divide-gray-800">
            {recentTxs.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-400 dark:text-gray-500 text-sm">No transactions yet</p>
              </div>
            ) : (
              recentTxs.map((tx) => <TransactionCard key={tx.id} tx={tx} />)
            )}
          </div>
        </div>

        <div className="h-4" />
      </div>
    </div>
  );
}
