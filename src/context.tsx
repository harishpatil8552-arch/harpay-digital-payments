import React, { createContext, useContext, useReducer, useEffect, useState, useCallback } from "react";
import { Transaction, Notification, AppSettings, Screen, PendingPayment } from "./types";
import { INITIAL_TRANSACTIONS, INITIAL_NOTIFICATIONS } from "./data";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface AppState {
  isLoggedIn: boolean;
  balance: number;
  transactions: Transaction[];
  notifications: Notification[];
  settings: AppSettings;
  darkMode: boolean;
  selectedTransaction: Transaction | null;
  pendingPayment: PendingPayment | null;
}

type Action =
  | { type: "LOGIN" }
  | { type: "LOGOUT" }
  | { type: "SET_BALANCE"; amount: number }
  | { type: "ADD_TRANSACTION"; tx: Transaction }
  | { type: "ADD_NOTIFICATION"; n: Notification }
  | { type: "MARK_NOTIFICATION_READ"; id: string }
  | { type: "MARK_ALL_READ" }
  | { type: "SET_DARK_MODE"; value: boolean }
  | { type: "UPDATE_SETTINGS"; settings: Partial<AppSettings> }
  | { type: "SELECT_TRANSACTION"; tx: Transaction | null }
  | { type: "SET_PENDING_PAYMENT"; payment: PendingPayment | null }
  | { type: "UPDATE_PENDING_PAYMENT"; update: Partial<PendingPayment> };

const defaultSettings: AppSettings = {
  appLock: false,
  biometric: false,
  hideBalance: false,
  paymentNotifications: true,
  promoNotifications: true,
  sound: true,
  vibration: true,
  language: "English",
};

const STORAGE_KEY = "harpay_state";

function loadState(): Partial<AppState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

function saveState(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      isLoggedIn: state.isLoggedIn,
      balance: state.balance,
      transactions: state.transactions,
      notifications: state.notifications,
      settings: state.settings,
      darkMode: state.darkMode,
    }));
  } catch {}
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "LOGIN": return { ...state, isLoggedIn: true };
    case "LOGOUT": return { ...state, isLoggedIn: false };
    case "SET_BALANCE": return { ...state, balance: action.amount };
    case "ADD_TRANSACTION":
      return { ...state, transactions: [action.tx, ...state.transactions] };
    case "ADD_NOTIFICATION":
      return { ...state, notifications: [action.n, ...state.notifications] };
    case "MARK_NOTIFICATION_READ":
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.id ? { ...n, read: true } : n
        ),
      };
    case "MARK_ALL_READ":
      return {
        ...state,
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
      };
    case "SET_DARK_MODE":
      return { ...state, darkMode: action.value };
    case "UPDATE_SETTINGS":
      return { ...state, settings: { ...state.settings, ...action.settings } };
    case "SELECT_TRANSACTION":
      return { ...state, selectedTransaction: action.tx };
    case "SET_PENDING_PAYMENT":
      return { ...state, pendingPayment: action.payment };
    case "UPDATE_PENDING_PAYMENT":
      if (!state.pendingPayment) return state;
      return { ...state, pendingPayment: { ...state.pendingPayment, ...action.update } };
    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  navigate: (screen: Screen) => void;
  goBack: () => void;
  currentScreen: Screen;
  screenStack: Screen[];
  toasts: Toast[];
  showToast: (message: string, type?: "success" | "error" | "info") => void;
  addTransaction: (tx: Omit<Transaction, "id" | "date">) => Transaction;
  generateTxId: () => string;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const saved = loadState();
  const [state, dispatch] = useReducer(reducer, {
    isLoggedIn: saved.isLoggedIn ?? false,
    balance: saved.balance ?? 25450,
    transactions: saved.transactions ?? INITIAL_TRANSACTIONS,
    notifications: saved.notifications ?? INITIAL_NOTIFICATIONS,
    settings: saved.settings ?? defaultSettings,
    darkMode: saved.darkMode ?? false,
    selectedTransaction: null,
    pendingPayment: null,
  });

  const [screenStack, setScreenStack] = useState<Screen[]>(["home"]);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    if (state.darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [state.darkMode]);

  const navigate = useCallback((screen: Screen) => {
    setScreenStack((prev) => [...prev, screen]);
  }, []);

  const goBack = useCallback(() => {
    setScreenStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }, []);

  const showToast = useCallback((message: string, type: "success" | "error" | "info" = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);

  const generateTxId = useCallback(() => {
    const now = new Date();
    const ymd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
    const rand = Math.floor(Math.random() * 100000).toString().padStart(5, "0");
    return `HPY${ymd}${rand}`;
  }, []);

  const addTransaction = useCallback((txData: Omit<Transaction, "id" | "date">) => {
    const tx: Transaction = {
      ...txData,
      id: generateTxId(),
      date: new Date().toISOString(),
    };
    dispatch({ type: "ADD_TRANSACTION", tx });
    const isSent = txData.type === "sent" || txData.type === "bill" || txData.type === "recharge";
    if (txData.status === "successful") {
      if (isSent) {
        dispatch({ type: "SET_BALANCE", amount: state.balance - txData.amount });
      } else if (txData.type === "received") {
        dispatch({ type: "SET_BALANCE", amount: state.balance + txData.amount });
      }
    }
    const notif = {
      id: Math.random().toString(36).slice(2),
      type: txData.status === "failed" ? ("failed" as const) : txData.type === "received" ? ("received" as const) : ("success" as const),
      title: txData.status === "failed" ? "Payment Failed" : txData.type === "received" ? "Money Received" : "Payment Successful",
      message: txData.type === "received"
        ? `₹${txData.amount.toLocaleString()} received from ${txData.sender}`
        : `₹${txData.amount.toLocaleString()} paid to ${txData.recipient}`,
      date: new Date().toISOString(),
      read: false,
      transactionId: tx.id,
    };
    dispatch({ type: "ADD_NOTIFICATION", n: notif });
    return tx;
  }, [state.balance, generateTxId]);

  const currentScreen = screenStack[screenStack.length - 1];

  return (
    <AppContext.Provider value={{
      state, dispatch, navigate, goBack,
      currentScreen, screenStack,
      toasts, showToast, addTransaction, generateTxId,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
