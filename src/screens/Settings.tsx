import { useState } from "react";
import {
  ArrowLeft, Lock, Fingerprint, EyeOff, Moon, Sun, Monitor, Globe,
  Bell, Volume2, Vibrate, Shield, ChevronRight, Check, Phone, AtSign, Info, HelpCircle
} from "lucide-react";
import { useApp } from "../context";

interface ToggleProps {
  value: boolean;
  onChange: (v: boolean) => void;
}

function Toggle({ value, onChange }: ToggleProps) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`w-12 h-7 rounded-full relative transition-all duration-200 ${value ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"}`}
    >
      <div className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-all duration-200 ${value ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );
}

type Section = "main" | "personal" | "security" | "notifications" | "appearance" | "language" | "help" | "about" | "upi" | "bank";

export default function Settings() {
  const { goBack, state, dispatch } = useApp();
  const { settings, darkMode } = state;
  const [section, setSection] = useState<Section>("main");

  function update(key: string, value: unknown) {
    dispatch({ type: "UPDATE_SETTINGS", settings: { [key]: value } as any });
  }

  if (section === "personal") {
    return (
      <div className="h-full flex flex-col bg-white dark:bg-gray-900 screen-enter">
        <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800">
          <button onClick={() => setSection("main")} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-90 transition-all">
            <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
          <span className="font-semibold text-gray-800 dark:text-gray-100">Personal Details</span>
        </div>
        <div className="flex-1 px-5 pt-6 space-y-4">
          {[
            { label: "Full Name", value: "Harish Patil" },
            { label: "Mobile Number", value: "+91 98765 43210" },
            { label: "Email", value: "harish.patil@email.com" },
            { label: "PAN Number", value: "ABCDE1234F" },
            { label: "Date of Birth", value: "15 March 1992" },
          ].map((f) => (
            <div key={f.label} className="border-b border-gray-100 dark:border-gray-800 pb-4">
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">{f.label}</p>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{f.value}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (section === "security") {
    return (
      <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-950 screen-enter">
        <div className="flex items-center gap-3 px-5 pt-5 pb-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
          <button onClick={() => setSection("main")} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-90 transition-all">
            <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
          <span className="font-semibold text-gray-800 dark:text-gray-100">Security</span>
        </div>
        <div className="flex-1 overflow-y-auto px-5 pt-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm">
            {[
              { key: "appLock", label: "App Lock", desc: "Require PIN to open app", icon: <Lock size={18} /> },
              { key: "biometric", label: "Biometric Auth", desc: "Use fingerprint or face ID", icon: <Fingerprint size={18} /> },
              { key: "hideBalance", label: "Hide Balance", desc: "Hide amount on home screen", icon: <EyeOff size={18} /> },
            ].map((item, i, arr) => (
              <div key={item.key} className={`flex items-center gap-4 px-4 py-4 ${i < arr.length - 1 ? "border-b border-gray-50 dark:border-gray-800" : ""}`}>
                <div className="w-10 h-10 rounded-2xl bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 flex items-center justify-center">{item.icon}</div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{item.label}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{item.desc}</p>
                </div>
                <Toggle value={(settings as any)[item.key]} onChange={(v) => update(item.key, v)} />
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-4 text-center">Demo UPI PIN: 1234</p>
        </div>
      </div>
    );
  }

  if (section === "upi") {
    return (
      <div className="h-full flex flex-col bg-white dark:bg-gray-900 screen-enter">
        <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800">
          <button onClick={() => setSection("main")} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-90 transition-all">
            <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
          <span className="font-semibold text-gray-800 dark:text-gray-100">UPI Settings</span>
        </div>
        <div className="flex-1 px-5 pt-6">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-3">YOUR UPI IDs</p>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#1e3058] flex items-center justify-center">
                <AtSign size={18} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-100">harish@harpay</p>
                <p className="text-xs text-green-500">Primary • Active</p>
              </div>
              <div className="ml-auto">
                <Check size={18} className="text-green-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (section === "bank") {
    return (
      <div className="h-full flex flex-col bg-white dark:bg-gray-900 screen-enter">
        <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800">
          <button onClick={() => setSection("main")} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-90 transition-all">
            <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
          <span className="font-semibold text-gray-800 dark:text-gray-100">Bank Accounts</span>
        </div>
        <div className="flex-1 px-5 pt-6">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-3">LINKED ACCOUNTS</p>
          {[
            { bank: "HDFC Bank", acc: "XXXX XXXX 4521", type: "Savings", primary: true },
            { bank: "ICICI Bank", acc: "XXXX XXXX 8832", type: "Savings", primary: false },
          ].map((acc) => (
            <div key={acc.acc} className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl mb-3">
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-700 flex items-center justify-center shadow-sm">
                <span className="text-xs font-bold text-[#1e3058] dark:text-green-400">{acc.bank.split(" ")[0].slice(0,3)}</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800 dark:text-gray-100">{acc.bank}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">{acc.acc} • {acc.type}</p>
              </div>
              {acc.primary && <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400 rounded-full">Primary</span>}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (section === "help") {
    return (
      <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-950 screen-enter">
        <div className="flex items-center gap-3 px-5 pt-5 pb-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
          <button onClick={() => setSection("main")} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-90 transition-all">
            <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
          <span className="font-semibold text-gray-800 dark:text-gray-100">Help & Support</span>
        </div>
        <div className="flex-1 px-5 pt-6">
          {["How to send money?", "How to pay using QR?", "What is UPI?", "How to add bank account?", "How to raise a dispute?", "Contact Support"].map((q) => (
            <button key={q} className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-xl mb-2 text-left active:scale-95 transition-all">
              <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{q}</span>
              <ChevronRight size={16} className="text-gray-400" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (section === "about") {
    return (
      <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-950 screen-enter">
        <div className="flex items-center gap-3 px-5 pt-5 pb-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
          <button onClick={() => setSection("main")} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-90 transition-all">
            <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
          <span className="font-semibold text-gray-800 dark:text-gray-100">About Harpay</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-5 text-center gap-4">
          <div className="w-20 h-20 rounded-3xl bg-[#1e3058] flex items-center justify-center">
            <span className="text-3xl font-bold text-white">H</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Harpay</h2>
            <p className="text-gray-400 dark:text-gray-500 text-sm">Payments made simple</p>
            <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">Version 1.0.0</p>
          </div>
          <div className="flex gap-4">
            {["Terms of Service", "Privacy Policy"].map((t) => (
              <button key={t} className="text-xs text-[#1e3058] dark:text-green-400 font-medium active:opacity-60">{t}</button>
            ))}
          </div>
          <p className="text-xs text-gray-300 dark:text-gray-600">© 2026 Harpay. All rights reserved.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-950 screen-enter">
      <div className="flex items-center gap-3 px-5 pt-5 pb-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <button onClick={goBack} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-90 transition-all">
          <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
        </button>
        <span className="font-semibold text-gray-800 dark:text-gray-100">Settings</span>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {[
          {
            title: "Account",
            items: [
              { icon: <Phone size={18} />, label: "Personal Details", sub: "Name, contact info", color: "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400", action: () => setSection("personal") },
              { icon: <AtSign size={18} />, label: "UPI Settings", sub: "Manage UPI IDs", color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400", action: () => setSection("upi") },
              { icon: <Shield size={18} />, label: "Bank Accounts", sub: "Linked accounts", color: "bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400", action: () => setSection("bank") },
            ],
          },
          {
            title: "Security",
            items: [
              { icon: <Lock size={18} />, label: "Security Settings", sub: "PIN, biometric, lock", color: "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400", action: () => setSection("security") },
            ],
          },
          {
            title: "Notifications",
            items: [
              { key: "paymentNotifications", icon: <Bell size={18} />, label: "Payment Alerts", sub: "Payment success & failure", color: "bg-yellow-100 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-400" },
              { key: "promoNotifications", icon: <Bell size={18} />, label: "Promotional", sub: "Offers & discounts", color: "bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400" },
              { key: "sound", icon: <Volume2 size={18} />, label: "Sound", sub: "Transaction sounds", color: "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400" },
              { key: "vibration", icon: <Vibrate size={18} />, label: "Vibration", sub: "Haptic feedback", color: "bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400" },
            ],
          },
          {
            title: "Appearance",
            items: [
              { icon: darkMode ? <Sun size={18} /> : <Moon size={18} />, label: "Dark Mode", sub: darkMode ? "Currently: Dark" : "Currently: Light", color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
                toggle: { value: darkMode, onChange: (v: boolean) => dispatch({ type: "SET_DARK_MODE", value: v }) } },
            ],
          },
          {
            title: "Support",
            items: [
              { icon: <HelpCircle size={18} />, label: "Help Center", color: "bg-teal-100 text-teal-600 dark:bg-teal-950 dark:text-teal-400", action: () => setSection("help") },
              { icon: <Info size={18} />, label: "About Harpay", color: "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400", action: () => setSection("about") },
            ],
          },
        ].map((section, si) => (
          <div key={si} className="mb-4">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-2 mt-2">{section.title.toUpperCase()}</p>
            <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm">
              {section.items.map((item: any, ii, arr) => (
                <div
                  key={ii}
                  className={`flex items-center gap-4 px-4 py-4 ${ii < arr.length - 1 ? "border-b border-gray-50 dark:border-gray-800" : ""} ${item.action ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-700" : ""} transition-colors`}
                  onClick={item.action}
                >
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${item.color}`}>{item.icon}</div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{item.label}</p>
                    {item.sub && <p className="text-xs text-gray-400 dark:text-gray-500">{item.sub}</p>}
                  </div>
                  {item.toggle ? (
                    <Toggle value={item.toggle.value} onChange={item.toggle.onChange} />
                  ) : item.key ? (
                    <Toggle value={(settings as any)[item.key]} onChange={(v) => update(item.key, v)} />
                  ) : (
                    <ChevronRight size={16} className="text-gray-300 dark:text-gray-600" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
