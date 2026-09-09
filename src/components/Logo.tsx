interface LogoProps {
  size?: number;
  showText?: boolean;
  light?: boolean;
  className?: string;
}

export default function Logo({ size = 40, showText = true, light = false, className = "" }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="22" fill="url(#grad)" />
        <path d="M25 30 L25 70 M25 50 L50 50 M50 30 L50 70" stroke="white" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M60 50 C60 38 68 30 78 30" stroke="#34d399" strokeWidth="7" strokeLinecap="round"/>
        <path d="M60 50 C60 62 68 70 78 70" stroke="#34d399" strokeWidth="7" strokeLinecap="round"/>
        <circle cx="78" cy="30" r="5" fill="#34d399"/>
        <circle cx="78" cy="70" r="5" fill="#34d399"/>
        <defs>
          <linearGradient id="grad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1e3058"/>
            <stop offset="100%" stopColor="#162644"/>
          </linearGradient>
        </defs>
      </svg>
      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className="font-bold tracking-tight"
            style={{ fontSize: size * 0.44, color: light ? "white" : "#1e3058" }}
          >
            Harpay
          </span>
          {size >= 36 && (
            <span
              className="font-medium tracking-wider"
              style={{ fontSize: size * 0.22, color: light ? "rgba(255,255,255,0.7)" : "#10b981" }}
            >
              Payments made simple
            </span>
          )}
        </div>
      )}
    </div>
  );
}
