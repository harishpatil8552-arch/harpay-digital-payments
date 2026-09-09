import { useState, useMemo } from "react";
import { ArrowLeft, Search, Filter, BarChart3, ChevronRight, Share2, Download, RotateCcw, AlertCircle } from "lucide-react";
import TransactionCard from "../components/TransactionCard";
import { ReceiptModal } from "../components/PaymentFlow";
import { useApp } from "../context";
import { Transaction } from "../types";

type Filter = "all" | "sent" | "received" | "recharge" | "bills" | "failed" | "pending";
type DateFilter = "today" | "yesterday" | "week" | "month" | "all";

function groupByDate(txs: Transaction[]) {
  const groups: Record<string, Transaction[]> = {};
  txs.forEach((tx) => {
    const d = new Date(tx.date);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
    const key = diff === 0 ? "Today" : diff === 1 ? "Yesterday" : d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
    if (!groups[key]) groups[key] = [];
    groups[key].push(tx);
  });
  return groups;
}

export default function Transactions() {
  const { goBack, navigate, state } = useApp();
  const [filter, setFilter] = useState<Filter>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [search, setSearch] = useState("");

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "sent", label: "Sent" },
    { id: "received", label: "Received" },
    { id: "recharge", label: "Recharge" },
    { id: "bills", label: "Bills" },
    { id: "failed", label: "Failed" },
    { id: "pending", label: "Pending" },
  ];

  const filtered = useMemo(() => {
    let txs = [...state.transactions];

    if (search) {
      const q = search.toLowerCase();
      txs = txs.filter((tx) =>
        tx.recipient.toLowerCase().includes(q) ||
        tx.sender.toLowerCase().includes(q) ||
        tx.recipientUpiId.toLowerCase().includes(q) ||
        tx.id.toLowerCase().includes(q) ||
        tx.note.toLowerCase().includes(q)
      );
    }

    if (filter !== "all") {
      txs = txs.filter((tx) => {
        if (filter === "sent") return tx.type === "sent" && tx.status !== "failed";
        if (filter === "received") return tx.type === "received";
        if (filter === "recharge") return tx.type === "recharge";
        if (filter === "bills") return tx.type === "bill";
        if (filter === "failed") return tx.status === "failed";
        if (filter === "pending") return tx.status === "pending";
        return true;
      });
    }

    const now = new Date();
    if (dateFilter !== "all") {
      txs = txs.filter((tx) => {
        const d = new Date(tx.date);
        const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
        if (dateFilter === "today") return diff === 0;
        if (dateFilter === "yesterday") return diff === 1;
        if (dateFilter === "week") return diff <= 7;
        if (dateFilter === "month") return diff <= 30;
        return true;
      });
    }

    return txs;
  }, [state.transactions, filter, dateFilter, search]);

  const groups = groupByDate(filtered);

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-950 screen-enter">
      <div className="bg-white dark:bg-gray-900 pb-3">
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-3">
            <button onClick={goBack} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-90 transition-all">
              <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
            </button>
            <span className="font-semibold text-gray-800 dark:text-gray-100">Transactions</span>
          </div>
          <button onClick={() => navigate("analytics")} className="flex items-center gap-1.5 text-xs font-semibold text-[#1e3058] dark:text-green-400 active:opacity-60">
            <BarChart3 size={16} /> Analytics
          </button>
        </div>

        <div className="px-5 mb-3">
          <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <Search size={16} className="text-gray-400 shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search transactions..."
              className="flex-1 bg-transparent text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex gap-2 px-5 overflow-x-auto pb-1 scrollbar-hide">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95 ${
                filter === f.id
                  ? "bg-[#1e3058] dark:bg-green-500 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 px-5 mt-2 overflow-x-auto pb-1">
          {(["all","today","yesterday","week","month"] as DateFilter[]).map((d) => (
            <button
              key={d}
              onClick={() => setDateFilter(d)}
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all active:scale-95 ${
                dateFilter === d
                  ? "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400"
                  : "text-gray-400 dark:text-gray-500"
              }`}
            >
              {d === "all" ? "All time" : d === "today" ? "Today" : d === "yesterday" ? "Yesterday" : d === "week" ? "This week" : "This month"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {Object.keys(groups).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400 dark:text-gray-500">
            <Filter size={48} className="opacity-30" />
            <p className="text-sm">No transactions found</p>
            <button onClick={() => { setFilter("all"); setSearch(""); setDateFilter("all"); }} className="text-xs text-[#1e3058] dark:text-green-400 font-medium">Clear filters</button>
          </div>
        ) : (
          Object.entries(groups).map(([date, txs]) => (
            <div key={date}>
              <div className="px-5 py-2 sticky top-0 bg-gray-50 dark:bg-gray-950 z-10">
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500">{date}</p>
              </div>
              <div className="bg-white dark:bg-gray-900 divide-y divide-gray-50 dark:divide-gray-800">
                {txs.map((tx) => <TransactionCard key={tx.id} tx={tx} showDate={false} />)}
              </div>
            </div>
          ))
        )}
        <div className="h-6" />
      </div>
    </div>
  );
}
