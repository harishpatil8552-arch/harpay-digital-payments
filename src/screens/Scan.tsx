import { useState, useEffect } from "react";
import { X, Flashlight, Image, ScanLine, CheckCircle, ChevronRight, Edit3, AlertCircle } from "lucide-react";
import NumericKeypad from "../components/NumericKeypad";
import PinModal from "../components/PinModal";
import { ProcessingOverlay, PaymentSuccess, PaymentFailed } from "../components/PaymentFlow";
import { useApp } from "../context";
import { Transaction } from "../types";

type ScanStep = "scanner" | "recipient" | "amount" | "confirm" | "pin" | "processing" | "success" | "failed";

interface Recipient { name: string; upiId: string; verified: boolean; }

const DEMO_RECIPIENT: Recipient = { name: "Rahul Sharma", upiId: "rahul@harpay", verified: true };

export default function Scan() {
  const { goBack, navigate, addTransaction, showToast } = useApp();
  const [step, setStep] = useState<ScanStep>("scanner");
  const [flashOn, setFlashOn] = useState(false);
  const [recipient, setRecipient] = useState<Recipient | null>(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [scanning, setScanning] = useState(false);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [scanLines, setScanLines] = useState(0);

  useEffect(() => {
    if (step === "scanner") {
      const interval = setInterval(() => setScanLines((v) => (v + 1) % 100), 20);
      return () => clearInterval(interval);
    }
  }, [step]);

  function handleScanDemo() {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setRecipient(DEMO_RECIPIENT);
      setStep("recipient");
    }, 1200);
  }

  function handleConfirmRecipient() {
    if (!amount || Number(amount) <= 0) {
      showToast("Please enter an amount", "error");
      return;
    }
    setStep("confirm");
  }

  function handlePaySecurely() {
    setStep("pin");
  }

  async function handlePinSuccess() {
    setStep("processing");
    try {
      await new Promise((resolve) => setTimeout(resolve, 2200));
      const tx = await addTransaction({
        type: "sent",
        category: "payment",
        recipient: recipient!.name,
        recipientUpiId: recipient!.upiId,
        sender: "Harish Patil",
        senderUpiId: "harish@harpay",
        amount: Number(amount),
        note,
        status: "successful",
      });
      setTransaction(tx);
      setStep("success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Unable to save payment", "error");
      setStep("confirm");
    }
  }

  function handleDone() {
    navigate("home");
  }

  if (step === "processing") {
    return <ProcessingOverlay recipientName={recipient?.name ?? ""} amount={amount} />;
  }
  if (step === "success" && transaction) {
    return <PaymentSuccess transaction={transaction} onDone={handleDone} onViewReceipt={() => setShowReceipt(true)} />;
  }
  if (step === "failed") {
    return <PaymentFailed onRetry={() => setStep("confirm")} onHome={handleDone} />;
  }

  return (
    <div className="h-full flex flex-col bg-gray-900 screen-enter">
      {step === "scanner" && (
        <>
          <div className="flex items-center justify-between px-5 pt-5 pb-4">
            <button onClick={goBack} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center active:scale-90 transition-transform">
              <X size={18} className="text-white" />
            </button>
            <span className="text-white font-semibold">Scan & Pay</span>
            <button
              onClick={() => setFlashOn((v) => !v)}
              className={`w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-all ${flashOn ? "bg-yellow-400" : "bg-white/10"}`}
            >
              <Flashlight size={18} className={flashOn ? "text-gray-900" : "text-white"} />
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center px-8 relative">
            <div className="relative w-full max-w-xs aspect-square mb-8">
              <div className="absolute inset-0 rounded-3xl bg-black/50" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-56 h-56">
                  <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-green-400 rounded-tl-2xl" />
                  <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-green-400 rounded-tr-2xl" />
                  <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-green-400 rounded-bl-2xl" />
                  <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-green-400 rounded-br-2xl" />
                  <div
                    className="absolute left-2 right-2 h-0.5 bg-green-400 shadow-lg shadow-green-400/50"
                    style={{ top: `${scanLines}%`, transition: "top 0.02s linear" }}
                  />
                  {scanning && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full border-4 border-green-400 border-t-transparent animate-spin" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <p className="text-white/70 text-sm text-center mb-6">Align QR code within the frame</p>

            <div className="flex gap-3 w-full max-w-xs">
              <button
                onClick={handleScanDemo}
                disabled={scanning}
                className="flex-1 py-3.5 rounded-2xl bg-green-500 text-white font-semibold text-sm active:scale-95 transition-all shadow-lg shadow-green-500/30 disabled:opacity-60"
              >
                {scanning ? "Scanning..." : "Scan Demo QR"}
              </button>
              <button className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center active:scale-90 transition-transform">
                <Image size={20} className="text-white" />
              </button>
            </div>

            <p className="text-white/40 text-xs mt-4">or upload from gallery</p>
          </div>
        </>
      )}

      {step === "recipient" && recipient && (
        <div className="flex flex-col h-full bg-white dark:bg-gray-900 screen-enter">
          <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800">
            <button onClick={() => setStep("scanner")} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-90 transition-all">
              <X size={20} className="text-gray-600 dark:text-gray-400" />
            </button>
            <span className="font-semibold text-gray-800 dark:text-gray-100">Recipient</span>
          </div>

          <div className="flex flex-col items-center pt-8 px-6">
            <div className="w-20 h-20 rounded-full bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-2xl font-bold text-purple-600 dark:text-purple-400 mb-4">
              RS
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{recipient.name}</h2>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-gray-400 dark:text-gray-500 text-sm">{recipient.upiId}</span>
              {recipient.verified && <CheckCircle size={14} className="text-green-500" />}
              {recipient.verified && <span className="text-xs text-green-500 font-medium">Verified</span>}
            </div>

            <div className="mt-8 w-full">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-2">ENTER AMOUNT</p>
              <div className="flex items-center gap-3 py-4 px-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-800 focus-within:border-[#1e3058] dark:focus-within:border-green-400 transition-colors mb-4">
                <span className="text-2xl font-bold text-gray-400 dark:text-gray-500">₹</span>
                <span className="text-3xl font-bold text-gray-900 dark:text-white flex-1">{amount || "0"}</span>
              </div>

              <NumericKeypad value={amount} onChange={setAmount} />

              <div className="mt-4 px-4">
                <input
                  placeholder="Add a note (optional)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none focus:border-[#1e3058] dark:focus:border-green-400 transition-colors"
                />
              </div>

              <div className="mt-4 px-4">
                <button
                  onClick={handleConfirmRecipient}
                  disabled={!amount || Number(amount) <= 0}
                  className="w-full py-4 rounded-2xl bg-[#1e3058] dark:bg-green-500 text-white font-bold text-base active:scale-95 transition-all shadow-lg disabled:opacity-50"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === "confirm" && recipient && (
        <div className="flex flex-col h-full bg-white dark:bg-gray-900 screen-enter">
          <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800">
            <button onClick={() => setStep("recipient")} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-90 transition-all">
              <ChevronRight size={20} className="text-gray-600 dark:text-gray-400 rotate-180" />
            </button>
            <span className="font-semibold text-gray-800 dark:text-gray-100">Confirm Payment</span>
          </div>

          <div className="flex-1 px-6 pt-6">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-3xl p-6 mb-6">
              <div className="text-center mb-6">
                <p className="text-gray-400 dark:text-gray-500 text-sm mb-1">Paying to</p>
                <div className="w-14 h-14 rounded-full bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-lg font-bold text-purple-600 dark:text-purple-400 mx-auto mb-2">RS</div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{recipient.name}</h3>
                <p className="text-gray-400 dark:text-gray-500 text-sm">{recipient.upiId}</p>
              </div>

              <div className="border-t border-dashed border-gray-200 dark:border-gray-700 my-4" />

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 dark:text-gray-500 text-sm">Amount</span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">₹{Number(amount).toLocaleString("en-IN")}</span>
                </div>
                {note && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 dark:text-gray-500 text-sm">Note</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{note}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 dark:text-gray-500 text-sm">Payment Method</span>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Harpay UPI</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl mb-6">
              <AlertCircle size={16} className="text-blue-500 shrink-0" />
              <p className="text-xs text-blue-600 dark:text-blue-400">This payment is secured by Harpay UPI</p>
            </div>

            <button
              onClick={handlePaySecurely}
              className="w-full py-4 rounded-2xl bg-[#1e3058] dark:bg-green-500 text-white font-bold text-base active:scale-95 transition-all shadow-lg shadow-[#1e3058]/20"
            >
              Pay Securely ₹{Number(amount).toLocaleString("en-IN")}
            </button>
          </div>
        </div>
      )}

      {step === "pin" && recipient && (
        <div className="flex flex-col h-full bg-white dark:bg-gray-900 screen-enter">
          <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800">
            <button onClick={() => setStep("confirm")} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-90 transition-all">
              <ChevronRight size={20} className="text-gray-600 dark:text-gray-400 rotate-180" />
            </button>
            <span className="font-semibold text-gray-800 dark:text-gray-100">Confirm Payment</span>
          </div>
          <PinModal
            onSuccess={handlePinSuccess}
            onClose={() => setStep("confirm")}
            recipientName={recipient.name}
            amount={amount}
          />
        </div>
      )}
    </div>
  );
}
