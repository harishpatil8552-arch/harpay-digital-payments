import { CheckCircle, XCircle, Info } from "lucide-react";
import { useApp } from "../context";

export default function ToastContainer() {
  const { toasts } = useApp();

  return (
    <div className="fixed top-4 left-0 right-0 z-[100] flex flex-col items-center gap-2 px-4 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="animate-fade-in flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl max-w-sm w-full pointer-events-auto
            bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
        >
          {toast.type === "success" && <CheckCircle size={20} className="text-green-500 shrink-0" />}
          {toast.type === "error" && <XCircle size={20} className="text-red-500 shrink-0" />}
          {toast.type === "info" && <Info size={20} className="text-blue-500 shrink-0" />}
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
