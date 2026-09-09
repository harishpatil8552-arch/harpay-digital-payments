import { useState } from "react";
import { X, Delete, ShieldCheck } from "lucide-react";

interface PinModalProps {
  onSuccess: () => void;
  onClose: () => void;
  recipientName: string;
  amount: string;
}

const CORRECT_PIN = "1234";

export default function PinModal({ onSuccess, onClose, recipientName, amount }: PinModalProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  function pressKey(k: string) {
    if (k === "del") {
      setPin((p) => p.slice(0, -1));
      return;
    }
    if (pin.length >= 4) return;
    const next = pin + k;
    setPin(next);
    if (next.length === 4) {
      setTimeout(() => {
        if (next === CORRECT_PIN) {
          onSuccess();
        } else {
          setError("Incorrect UPI PIN. Please try again.");
          setShake(true);
          setTimeout(() => { setShake(false); setPin(""); setError(""); }, 800);
        }
      }, 200);
    }
  }

  const keys = ["1","2","3","4","5","6","7","8","9","","0","del"];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-t-3xl pb-8 bottom-sheet-enter"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mt-3 mb-4" />

        <div className="px-6 pb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <ShieldCheck size={20} className="text-green-500" />
              <span className="font-semibold text-gray-800 dark:text-gray-100">Enter UPI PIN</span>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <X size={18} className="text-gray-500" />
            </button>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Paying ₹{Number(amount).toLocaleString("en-IN")} to {recipientName}
          </p>
        </div>

        <div className={`flex justify-center gap-4 mb-6 ${shake ? "animate-bounce" : ""}`}>
          {[0,1,2,3].map((i) => (
            <div key={i} className={`w-4 h-4 rounded-full border-2 transition-all duration-200
              ${i < pin.length
                ? "bg-[#1e3058] border-[#1e3058] dark:bg-green-400 dark:border-green-400"
                : "border-gray-300 dark:border-gray-600"
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="text-center text-sm text-red-500 mb-4 px-4">{error}</p>
        )}

        <div className="grid grid-cols-3 gap-2 px-6">
          {keys.map((k, i) => (
            <button
              key={i}
              onClick={() => k && pressKey(k)}
              disabled={!k}
              className={`h-14 rounded-2xl flex items-center justify-center text-xl font-semibold transition-all active:scale-95
                ${k ? "bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 active:bg-gray-200 dark:active:bg-gray-700 shadow-sm hover:shadow" : "opacity-0 pointer-events-none"}
              `}
            >
              {k === "del" ? <Delete size={20} className="text-gray-500 dark:text-gray-400" /> : k}
            </button>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4">Demo PIN: 1234</p>
      </div>
    </div>
  );
}
