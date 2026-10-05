import { useState } from "react";
import { ArrowLeft, CheckCircle, Search, ChevronRight, Phone, AtSign, Building2 } from "lucide-react";
import NumericKeypad from "../components/NumericKeypad";
import PinModal from "../components/PinModal";
import { ProcessingOverlay, PaymentSuccess } from "../components/PaymentFlow";
import { useApp } from "../context";
import { CONTACTS, UPI_LOOKUP } from "../data";
import { Transaction } from "../types";

type SendStep = "method" | "input" | "amount" | "confirm" | "pin" | "processing" | "success";
type Method = "upi" | "phone" | "contacts";

export default function SendMoney() {
  const { goBack, navigate, addTransaction, showToast } = useApp();
  const [step, setStep] = useState<SendStep>("method");
  const [method, setMethod] = useState<Method>("upi");
  const [input, setInput] = useState("");
  const [recipient, setRecipient] = useState<{ name: string; upiId: string; verified: boolean } | null>(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [inputError, setInputError] = useState("");
  const [transaction, setTransaction] = useState<Transaction | null>(null);

  function handleMethodSelect(m: Method) {
    setMethod(m);
    setStep("input");
    setInput("");
    setRecipient(null);
    setInputError("");
  }

  function lookupUpi(upi: string) {
    const found = UPI_LOOKUP[upi.toLowerCase()];
    if (found) {
      setRecipient({ ...found, upiId: upi.toLowerCase() });
      setInputError("");
      setTimeout(() => setStep("amount"), 300);
    } else {
      setInputError("UPI ID not found. Try: rahul@harpay");
    }
  }

  function lookupPhone(phone: string) {
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setInputError("Enter a valid 10-digit mobile number");
      return;
    }
    const c = CONTACTS.find((c) => c.phone === phone);
    if (c) {
      setRecipient({ name: c.name, upiId: c.upiId, verified: true });
    } else {
      setRecipient({ name: `User (${phone})`, upiId: `${phone}@harpay`, verified: false });
    }
    setInputError("");
    setTimeout(() => setStep("amount"), 300);
  }

  function handleInputSubmit() {
    if (method === "upi") lookupUpi(input);
    else if (method === "phone") lookupPhone(input);
  }

  async function handlePinSuccess() {
    setStep("processing");
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
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

  if (step === "processing") return <ProcessingOverlay recipientName={recipient?.name ?? ""} amount={amount} />;
  if (step === "success" && transaction) return <PaymentSuccess transaction={transaction} onDone={() => navigate("home")} onViewReceipt={() => {}} />;

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 screen-enter">
      <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800">
        <button onClick={step === "method" ? goBack : () => setStep("method")} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-90 transition-all">
          <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
        </button>
        <span className="font-semibold text-gray-800 dark:text-gray-100">Send Money</span>
      </div>

      {step === "method" && (
        <div className="flex-1 px-5 pt-6 animate-fade-in">
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">Choose how to send money</p>

          {[
            { id: "upi" as Method, icon: <AtSign size={22} />, label: "UPI ID", desc: "Send using UPI ID", color: "bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400" },
            { id: "phone" as Method, icon: <Phone size={22} />, label: "Mobile Number", desc: "Send using phone number", color: "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400" },
            { id: "contacts" as Method, icon: <Search size={22} />, label: "Contacts", desc: "Pick from your contacts", color: "bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400" },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => m.id === "contacts" ? navigate("people") : handleMethodSelect(m.id)}
              className="w-full flex items-center gap-4 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 mb-3 active:scale-95 transition-all"
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${m.color}`}>{m.icon}</div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-gray-800 dark:text-gray-100">{m.label}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">{m.desc}</p>
              </div>
              <ChevronRight size={18} className="text-gray-400 dark:text-gray-500" />
            </button>
          ))}

          <div className="mt-6">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-3">RECENT</p>
            <div className="space-y-3">
              {CONTACTS.slice(0, 3).map((c) => (
                <button
                  key={c.id}
                  onClick={() => { setRecipient({ name: c.name, upiId: c.upiId, verified: true }); setStep("amount"); }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-95 transition-all"
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0" style={{ background: c.color }}>
                    {c.initials}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{c.name}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{c.upiId}</p>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 dark:text-gray-600" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === "input" && (
        <div className="flex-1 px-5 pt-6 animate-fade-in">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-2">
            {method === "upi" ? "ENTER UPI ID" : "ENTER MOBILE NUMBER"}
          </p>
          <div className="flex gap-2 mb-2">
            <input
              type={method === "phone" ? "tel" : "text"}
              value={input}
              onChange={(e) => { setInput(e.target.value); setInputError(""); }}
              placeholder={method === "upi" ? "e.g. rahul@harpay" : "e.g. 9876543210"}
              className="flex-1 px-4 py-3.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-[#1e3058] dark:focus:border-green-400 transition-colors"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleInputSubmit()}
            />
            <button
              onClick={handleInputSubmit}
              className="px-4 py-3.5 rounded-xl bg-[#1e3058] dark:bg-green-500 text-white font-semibold active:scale-95 transition-all"
            >
              Go
            </button>
          </div>
          {inputError && <p className="text-xs text-red-500 mb-4">{inputError}</p>}
          <p className="text-xs text-gray-400 dark:text-gray-500">Try: rahul@harpay or 9876543210</p>
        </div>
      )}

      {step === "amount" && recipient && (
        <div className="flex-1 flex flex-col animate-fade-in">
          <div className="px-5 pt-6 flex flex-col items-center mb-6">
            <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-xl font-bold text-purple-600 dark:text-purple-400 mb-3">
              {recipient.name.split(" ").map((w) => w[0]).join("").slice(0,2)}
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white">{recipient.name}</h3>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-xs text-gray-400 dark:text-gray-500">{recipient.upiId}</span>
              {recipient.verified && <CheckCircle size={12} className="text-green-500" />}
            </div>

            <div className="mt-6 w-full max-w-xs">
              <div className="flex items-center gap-3 py-4 px-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-800 focus-within:border-[#1e3058] dark:focus-within:border-green-400 transition-colors mb-4">
                <span className="text-2xl font-bold text-gray-400 dark:text-gray-500">₹</span>
                <span className="text-3xl font-bold text-gray-900 dark:text-white flex-1">{amount || "0"}</span>
              </div>
              <input
                placeholder="Add a note (optional)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none mb-4"
              />
            </div>
          </div>
          <NumericKeypad value={amount} onChange={setAmount} />
          <div className="px-5 mt-4">
            <button
              onClick={() => { if (Number(amount) > 0) setStep("confirm"); else showToast("Enter an amount","error"); }}
              className="w-full py-4 rounded-2xl bg-[#1e3058] dark:bg-green-500 text-white font-bold active:scale-95 transition-all shadow-lg"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {step === "confirm" && recipient && (
        <div className="flex-1 px-5 pt-6 animate-fade-in">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-3xl p-6 mb-6">
            <div className="text-center mb-4">
              <div className="w-14 h-14 rounded-full bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-lg font-bold text-purple-600 dark:text-purple-400 mx-auto mb-2">
                {recipient.name.split(" ").map((w) => w[0]).join("").slice(0,2)}
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white">{recipient.name}</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500">{recipient.upiId}</p>
            </div>
            <div className="border-t border-dashed border-gray-200 dark:border-gray-700 my-4" />
            <div className="space-y-3">
              <div className="flex justify-between"><span className="text-gray-400 dark:text-gray-500 text-sm">Amount</span><span className="text-xl font-bold text-gray-900 dark:text-white">₹{Number(amount).toLocaleString("en-IN")}</span></div>
              {note && <div className="flex justify-between"><span className="text-gray-400 dark:text-gray-500 text-sm">Note</span><span className="text-sm font-medium text-gray-700 dark:text-gray-300">{note}</span></div>}
              <div className="flex justify-between"><span className="text-gray-400 dark:text-gray-500 text-sm">Method</span><span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Harpay UPI</span></div>
            </div>
          </div>
          <button
            onClick={() => setStep("pin")}
            className="w-full py-4 rounded-2xl bg-[#1e3058] dark:bg-green-500 text-white font-bold active:scale-95 transition-all shadow-lg"
          >
            Pay ₹{Number(amount).toLocaleString("en-IN")}
          </button>
        </div>
      )}

      {step === "pin" && recipient && (
        <PinModal onSuccess={handlePinSuccess} onClose={() => setStep("confirm")} recipientName={recipient.name} amount={amount} />
      )}
    </div>
  );
}
