import { AppProvider, useApp } from "./context";
import BottomNav from "./components/BottomNav";
import ToastContainer from "./components/Toast";
import Login from "./screens/Login";
import Home from "./screens/Home";
import Scan from "./screens/Scan";
import Transactions from "./screens/Transactions";
import Profile from "./screens/Profile";
import Settings from "./screens/Settings";
import SendMoney from "./screens/SendMoney";
import RequestMoney from "./screens/RequestMoney";
import MyQR from "./screens/MyQR";
import BillScreen from "./screens/Bills";
import Recharge from "./screens/Recharge";
import Notifications from "./screens/Notifications";
import Analytics from "./screens/Analytics";
import People from "./screens/People";
import TransactionDetail from "./screens/TransactionDetail";

const MAIN_TABS = ["home", "scan", "transactions", "profile"];

function AppContent() {
  const { state, currentScreen } = useApp();
  const { isLoggedIn } = state;

  if (!isLoggedIn) return <Login />;

  function renderScreen() {
    switch (currentScreen) {
      case "home": return <Home />;
      case "scan": return <Scan />;
      case "transactions": return <Transactions />;
      case "profile": return <Profile />;
      case "settings": return <Settings />;
      case "send-money": return <SendMoney />;
      case "request-money": return <RequestMoney />;
      case "my-qr": return <MyQR />;
      case "recharge": return <Recharge />;
      case "electricity": return <BillScreen billType="electricity" />;
      case "water": return <BillScreen billType="water" />;
      case "dth": return <BillScreen billType="dth" />;
      case "gas": return <BillScreen billType="gas" />;
      case "broadband": return <BillScreen billType="broadband" />;
      case "fastag": return <BillScreen billType="fastag" />;
      case "insurance": return <BillScreen billType="insurance" />;
      case "credit-card": return <BillScreen billType="credit-card" />;
      case "notifications": return <Notifications />;
      case "analytics": return <Analytics />;
      case "people": return <People />;
      case "transaction-detail": return <TransactionDetail />;
      case "personal-details": return <Settings />;
      case "security": return <Settings />;
      case "upi-settings": return <Settings />;
      case "bank-accounts": return <Settings />;
      case "help": return <Settings />;
      case "about": return <Settings />;
      case "payment-notifications": return <Settings />;
      default: return <Home />;
    }
  }

  const showBottomNav = MAIN_TABS.includes(currentScreen) ||
    ["send-money","request-money","my-qr","recharge","electricity","water","dth","gas",
     "broadband","fastag","insurance","credit-card","notifications","analytics","people",
     "settings","transaction-detail","personal-details","security","upi-settings","bank-accounts",
     "help","about"].includes(currentScreen);

  return (
    <div className={`h-full flex flex-col max-w-sm w-full mx-auto bg-white dark:bg-gray-900 shadow-2xl overflow-hidden relative ${state.darkMode ? "dark" : ""}`}>
      <div className="flex-1 overflow-hidden">
        {renderScreen()}
      </div>
      {showBottomNav && <BottomNav />}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <div className="h-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center">
        <AppContent />
        <ToastContainer />
      </div>
    </AppProvider>
  );
}
