import { useState } from "react";
import { ArrowLeft, CheckCircle2, AtSign } from "lucide-react";
import NumericKeypad from "../components/NumericKeypad";
import { useApp } from "../context";
import { UPI_LOOKUP, CONTACTS } from "../data";

export default function RequestMoney() {
  const { goBack, showToast } = useApp();
  const [upiId, setUpiId] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [recipient, setRecipient] = useState<{ name: string; upiId: string } | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function lookupUpi() {
    const found = UPI_LOOKUP[upiId.toLowerCase()];
    if (found) {
      setRecipient({ name: found.name, upiId: upiId.toLowerCase() });
      setError("");
    } else {
      setError("UPI ID not found. Try: rahul@harpay");
    }
  }

  function sendRequest() {
    if (!recipient) { setError("Please enter a valid UPI ID"); return; }
    if (!amount || Number(amount) <= 0) { showToast("Enter an amount", "error"); return; }
    setSuccess(true);
    showToast(`Payment request sent to ${recipient.name}`);
  }

  if (success) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-white dark:bg-gray-900 screen-enter px-6 text-center">
        <CheckCircle2 size={80} className="text-green-500 animate-pop-in mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Request Sent!</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-2">
          Requested ₹{Number(amount).toLocaleString("en-IN")} from {recipient?.name}
        </p>
        {note && <p className="text-sm text-gray-400 dark:text-gray-500 mb-8">"{note}"</p>}
        <button onClick={goBack} className="w-full max-w-xs py-4 rounded-2xl bg-[#1e3058] dark:bg-green-500 text-white font-bold active:scale-95 transition-all">
          Done
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 screen-enter">
      <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800">
        <button onClick={goBack} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-90 transition-all">
          <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
        </button>
        <span className="font-semibold text-gray-800 dark:text-gray-100">Request Money</span>
      </div>

      <div className="flex-1 flex flex-col px-5 pt-6">
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-2">FROM (UPI ID)</p>
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 px-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 focus-within:border-[#1e3058] dark:focus-within:border-green-400 transition-colors">
              <AtSign size={16} className="text-gray-400 shrink-0" />
              <input
                value={upiId}
                onChange={(e) => { setUpiId(e.target.value); setError(""); setRecipient(null); }}
                placeholder="Enter UPI ID (e.g. rahul@harpay)"
                className="flex-1 py-3.5 bg-transparent text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none"
                onKeyDown={(e) => e.key === "Enter" && lookupUpi()}
              />
            </div>
            <button onClick={lookupUpi} className="px-4 rounded-xl bg-[#1e3058] dark:bg-green-500 text-white font-semibold text-sm active:scale-95 transition-all">
              Find
            </button>
          </div>
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Demo: rahul@harpay</p>
        </div>

        {recipient && (
          <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/30 rounded-xl mb-4 animate-fade-in">
            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-950 flex items-center justify-center font-bold text-purple-600 dark:text-purple-400 text-sm">
              {recipient.name.split(" ").map((w) => w[0]).join("").slice(0,2)}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{recipient.name}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">{recipient.upiId}</p>
            </div>
            <CheckCircle2 size={18} className="text-green-500 ml-auto" />
          </div>
        )}

        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-2">AMOUNT</p>
          <div className="flex items-center gap-3 py-4 px-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-800 focus-within:border-[#1e3058] dark:focus-within:border-green-400 transition-colors mb-3">
            <span className="text-2xl font-bold text-gray-400 dark:text-gray-500">₹</span>
            <span className="text-3xl font-bold text-gray-900 dark:text-white flex-1">{amount || "0"}</span>
          </div>
          <NumericKeypad value={amount} onChange={setAmount} />
        </div>

        <div className="mb-6">
          <input
            placeholder="Add a note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none"
          />
        </div>

        <button
          onClick={sendRequest}
          disabled={!recipient || !amount || Number(amount) <= 0}
          className="w-full py-4 rounded-2xl bg-[#1e3058] dark:bg-green-500 text-white font-bold active:scale-95 transition-all shadow-lg disabled:opacity-50"
        >
          Request Money
        </button>
      </div>
    </div>
  );
}
