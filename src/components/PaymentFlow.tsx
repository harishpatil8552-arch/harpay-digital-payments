import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Clock, Share2, Download, RotateCcw, Home, Eye, ChevronRight } from "lucide-react";
import Logo from "./Logo";
import { useApp } from "../context";
import { Transaction } from "../types";

interface PaymentSuccessProps {
  transaction: Transaction;
  onDone: () => void;
  onViewReceipt: () => void;
}

export function PaymentSuccess({ transaction, onDone, onViewReceipt }: PaymentSuccessProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(t);
  }, []);

  const isReceived = transaction.type === "received";
  const amount = transaction.amount.toLocaleString("en-IN");
  const party = isReceived ? transaction.sender : transaction.recipient;
  const date = new Date(transaction.date);

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 flex flex-col items-center justify-center screen-enter">
      <div className={`flex flex-col items-center transition-all duration-500 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <div className="relative mb-6">
          {show && (
            <>
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 rounded-full animate-confetti"
                  style={{
                    left: `${20 + Math.random() * 60}%`,
                    top: `${-10 + Math.random() * 20}%`,
                    background: ["#10b981","#6366f1","#f59e0b","#ec4899","#3b82f6"][i % 5],
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </>
          )}
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-green-100 dark:bg-green-950 animate-pulse-ring" />
            <CheckCircle2 size={80} className="text-green-500 animate-pop-in relative z-10" />
          </div>
        </div>

        <p className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-1">Payment Successful</p>
        <p className="text-4xl font-bold text-gray-900 dark:text-white mb-1">₹{amount}</p>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
          {isReceived ? "Received from" : "Paid to"} {party}
        </p>

        <div className="w-full max-w-xs bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 mx-4 space-y-2 mb-8">
          {[
            ["Transaction ID", transaction.id],
            ["Date", date.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })],
            ["Time", date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })],
            ["UPI ID", isReceived ? transaction.senderUpiId : transaction.recipientUpiId],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between items-center">
              <span className="text-xs text-gray-400 dark:text-gray-500">{label}</span>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate max-w-[55%] text-right">{value}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-3 w-full max-w-xs px-4">
          <button
            onClick={onViewReceipt}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-[#1e3058] dark:border-green-400 text-[#1e3058] dark:text-green-400 font-semibold text-sm active:scale-95 transition-all"
          >
            <Eye size={16} /> Receipt
          </button>
          <button
            onClick={onDone}
            className="flex-1 py-3.5 rounded-2xl bg-[#1e3058] dark:bg-green-500 text-white font-semibold text-sm active:scale-95 transition-all shadow-lg"
          >
            Done
          </button>
        </div>

        <div className="flex gap-6 mt-4">
          <button className="flex flex-col items-center gap-1 text-gray-400 dark:text-gray-500 active:scale-95 transition-transform">
            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Share2 size={16} />
            </div>
            <span className="text-[10px]">Share</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-gray-400 dark:text-gray-500 active:scale-95 transition-transform">
            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Download size={16} />
            </div>
            <span className="text-[10px]">Download</span>
          </button>
        </div>
      </div>
    </div>
  );
}

interface PaymentFailedProps {
  onRetry: () => void;
  onHome: () => void;
  reason?: string;
}

export function PaymentFailed({ onRetry, onHome, reason }: PaymentFailedProps) {
  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 flex flex-col items-center justify-center screen-enter">
      <div className="flex flex-col items-center px-8 text-center">
        <XCircle size={80} className="text-red-500 animate-pop-in mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Payment Failed</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          {reason ?? "Your bank declined the transaction. Please try again."}
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button onClick={onRetry} className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-[#1e3058] dark:bg-green-500 text-white font-semibold active:scale-95 transition-all shadow-lg">
            <RotateCcw size={18} /> Try Again
          </button>
          <button onClick={onHome} className="flex items-center justify-center gap-2 py-4 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold active:scale-95 transition-all">
            <Home size={18} /> Go Home
          </button>
        </div>
      </div>
    </div>
  );
}

interface PaymentPendingProps {
  onCheckStatus: () => void;
  onHome: () => void;
}

export function PaymentPending({ onCheckStatus, onHome }: PaymentPendingProps) {
  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 flex flex-col items-center justify-center screen-enter">
      <div className="flex flex-col items-center px-8 text-center">
        <Clock size={80} className="text-amber-500 animate-pop-in mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Payment Pending</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          {"We're waiting for confirmation from your bank. This usually takes a few seconds."}
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button onClick={onCheckStatus} className="py-4 rounded-2xl bg-[#1e3058] dark:bg-green-500 text-white font-semibold active:scale-95 transition-all shadow-lg">
            Check Status
          </button>
          <button onClick={onHome} className="py-4 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold active:scale-95 transition-all">
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}

interface ProcessingOverlayProps {
  recipientName: string;
  amount: string;
}

export function ProcessingOverlay({ recipientName, amount }: ProcessingOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 flex flex-col items-center justify-center screen-enter">
      <div className="flex flex-col items-center gap-6">
        <Logo size={48} />
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 rounded-full border-4 border-gray-100 dark:border-gray-800" />
          <div className="absolute inset-0 rounded-full border-4 border-t-[#1e3058] dark:border-t-green-400 animate-spin" />
          <div className="absolute inset-4 rounded-full bg-green-50 dark:bg-green-950 flex items-center justify-center">
            <span className="text-xl">₹</span>
          </div>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-gray-800 dark:text-white">Processing...</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Paying ₹{Number(amount).toLocaleString("en-IN")} to {recipientName}</p>
        </div>
      </div>
    </div>
  );
}

interface ReceiptModalProps {
  transaction: Transaction;
  onClose: () => void;
}

export function ReceiptModal({ transaction, onClose }: ReceiptModalProps) {
  const { showToast } = useApp();
  const isReceived = transaction.type === "received";
  const party = isReceived ? transaction.sender : transaction.recipient;
  const upiId = isReceived ? transaction.senderUpiId : transaction.recipientUpiId;
  const date = new Date(transaction.date);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-t-3xl pb-8 bottom-sheet-enter">
        <div className="w-10 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mt-3 mb-4" />

        <div className="px-6">
          <div className="flex items-center justify-between mb-6">
            <Logo size={32} showText={true} />
            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
              transaction.status === "successful" ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400" :
              transaction.status === "failed" ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400" :
              "bg-amber-100 text-amber-700"
            }`}>
              {transaction.status === "successful" ? "✓ Success" : transaction.status === "failed" ? "✗ Failed" : "⏳ Pending"}
            </span>
          </div>

          <div className="text-center mb-6">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">₹{transaction.amount.toLocaleString("en-IN")}</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{isReceived ? "Received from" : "Paid to"} {party}</p>
          </div>

          <div className="border-t border-dashed border-gray-200 dark:border-gray-700 my-4" />

          <div className="space-y-3">
            {[
              ["UPI ID", upiId],
              ["Transaction ID", transaction.id],
              ["Date", date.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })],
              ["Time", date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })],
              ["Payment Method", "Harpay UPI"],
              ...(transaction.note ? [["Note", transaction.note]] : []),
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between">
                <span className="text-xs text-gray-400 dark:text-gray-500">{label}</span>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-right max-w-[60%]">{value}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-gray-200 dark:border-gray-700 my-4" />

          <div className="flex gap-3">
            <button
              onClick={() => showToast("Receipt shared successfully")}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium active:scale-95 transition-all"
            >
              <Share2 size={16} /> Share
            </button>
            <button
              onClick={() => showToast("Receipt downloaded")}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium active:scale-95 transition-all"
            >
              <Download size={16} /> Download
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl bg-[#1e3058] dark:bg-green-500 text-white text-sm font-semibold active:scale-95 transition-all"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
