import { ArrowLeft, Share2, Download, RotateCcw, AlertCircle, CheckCircle2, XCircle, Clock } from "lucide-react";
import { useApp } from "../context";
import { useState } from "react";
import { ReceiptModal } from "../components/PaymentFlow";

export default function TransactionDetail() {
  const { goBack, state, navigate, dispatch } = useApp();
  const [showReceipt, setShowReceipt] = useState(false);
  const tx = state.selectedTransaction;

  if (!tx) {
    goBack();
    return null;
  }

  const isReceived = tx.type === "received";
  const party = isReceived ? tx.sender : tx.recipient;
  const upiId = isReceived ? tx.senderUpiId : tx.recipientUpiId;
  const date = new Date(tx.date);

  function handleRepeat() {
    navigate("send-money");
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-950 screen-enter">
      <div className="flex items-center gap-3 px-5 pt-5 pb-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <button onClick={goBack} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-90 transition-all">
          <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
        </button>
        <span className="font-semibold text-gray-800 dark:text-gray-100">Transaction Detail</span>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6">
        <div className="flex flex-col items-center mb-8">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-3 ${
            tx.status === "successful" ? "bg-green-100 dark:bg-green-950" :
            tx.status === "failed" ? "bg-red-100 dark:bg-red-950" :
            "bg-amber-100 dark:bg-amber-950"
          }`}>
            {tx.status === "successful" && <CheckCircle2 size={40} className="text-green-500" />}
            {tx.status === "failed" && <XCircle size={40} className="text-red-500" />}
            {tx.status === "pending" && <Clock size={40} className="text-amber-500" />}
          </div>
          <span className={`text-sm font-semibold px-3 py-1 rounded-full mb-3 ${
            tx.status === "successful" ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400" :
            tx.status === "failed" ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400" :
            "bg-amber-100 text-amber-700"
          }`}>
            {tx.status === "successful" ? "✓ Successful" : tx.status === "failed" ? "✗ Failed" : "⏳ Pending"}
          </span>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {isReceived ? "+" : "-"}₹{tx.amount.toLocaleString("en-IN")}
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
            {isReceived ? "Received from" : "Paid to"} {party}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm overflow-hidden mb-4">
          {[
            ["UPI ID", upiId],
            ["Transaction ID", tx.id],
            ["Date", date.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })],
            ["Time", date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })],
            ["Payment Method", "Harpay UPI"],
            ...(tx.note ? [["Note", tx.note]] : []),
          ].map(([label, value], i, arr) => (
            <div key={label} className={`flex justify-between px-5 py-4 ${i < arr.length - 1 ? "border-b border-gray-50 dark:border-gray-800" : ""}`}>
              <span className="text-sm text-gray-400 dark:text-gray-500">{label}</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-right max-w-[60%] break-all">{value}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <button
            onClick={() => setShowReceipt(true)}
            className="flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium active:scale-95 transition-all"
          >
            <Share2 size={16} /> Share Receipt
          </button>
          <button
            onClick={() => setShowReceipt(true)}
            className="flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium active:scale-95 transition-all"
          >
            <Download size={16} /> Download
          </button>
        </div>

        {!isReceived && tx.status === "successful" && (
          <button
            onClick={handleRepeat}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#1e3058] dark:bg-green-500 text-white font-semibold text-sm active:scale-95 transition-all shadow-lg mb-3"
          >
            <RotateCcw size={16} /> Repeat Payment
          </button>
        )}

        <button className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-red-200 dark:border-red-900 text-red-500 dark:text-red-400 font-semibold text-sm active:scale-95 transition-all">
          <AlertCircle size={16} /> Report Issue
        </button>
      </div>

      {showReceipt && <ReceiptModal transaction={tx} onClose={() => setShowReceipt(false)} />}
    </div>
  );
}
