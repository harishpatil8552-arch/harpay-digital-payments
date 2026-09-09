import { Home, QrCode, List, User } from "lucide-react";
import { useApp } from "../context";
import { Screen } from "../types";

const tabs: { id: Screen; label: string; Icon: React.ComponentType<{ size: number; className?: string }> }[] = [
  { id: "home", label: "Home", Icon: Home },
  { id: "scan", label: "Scan", Icon: QrCode },
  { id: "transactions", label: "Payments", Icon: List },
  { id: "profile", label: "Profile", Icon: User },
];

export default function BottomNav() {
  const { currentScreen, navigate, screenStack } = useApp();
  const activeTab = ["home", "scan", "transactions", "profile"].includes(currentScreen)
    ? currentScreen
    : screenStack.find((s) => ["home", "scan", "transactions", "profile"].includes(s)) ?? "home";

  function handleTab(id: Screen) {
    navigate(id);
  }

  return (
    <nav className="flex bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 safe-bottom">
      {tabs.map(({ id, label, Icon }) => {
        const active = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => handleTab(id)}
            className="flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-all active:scale-95"
          >
            {id === "scan" ? (
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center -mt-5 shadow-lg transition-all
                ${active ? "bg-green-500 shadow-green-500/30" : "bg-[#1e3058] shadow-[#1e3058]/30"}`}
              >
                <Icon size={22} className="text-white" />
              </div>
            ) : (
              <Icon size={22} className={active ? "text-[#1e3058] dark:text-green-400" : "text-gray-400 dark:text-gray-500"} />
            )}
            {id !== "scan" && (
              <span className={`text-[10px] font-medium transition-colors ${active ? "text-[#1e3058] dark:text-green-400" : "text-gray-400 dark:text-gray-500"}`}>
                {label}
              </span>
            )}
            {id === "scan" && <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 mt-0.5">{label}</span>}
          </button>
        );
      })}
    </nav>
  );
}
