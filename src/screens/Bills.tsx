import { useState } from "react";
import { ArrowLeft, ChevronRight, CheckCircle2, Zap, Droplets, Tv, Flame, Wifi, Car, Shield, CreditCard } from "lucide-react";
import { ProcessingOverlay, PaymentSuccess } from "../components/PaymentFlow";
import PinModal from "../components/PinModal";
import { useApp } from "../context";
import { Transaction } from "../types";

type BillType = "electricity" | "water" | "dth" | "gas" | "broadband" | "fastag" | "insurance" | "credit-card";

interface BillConfig {
  icon: React.ReactNode;
  label: string;
  color: string;
  providers: string[];
  fields: Array<{ key: string; label: string; placeholder: string }>;
  category: string;
}

const BILLS: Record<BillType, BillConfig> = {
  electricity: { icon: <Zap size={24} />, label: "Electricity", color: "bg-yellow-100 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-400", providers: ["MSEB", "BESCOM", "TNEB", "PSPCL"], fields: [{ key: "consumerId", label: "Consumer Number", placeholder: "Enter consumer number" }], category: "electricity" },
  water: { icon: <Droplets size={24} />, label: "Water", color: "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400", providers: ["PMC Water", "BMC Water", "BWSSB", "HMWSSB"], fields: [{ key: "accountId", label: "Account Number", placeholder: "Enter account number" }], category: "water" },
  dth: { icon: <Tv size={24} />, label: "DTH", color: "bg-pink-100 text-pink-600 dark:bg-pink-950 dark:text-pink-400", providers: ["Tata Sky", "Airtel Digital TV", "Dish TV", "Sun Direct"], fields: [{ key: "subscriberId", label: "Subscriber ID", placeholder: "Enter subscriber ID" }], category: "dth" },
  gas: { icon: <Flame size={24} />, label: "Gas", color: "bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400", providers: ["MGL", "IGL", "MGL Piped Gas", "Adani Gas"], fields: [{ key: "customerId", label: "Customer ID", placeholder: "Enter customer ID" }], category: "gas" },
  broadband: { icon: <Wifi size={24} />, label: "Broadband", color: "bg-teal-100 text-teal-600 dark:bg-teal-950 dark:text-teal-400", providers: ["ACT Fibernet", "BSNL Broadband", "Airtel Xstream", "Jio Fiber"], fields: [{ key: "accountId", label: "Account ID", placeholder: "Enter account ID" }], category: "broadband" },
  fastag: { icon: <Car size={24} />, label: "FASTag", color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400", providers: ["NHAI FASTag", "IDFC Bank FASTag", "HDFC FASTag", "Axis Bank FASTag"], fields: [{ key: "vehicleNo", label: "Vehicle Number", placeholder: "e.g. MH12AB1234" }], category: "fastag" },
  insurance: { icon: <Shield size={24} />, label: "Insurance", color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400", providers: ["LIC", "SBI Life", "HDFC Life", "ICICI Prudential"], fields: [{ key: "policyNo", label: "Policy Number", placeholder: "Enter policy number" }], category: "insurance" },
  "credit-card": { icon: <CreditCard size={24} />, label: "Credit Card", color: "bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400", providers: ["HDFC Credit Card", "SBI Card", "ICICI Credit Card", "Axis Credit Card"], fields: [{ key: "cardNo", label: "Card Number", placeholder: "Last 4 digits" }], category: "credit_card" },
};

interface BillScreenProps {
  billType: BillType;
}

export default function BillScreen({ billType }: BillScreenProps) {
  const { goBack, addTransaction, showToast, navigate } = useApp();
  const config = BILLS[billType];
  const [step, setStep] = useState<"form" | "confirm" | "pin" | "processing" | "success">("form");
  const [provider, setProvider] = useState(config.providers[0]);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [amount, setAmount] = useState("");
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const errs: Record<string, string> = {};
    config.fields.forEach((f) => { if (!fields[f.key]) errs[f.key] = `${f.label} is required`; });
    if (!amount || Number(amount) <= 0) errs.amount = "Enter a valid amount";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handlePinSuccess() {
    setStep("processing");
    setTimeout(() => {
      const tx = addTransaction({
        type: "bill",
        category: config.category as any,
        recipient: `${provider}`,
        recipientUpiId: `${provider.toLowerCase().replace(/\s/g, "")}@billpay`,
        sender: "Harish Patil",
        senderUpiId: "harish@harpay",
        amount: Number(amount),
        note: `${config.label} bill payment`,
        status: "successful",
      });
      setTransaction(tx);
      setStep("success");
    }, 2000);
  }

  if (step === "processing") return <ProcessingOverlay recipientName={provider} amount={amount} />;
  if (step === "success" && transaction) return <PaymentSuccess transaction={transaction} onDone={() => navigate("home")} onViewReceipt={() => {}} />;

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 screen-enter">
      <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800">
        <button onClick={step === "form" ? goBack : () => setStep("form")} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-90 transition-all">
          <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
        </button>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${config.color}`}>{config.icon}</div>
        <span className="font-semibold text-gray-800 dark:text-gray-100">{config.label} Bill</span>
      </div>

      {step === "form" && (
        <div className="flex-1 overflow-y-auto px-5 pt-6 space-y-4 animate-fade-in">
          <div>
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-2">SELECT PROVIDER</p>
            <div className="grid grid-cols-2 gap-2">
              {config.providers.map((p) => (
                <button
                  key={p}
                  onClick={() => setProvider(p)}
                  className={`py-2.5 px-3 rounded-xl border-2 text-sm font-medium transition-all active:scale-95 ${
                    provider === p
                      ? "border-[#1e3058] bg-[#1e3058]/5 text-[#1e3058] dark:border-green-400 dark:bg-green-400/10 dark:text-green-400"
                      : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {config.fields.map((f) => (
            <div key={f.key}>
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-2">{f.label.toUpperCase()}</p>
              <input
                value={fields[f.key] ?? ""}
                onChange={(e) => { setFields({ ...fields, [f.key]: e.target.value }); setErrors({ ...errors, [f.key]: "" }); }}
                placeholder={f.placeholder}
                className="w-full px-4 py-3.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-[#1e3058] dark:focus:border-green-400 transition-colors"
              />
              {errors[f.key] && <p className="text-xs text-red-500 mt-1">{errors[f.key]}</p>}
            </div>
          ))}

          <div>
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-2">AMOUNT (₹)</p>
            <input
              type="number"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setErrors({ ...errors, amount: "" }); }}
              placeholder="Enter bill amount"
              className="w-full px-4 py-3.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-[#1e3058] dark:focus:border-green-400 transition-colors"
            />
            {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount}</p>}
          </div>

          <button
            onClick={() => { if (validate()) setStep("confirm"); }}
            className="w-full py-4 rounded-2xl bg-[#1e3058] dark:bg-green-500 text-white font-bold active:scale-95 transition-all shadow-lg mt-2"
          >
            Continue
          </button>
        </div>
      )}

      {step === "confirm" && (
        <div className="flex-1 px-5 pt-6 animate-fade-in">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-3xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${config.color}`}>{config.icon}</div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">{provider}</h3>
                <p className="text-xs text-gray-400 dark:text-gray-500">{config.label} Bill Payment</p>
              </div>
            </div>
            <div className="border-t border-dashed border-gray-200 dark:border-gray-700 my-4" />
            {config.fields.map((f) => (
              <div key={f.key} className="flex justify-between mb-2">
                <span className="text-gray-400 dark:text-gray-500 text-sm">{f.label}</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{fields[f.key]}</span>
              </div>
            ))}
            <div className="flex justify-between mt-2">
              <span className="text-gray-400 dark:text-gray-500 text-sm">Amount</span>
              <span className="text-xl font-bold text-gray-900 dark:text-white">₹{Number(amount).toLocaleString("en-IN")}</span>
            </div>
          </div>
          <button onClick={() => setStep("pin")} className="w-full py-4 rounded-2xl bg-[#1e3058] dark:bg-green-500 text-white font-bold active:scale-95 transition-all shadow-lg">
            Pay ₹{Number(amount).toLocaleString("en-IN")}
          </button>
        </div>
      )}

      {step === "pin" && (
        <PinModal onSuccess={handlePinSuccess} onClose={() => setStep("confirm")} recipientName={provider} amount={amount} />
      )}
    </div>
  );
}
