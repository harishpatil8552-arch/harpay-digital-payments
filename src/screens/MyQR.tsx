import { ArrowLeft, Share2, Download, Copy, ChevronRight } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import Logo from "../components/Logo";
import { useApp } from "../context";

const USER_UPI = "harish@harpay";
const USER_NAME = "Harish Patil";

export default function MyQR() {
  const { goBack, showToast } = useApp();

  function copyUpi() {
    navigator.clipboard.writeText(USER_UPI).then(() => showToast("UPI ID copied!"));
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-950 screen-enter">
      <div className="flex items-center gap-3 px-5 pt-5 pb-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <button onClick={goBack} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-90 transition-all">
          <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
        </button>
        <span className="font-semibold text-gray-800 dark:text-gray-100">My QR Code</span>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col items-center px-5 py-6">
        <div className="w-full max-w-xs bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-6 flex flex-col items-center">
          <Logo size={40} showText />
          <div className="my-5 w-px h-4 bg-gray-200 dark:bg-gray-700" />

          <div className="p-4 bg-white rounded-2xl shadow-inner border border-gray-100">
            <QRCodeSVG
              value={`upi://pay?pa=${USER_UPI}&pn=${encodeURIComponent(USER_NAME)}&am=&cu=INR`}
              size={200}
              fgColor="#1e3058"
              level="M"
              includeMargin={false}
            />
          </div>

          <div className="mt-4 text-center">
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">{USER_NAME}</h3>
            <button
              onClick={copyUpi}
              className="flex items-center gap-1.5 mt-1.5 px-3 py-1.5 bg-[#1e3058]/8 dark:bg-gray-800 rounded-lg text-[#1e3058] dark:text-green-400 text-sm font-medium active:scale-95 transition-all mx-auto"
            >
              <span>{USER_UPI}</span>
              <Copy size={13} />
            </button>
          </div>

          <div className="mt-4 px-4 py-2 bg-green-50 dark:bg-green-950/30 rounded-xl">
            <p className="text-xs text-green-700 dark:text-green-400 text-center">Scan this QR code to pay me</p>
          </div>
        </div>

        <div className="flex gap-3 mt-6 w-full max-w-xs">
          <button
            onClick={() => showToast("QR shared successfully")}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#1e3058] dark:bg-green-500 text-white font-semibold text-sm active:scale-95 transition-all shadow-lg"
          >
            <Share2 size={16} /> Share QR
          </button>
          <button
            onClick={() => showToast("QR downloaded")}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm active:scale-95 transition-all"
          >
            <Download size={16} /> Download
          </button>
        </div>

        <div className="mt-6 w-full max-w-xs bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-gray-50 dark:border-gray-800">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500">RECEIVE MONEY</p>
          </div>
          <button
            onClick={copyUpi}
            className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-700 transition-colors"
          >
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">UPI ID</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">{USER_UPI}</p>
            </div>
            <div className="flex items-center gap-2">
              <Copy size={16} className="text-gray-400" />
              <ChevronRight size={16} className="text-gray-300 dark:text-gray-600" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
