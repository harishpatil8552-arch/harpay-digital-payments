import { useState, useMemo } from "react";
import { ArrowLeft, TrendingUp, TrendingDown, BarChart2 } from "lucide-react";
import { useApp } from "../context";
import { Transaction } from "../types";

type Range = "1h" | "3h" | "today" | "7d" | "30d" | "custom";

function parseHourMin(str: string): number {
  const [h, m] = str.split(":").map(Number);
  return h * 60 + m;
}

function formatCurrency(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

export default function Analytics() {
  const { goBack, state } = useApp();
  const [range, setRange] = useState<Range>("today");
  const [customDate, setCustomDate] = useState(new Date().toISOString().split("T")[0]);
  const [fromTime, setFromTime] = useState("09:00");
  const [toTime, setToTime] = useState("21:00");

  const filtered = useMemo(() => {
    const now = new Date();
    const txs = state.transactions;

    return txs.filter((tx) => {
      const d = new Date(tx.date);
      const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);

      if (range === "1h") return now.getTime() - d.getTime() <= 3600000;
      if (range === "3h") return now.getTime() - d.getTime() <= 10800000;
      if (range === "today") return diff === 0;
      if (range === "7d") return diff <= 7;
      if (range === "30d") return diff <= 30;

      if (range === "custom") {
        const dateStr = d.toISOString().split("T")[0];
        if (dateStr !== customDate) return false;
        const txMin = d.getHours() * 60 + d.getMinutes();
        const fromMin = parseHourMin(fromTime);
        const toMin = parseHourMin(toTime);
        return txMin >= fromMin && txMin <= toMin;
      }
      return true;
    });
  }, [state.transactions, range, customDate, fromTime, toTime]);

  const sent = filtered.filter((tx) => (tx.type === "sent" || tx.type === "bill" || tx.type === "recharge") && tx.status === "successful").reduce((s, t) => s + t.amount, 0);
  const received = filtered.filter((tx) => tx.type === "received" && tx.status === "successful").reduce((s, t) => s + t.amount, 0);
  const successful = filtered.filter((tx) => tx.status === "successful").length;
  const failed = filtered.filter((tx) => tx.status === "failed").length;
  const pending = filtered.filter((tx) => tx.status === "pending").length;
  const total = sent + received;
  const avg = filtered.length > 0 ? Math.round(total / filtered.length) : 0;

  const hourBuckets = useMemo(() => {
    const buckets: Record<number, number> = {};
    for (let h = 0; h < 24; h++) buckets[h] = 0;
    filtered.forEach((tx) => {
      const h = new Date(tx.date).getHours();
      buckets[h] += tx.amount;
    });
    return buckets;
  }, [filtered]);

  const maxBucket = Math.max(...Object.values(hourBuckets), 1);
  const chartHours = Array.from({ length: 24 }, (_, i) => i).filter((h) => hourBuckets[h] > 0 || h % 3 === 0);

  const ranges: { id: Range; label: string }[] = [
    { id: "1h", label: "1H" },
    { id: "3h", label: "3H" },
    { id: "today", label: "Today" },
    { id: "7d", label: "7 Days" },
    { id: "30d", label: "30 Days" },
    { id: "custom", label: "Custom" },
  ];

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-950 screen-enter">
      <div className="flex items-center gap-3 px-5 pt-5 pb-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <button onClick={goBack} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-90 transition-all">
          <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
        </button>
        <span className="font-semibold text-gray-800 dark:text-gray-100">Transaction Analytics</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-5 pt-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {ranges.map((r) => (
              <button
                key={r.id}
                onClick={() => setRange(r.id)}
                className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all active:scale-95 ${
                  range === r.id
                    ? "bg-[#1e3058] dark:bg-green-500 text-white"
                    : "bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {range === "custom" && (
            <div className="mt-3 flex gap-3 flex-wrap animate-fade-in">
              <div className="flex-1 min-w-32">
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Date</p>
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:border-[#1e3058] dark:focus:border-green-400"
                />
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">From</p>
                <input
                  type="time"
                  value={fromTime}
                  onChange={(e) => setFromTime(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-100 focus:outline-none"
                />
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">To</p>
                <input
                  type="time"
                  value={toTime}
                  onChange={(e) => setToTime(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-100 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        <div className="px-5 mt-4">
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { label: "Transactions", value: filtered.length, sub: `${successful} successful`, color: "text-gray-900 dark:text-white" },
              { label: "Total Amount", value: formatCurrency(total), sub: `Avg: ${formatCurrency(avg)}`, color: "text-gray-900 dark:text-white" },
              { label: "Money Sent", value: formatCurrency(sent), icon: <TrendingDown size={14} className="text-red-400" />, color: "text-red-600 dark:text-red-400" },
              { label: "Money Received", value: formatCurrency(received), icon: <TrendingUp size={14} className="text-green-500" />, color: "text-green-600 dark:text-green-400" },
              { label: "Successful", value: successful, color: "text-green-600 dark:text-green-400" },
              { label: "Failed", value: failed, color: "text-red-600 dark:text-red-400" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-1.5 mb-1">
                  {stat.icon}
                  <p className="text-xs text-gray-400 dark:text-gray-500">{stat.label}</p>
                </div>
                <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                {stat.sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{stat.sub}</p>}
              </div>
            ))}
          </div>

          {filtered.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm mb-4">
              <div className="flex items-center gap-2 mb-4">
                <BarChart2 size={16} className="text-[#1e3058] dark:text-green-400" />
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Activity by Hour</p>
              </div>
              <div className="flex items-end gap-1 h-24">
                {Array.from({ length: 24 }, (_, h) => h).map((h) => {
                  const val = hourBuckets[h];
                  const pct = val > 0 ? Math.max((val / maxBucket) * 100, 5) : 0;
                  return (
                    <div key={h} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full rounded-t-sm transition-all duration-500"
                        style={{
                          height: `${pct}%`,
                          background: val > 0 ? "#1e3058" : "transparent",
                          opacity: val > 0 ? 0.7 + (val / maxBucket) * 0.3 : 0.1,
                        }}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[9px] text-gray-300 dark:text-gray-600">12AM</span>
                <span className="text-[9px] text-gray-300 dark:text-gray-600">12PM</span>
                <span className="text-[9px] text-gray-300 dark:text-gray-600">11PM</span>
              </div>
            </div>
          )}

          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-2">TRANSACTIONS IN RANGE ({filtered.length})</p>
          <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm mb-6">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-gray-400 dark:text-gray-500 text-sm">No transactions in this range</div>
            ) : (
              filtered.map((tx, i) => (
                <div key={tx.id} className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? "border-t border-gray-50 dark:border-gray-800" : ""}`}>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                      {tx.type === "received" ? tx.sender : tx.recipient}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {new Date(tx.date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
                    </p>
                  </div>
                  <span className={`text-sm font-bold ${tx.type === "received" ? "text-green-600 dark:text-green-400" : "text-gray-800 dark:text-gray-100"}`}>
                    {tx.type === "received" ? "+" : "-"}₹{tx.amount.toLocaleString("en-IN")}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
