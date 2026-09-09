import { ArrowUpRight, ArrowDownLeft, Smartphone, Zap, Droplets, Tv, Flame, Wifi, Car, Shield, CreditCard, Building2 } from "lucide-react";
import { Transaction } from "../types";
import { useApp } from "../context";

function categoryIcon(category: string, type: string) {
  if (type === "recharge" || category === "mobile") return <Smartphone size={18} />;
  if (category === "electricity") return <Zap size={18} />;
  if (category === "water") return <Droplets size={18} />;
  if (category === "dth") return <Tv size={18} />;
  if (category === "gas") return <Flame size={18} />;
  if (category === "broadband") return <Wifi size={18} />;
  if (category === "fastag") return <Car size={18} />;
  if (category === "insurance") return <Shield size={18} />;
  if (category === "credit_card") return <CreditCard size={18} />;
  if (category === "bank") return <Building2 size={18} />;
  if (type === "received") return <ArrowDownLeft size={18} />;
  return <ArrowUpRight size={18} />;
}

function categoryBg(category: string, type: string) {
  if (type === "received") return "bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400";
  if (category === "electricity") return "bg-yellow-50 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-400";
  if (category === "water") return "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400";
  if (category === "dth") return "bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400";
  if (category === "gas") return "bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-400";
  if (category === "broadband") return "bg-cyan-50 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-400";
  if (category === "fastag") return "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400";
  if (category === "insurance") return "bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400";
  if (category === "credit_card") return "bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400";
  return "bg-[#1e3058]/8 text-[#1e3058] dark:bg-slate-800 dark:text-slate-300";
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function formatDay(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

interface TransactionCardProps {
  tx: Transaction;
  showDate?: boolean;
  compact?: boolean;
}

export default function TransactionCard({ tx, showDate = true, compact = false }: TransactionCardProps) {
  const { dispatch, navigate } = useApp();
  const isReceived = tx.type === "received";

  function handleClick() {
    dispatch({ type: "SELECT_TRANSACTION", tx });
    navigate("transaction-detail");
  }

  return (
    <button
      onClick={handleClick}
      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 active:bg-gray-100 dark:active:bg-gray-800 transition-colors"
    >
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${categoryBg(tx.category, tx.type)}`}>
        {categoryIcon(tx.category, tx.type)}
      </div>
      <div className="flex-1 text-left min-w-0">
        <p className={`font-semibold text-gray-800 dark:text-gray-100 truncate ${compact ? "text-sm" : "text-sm"}`}>
          {isReceived ? tx.sender : tx.recipient}
        </p>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {tx.status === "failed" ? "Failed" : tx.status === "pending" ? "Pending" : isReceived ? "Received" : tx.type === "recharge" ? "Recharge" : tx.type === "bill" ? "Bill paid" : "Sent"}
          </span>
          {showDate && <span className="text-xs text-gray-300 dark:text-gray-600">•</span>}
          {showDate && <span className="text-xs text-gray-400 dark:text-gray-500">{formatDay(tx.date)} • {formatTime(tx.date)}</span>}
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className={`font-bold text-sm ${isReceived ? "text-green-600 dark:text-green-400" : tx.status === "failed" ? "text-red-500" : tx.status === "pending" ? "text-amber-500" : "text-gray-800 dark:text-gray-100"}`}>
          {isReceived ? "+" : "-"}₹{tx.amount.toLocaleString("en-IN")}
        </p>
        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
          tx.status === "successful" ? "text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-400" :
          tx.status === "failed" ? "text-red-500 bg-red-50 dark:bg-red-950" :
          "text-amber-600 bg-amber-50 dark:bg-amber-950"
        }`}>
          {tx.status}
        </span>
      </div>
    </button>
  );
}
