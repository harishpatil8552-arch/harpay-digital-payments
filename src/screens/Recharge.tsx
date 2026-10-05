import { useState } from "react";
import { ArrowLeft, CheckCircle } from "lucide-react";
import PinModal from "../components/PinModal";
import { ProcessingOverlay, PaymentSuccess } from "../components/PaymentFlow";
import { useApp } from "../context";
import { PLANS } from "../data";
import { Transaction } from "../types";

type Operator = "Jio" | "Airtel" | "Vi" | "BSNL";

export default function Recharge() {
  const { goBack, navigate, addTransaction, showToast } = useApp();
  const [step, setStep] = useState<"form" | "plans" | "confirm" | "pin" | "processing" | "success">("form");
  const [mobile, setMobile] = useState("");
  const [operator, setOperator] = useState<Operator>("Jio");
  const [selectedPlan, setSelectedPlan] = useState<(typeof PLANS.Jio)[0] | null>(null);
  const [mobileError, setMobileError] = useState("");
  const [transaction, setTransaction] = useState<Transaction | null>(null);

  function handleContinue() {
    if (!/^[6-9]\d{9}$/.test(mobile)) { setMobileError("Enter a valid 10-digit number"); return; }
    setMobileError("");
    setStep("plans");
  }

  function handleSelectPlan(plan: (typeof PLANS.Jio)[0]) {
    setSelectedPlan(plan);
    setStep("confirm");
  }

  async function handlePinSuccess() {
    setStep("processing");
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const tx = await addTransaction({
        type: "recharge",
        category: "mobile",
        recipient: `${operator} Mobile`,
        recipientUpiId: `${operator.toLowerCase()}@recharge`,
        sender: "Harish Patil",
        senderUpiId: "harish@harpay",
        amount: selectedPlan!.price,
        note: `${operator} recharge - ${selectedPlan!.validity}`,
        status: "successful",
      });
      setTransaction(tx);
      setStep("success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Unable to save payment", "error");
      setStep("confirm");
    }
  }

  if (step === "processing") return <ProcessingOverlay recipientName={`${operator} Recharge`} amount={String(selectedPlan?.price ?? 0)} />;
  if (step === "success" && transaction) return <PaymentSuccess transaction={transaction} onDone={() => navigate("home")} onViewReceipt={() => {}} />;

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 screen-enter">
      <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800">
        <button onClick={step === "form" ? goBack : () => setStep(step === "confirm" ? "plans" : "form")} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-90 transition-all">
          <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
        </button>
        <span className="font-semibold text-gray-800 dark:text-gray-100">Mobile Recharge</span>
      </div>

      {step === "form" && (
        <div className="flex-1 px-5 pt-6 animate-fade-in">
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-2">MOBILE NUMBER</p>
            <input
              type="tel"
              maxLength={10}
              value={mobile}
              onChange={(e) => { setMobile(e.target.value.replace(/\D/g, "")); setMobileError(""); }}
              placeholder="Enter 10-digit number"
              className="w-full px-4 py-3.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-[#1e3058] dark:focus:border-green-400 transition-colors"
              autoFocus
            />
            {mobileError && <p className="text-xs text-red-500 mt-1">{mobileError}</p>}
          </div>

          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-2">OPERATOR</p>
            <div className="grid grid-cols-4 gap-2">
              {(["Jio","Airtel","Vi","BSNL"] as Operator[]).map((op) => (
                <button
                  key={op}
                  onClick={() => setOperator(op)}
                  className={`py-3 rounded-xl border-2 text-sm font-semibold transition-all active:scale-95 ${
                    operator === op
                      ? "border-[#1e3058] bg-[#1e3058]/5 text-[#1e3058] dark:border-green-400 dark:bg-green-400/10 dark:text-green-400"
                      : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {op}
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleContinue} className="w-full py-4 rounded-2xl bg-[#1e3058] dark:bg-green-500 text-white font-bold active:scale-95 transition-all shadow-lg">
            View Plans
          </button>
        </div>
      )}

      {step === "plans" && (
        <div className="flex-1 overflow-y-auto px-5 pt-4 animate-fade-in">
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">{operator} Plans for {mobile}</p>
          <div className="space-y-3">
            {PLANS[operator].map((plan) => (
              <button
                key={plan.id}
                onClick={() => handleSelectPlan(plan)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-[#1e3058] dark:hover:border-green-400 hover:bg-[#1e3058]/5 dark:hover:bg-green-400/5 active:scale-95 transition-all text-left"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl font-bold text-gray-900 dark:text-white">₹{plan.price}</span>
                    <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400 rounded-full font-medium">{plan.validity}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{plan.data}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{plan.desc}</p>
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-[#1e3058] dark:bg-green-400 opacity-0" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === "confirm" && selectedPlan && (
        <div className="flex-1 px-5 pt-6 animate-fade-in">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-3xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400 rounded-full font-medium">{operator}</span>
              <span className="text-xs text-gray-400 dark:text-gray-500">Recharge</span>
            </div>
            <p className="font-semibold text-gray-800 dark:text-gray-100 mb-1">{mobile}</p>
            <div className="border-t border-dashed border-gray-200 dark:border-gray-700 my-4" />
            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-gray-400 dark:text-gray-500 text-sm">Plan</span><span className="text-sm font-medium text-gray-700 dark:text-gray-300">{selectedPlan.data} · {selectedPlan.validity}</span></div>
              <div className="flex justify-between"><span className="text-gray-400 dark:text-gray-500 text-sm">Benefits</span><span className="text-sm font-medium text-gray-700 dark:text-gray-300">{selectedPlan.desc}</span></div>
              <div className="flex justify-between mt-2"><span className="text-gray-400 dark:text-gray-500 text-sm">Amount</span><span className="text-xl font-bold text-gray-900 dark:text-white">₹{selectedPlan.price}</span></div>
            </div>
          </div>
          <button onClick={() => setStep("pin")} className="w-full py-4 rounded-2xl bg-[#1e3058] dark:bg-green-500 text-white font-bold active:scale-95 transition-all shadow-lg">
            Recharge ₹{selectedPlan.price}
          </button>
        </div>
      )}

      {step === "pin" && selectedPlan && (
        <PinModal onSuccess={handlePinSuccess} onClose={() => setStep("confirm")} recipientName={`${operator} Recharge`} amount={String(selectedPlan.price)} />
      )}
    </div>
  );
}
