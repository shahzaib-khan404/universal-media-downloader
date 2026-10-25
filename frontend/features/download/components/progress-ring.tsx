interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
}

export function ProgressRing({ progress, size = 200, strokeWidth = 14 }: ProgressRingProps) {
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - Math.min(progress, 100) / 100);

  return (
    <div className="relative inline-flex items-center justify-center p-3">
      {/* Background radial glow */}
      <div className="absolute inset-0 rounded-full bg-[#FF6B00]/15 blur-2xl pointer-events-none" />

      <svg width={size} height={size} className="-rotate-90 relative z-10 drop-shadow-[0_0_20px_rgba(255,107,0,0.4)]">
        <defs>
          <linearGradient id="progressOrangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFA040" />
            <stop offset="50%" stopColor="#FF6B00" />
            <stop offset="100%" stopColor="#E05300" />
          </linearGradient>
        </defs>

        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255, 107, 0, 0.12)"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#progressOrangeGrad)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-300 ease-out"
        />
      </svg>
      {/* Label */}
      <div className="absolute flex flex-col items-center z-20">
        <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight drop-shadow-sm">
          {Math.min(100, Math.round(progress))}%
        </span>
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#FF6B00] mt-0.5 animate-pulse">
          Extracting
        </span>
      </div>
    </div>
  );
}
