import {
  ArrowLeft, ChevronRight, User, QrCode, Settings, CreditCard, Building2,
  List, Shield, Bell, HelpCircle, Info, LogOut, Phone, AtSign
} from "lucide-react";
import Logo from "../components/Logo";
import { useApp } from "../context";
import { Screen } from "../types";

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  desc?: string;
  screen?: Screen;
  action?: () => void;
  danger?: boolean;
  color?: string;
}

export default function Profile() {
  const { goBack, navigate, dispatch, state } = useApp();
  const user = state.user ?? { name: "User", phone: "+91 00000 00000", upiId: "user@harpay" };
  const initials = user.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "U";

  const menuSections: { title: string; items: MenuItem[] }[] = [
    {
      title: "Account",
      items: [
        { icon: <User size={18} />, label: "Personal Details", desc: "Name, DOB, PAN", screen: "personal-details", color: "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400" },
        { icon: <QrCode size={18} />, label: "My QR Code", desc: "Your payment QR", screen: "my-qr", color: "bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400" },
        { icon: <AtSign size={18} />, label: "UPI Settings", desc: "Manage UPI IDs", screen: "upi-settings", color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400" },
        { icon: <Building2 size={18} />, label: "Bank Accounts", desc: "Linked accounts", screen: "bank-accounts", color: "bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400" },
      ],
    },
    {
      title: "Activity",
      items: [
        { icon: <List size={18} />, label: "Transaction History", desc: "All transactions", screen: "transactions", color: "bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400" },
      ],
    },
    {
      title: "Security & Privacy",
      items: [
        { icon: <Shield size={18} />, label: "Security", desc: "PIN, biometric, lock", screen: "security", color: "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400" },
      ],
    },
    {
      title: "Preferences",
      items: [
        { icon: <Bell size={18} />, label: "Notifications", desc: "Alert preferences", screen: "settings", color: "bg-yellow-100 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-400" },
        { icon: <Settings size={18} />, label: "Settings", desc: "App settings", screen: "settings", color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
      ],
    },
    {
      title: "Support",
      items: [
        { icon: <HelpCircle size={18} />, label: "Help & Support", desc: "FAQs, contact us", screen: "help", color: "bg-teal-100 text-teal-600 dark:bg-teal-950 dark:text-teal-400" },
        { icon: <Info size={18} />, label: "About Harpay", desc: "Version, terms, privacy", screen: "about", color: "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400" },
      ],
    },
    {
      title: "",
      items: [
        {
          icon: <LogOut size={18} />, label: "Logout", danger: true,
          action: () => { dispatch({ type: "LOGOUT" }); navigate("home"); },
          color: "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400",
        },
      ],
    },
  ];

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-950 screen-enter">
      <div className="flex items-center gap-3 px-5 pt-5 pb-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <button onClick={goBack} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-90 transition-all">
          <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
        </button>
        <span className="font-semibold text-gray-800 dark:text-gray-100">Profile</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="bg-gradient-to-br from-[#1e3058] to-[#2d4a7a] px-5 py-6 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center text-xl font-bold text-white shadow-lg">
            {initials}
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{user.name}</h2>
            <p className="text-white/70 text-sm flex items-center gap-1.5 mt-0.5">
              <Phone size={12} /> {user.phone ? `+91 ${user.phone.slice(0, 5)} ${user.phone.slice(5)}` : "+91 00000 00000"}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-white/60 text-xs">{user.upiId}</span>
              <span className="text-[10px] px-1.5 py-0.5 bg-green-500/20 text-green-300 rounded-full">Active</span>
            </div>
          </div>
        </div>

        <div className="px-5 py-4">
          {menuSections.map((section, si) => (
            <div key={si} className="mb-4">
              {section.title && <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-2 mt-2">{section.title.toUpperCase()}</p>}
              <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm">
                {section.items.map((item, ii) => (
                  <button
                    key={ii}
                    onClick={() => { if (item.action) item.action(); else if (item.screen) navigate(item.screen); }}
                    className={`w-full flex items-center gap-4 px-4 py-4 text-left transition-colors ${
                      ii < section.items.length - 1 ? "border-b border-gray-50 dark:border-gray-800" : ""
                    } hover:bg-gray-50 dark:hover:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-700`}
                  >
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${item.color}`}>
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-semibold ${item.danger ? "text-red-500 dark:text-red-400" : "text-gray-800 dark:text-gray-100"}`}>{item.label}</p>
                      {item.desc && <p className="text-xs text-gray-400 dark:text-gray-500">{item.desc}</p>}
                    </div>
                    <ChevronRight size={16} className="text-gray-300 dark:text-gray-600" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="px-5 pb-8 text-center">
          <Logo size={24} showText />
          <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">Version 1.0.0 • Made with ♥ in India</p>
        </div>
      </div>
    </div>
  );
}
