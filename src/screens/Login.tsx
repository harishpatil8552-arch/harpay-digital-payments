import { useState, useEffect } from "react";
import { ArrowLeft, ChevronRight, RefreshCw, CheckCircle2 } from "lucide-react";
import Logo from "../components/Logo";
import { useApp } from "../context";
import { requestOtp, verifyOtp } from "../api";

type LoginStep = "phone" | "otp" | "success";

const DEMO_OTP = "123456";
const DEMO_PHONE_HINT = "Any 10-digit number";

export default function Login() {
  const { dispatch } = useApp();
  const [step, setStep] = useState<LoginStep>("phone");
  const [phone, setPhone] = useState("");
  const [requestId, setRequestId] = useState("");
  const [otp, setOtp] = useState(["","","","","",""]);
  const [phoneError, setPhoneError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (step === "otp") {
      setCountdown(30);
      setCanResend(false);
      const interval = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) { clearInterval(interval); setCanResend(true); return 0; }
          return c - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step]);

  async function handlePhoneContinue() {
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setPhoneError("Please enter a valid 10-digit mobile number");
      return;
    }
    setPhoneError("");
    setLoading(true);
    try {
      const result = await requestOtp(phone);
      setRequestId(result.requestId);
      setStep("otp");
    } catch (error) {
      setPhoneError(error instanceof Error ? error.message : "Unable to connect to the payment service");
    } finally {
      setLoading(false);
    }
  }

  function handleOtpChange(idx: number, val: string) {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) {
      document.getElementById(`otp-${idx + 1}`)?.focus();
    }
  }

  function handleOtpKey(idx: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      document.getElementById(`otp-${idx - 1}`)?.focus();
    }
  }

  async function handleVerifyOtp() {
    const entered = otp.join("");
    if (entered.length < 6) {
      setOtpError("Please enter the complete 6-digit OTP");
      return;
    }
    if (entered !== DEMO_OTP) {
      setOtpError("Incorrect OTP. Demo OTP is 123456");
      return;
    }
    setOtpError("");
    setLoading(true);
    try {
      const result = await verifyOtp(phone, requestId, entered);
      dispatch({ type: "SET_BALANCE", amount: result.balance });
      setStep("success");
      setTimeout(() => dispatch({ type: "LOGIN", user: { ...result.user, token: result.token } }), 1200);
    } catch (error) {
      setOtpError(error instanceof Error ? error.message : "Unable to verify OTP");
    } finally {
      setLoading(false);
    }
  }

  function resendOtp() {
    setOtp(["","","","","",""]);
    setCanResend(false);
    setCountdown(30);
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(interval); setCanResend(true); return 0; }
        return c - 1;
      });
    }, 1000);
  }

  if (step === "success") {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-white dark:bg-gray-900 screen-enter">
        <CheckCircle2 size={80} className="text-green-500 animate-pop-in mb-4" />
        <p className="text-2xl font-bold text-gray-900 dark:text-white animate-fade-in">Welcome, {phone ? `User ${phone.slice(-4)}` : "User"}!</p>
        <p className="text-gray-400 dark:text-gray-500 animate-fade-in">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      <div className="flex-1 flex flex-col">
        <div className="h-52 bg-gradient-to-br from-[#1e3058] to-[#2d4a7a] flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="absolute rounded-full border border-white/30" style={{
                width: `${(i+1)*80}px`, height: `${(i+1)*80}px`,
                top: "50%", left: "50%",
                transform: "translate(-50%,-50%)",
              }} />
            ))}
          </div>
          <Logo size={52} light showText />
        </div>

        <div className="flex-1 px-6 pt-8">
          {step === "phone" && (
            <div className="animate-fade-in">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Welcome to Harpay</h1>
              <p className="text-gray-400 dark:text-gray-500 text-sm mb-8">Enter your mobile number to continue</p>

              <div className="mb-4">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 block">MOBILE NUMBER</label>
                <div className="flex gap-2">
                  <div className="flex items-center justify-center px-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-medium text-sm">
                    🇮🇳 +91
                  </div>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value.replace(/\D/g, "")); setPhoneError(""); }}
                    placeholder="Enter 10-digit number"
                    className="flex-1 px-4 py-3.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-sm font-medium placeholder-gray-400 focus:outline-none focus:border-[#1e3058] dark:focus:border-green-400 transition-colors"
                    onKeyDown={(e) => e.key === "Enter" && handlePhoneContinue()}
                    autoFocus
                  />
                </div>
                {phoneError && <p className="text-xs text-red-500 mt-2">{phoneError}</p>}
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Demo: {DEMO_PHONE_HINT}</p>
              </div>

              <button
                onClick={handlePhoneContinue}
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-[#1e3058] dark:bg-green-500 text-white font-bold text-base active:scale-95 transition-all shadow-lg shadow-[#1e3058]/20 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <>Continue <ChevronRight size={20} /></>
                )}
              </button>

              <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-6">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          )}

          {step === "otp" && (
            <div className="animate-fade-in">
              <button onClick={() => setStep("phone")} className="flex items-center gap-2 text-gray-400 dark:text-gray-500 mb-6 active:scale-95 transition-transform">
                <ArrowLeft size={18} /> Back
              </button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Verify OTP</h1>
              <p className="text-gray-400 dark:text-gray-500 text-sm mb-8">
                {"We've sent a 6-digit OTP to +91 "}{phone}
              </p>

              <div className="flex gap-3 justify-center mb-4">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="tel"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKey(i, e)}
                    className="w-12 h-14 text-center text-xl font-bold border-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:border-[#1e3058] dark:focus:border-green-400 transition-colors border-gray-200 dark:border-gray-700"
                  />
                ))}
              </div>

              {otpError && <p className="text-center text-xs text-red-500 mb-4">{otpError}</p>}
              <p className="text-center text-xs text-gray-400 dark:text-gray-500 mb-2">Demo OTP: <span className="font-bold text-[#1e3058] dark:text-green-400">123456</span></p>

              <div className="flex justify-center mb-6">
                {canResend ? (
                  <button onClick={resendOtp} className="flex items-center gap-2 text-sm font-semibold text-[#1e3058] dark:text-green-400 active:scale-95 transition-transform">
                    <RefreshCw size={15} /> Resend OTP
                  </button>
                ) : (
                  <span className="text-sm text-gray-400 dark:text-gray-500">Resend OTP in <span className="font-semibold text-gray-700 dark:text-gray-300">{countdown}s</span></span>
                )}
              </div>

              <button
                onClick={handleVerifyOtp}
                disabled={loading || otp.join("").length < 6}
                className="w-full py-4 rounded-2xl bg-[#1e3058] dark:bg-green-500 text-white font-bold text-base active:scale-95 transition-all shadow-lg shadow-[#1e3058]/20 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  "Verify & Login"
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
