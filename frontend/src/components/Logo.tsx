interface LogoProps {
  size?: "sm" | "md";
}

export default function Logo({ size = "md" }: LogoProps) {
  const dims = size === "sm" ? "h-7 w-7" : "h-9 w-9";
  const text = size === "sm" ? "text-base" : "text-lg";

  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`relative flex ${dims} shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 via-brand-500 to-accent-500 shadow-lg shadow-brand-600/30`}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-[55%] w-[55%] text-white">
          <path d="M8 6.5v11l9-5.5-9-5.5Z" fill="currentColor" />
        </svg>
      </div>
      <span className={`${text} font-semibold tracking-tight text-base-100`}>
        Ask<span className="text-brand-400">Tube</span>
      </span>
    </div>
  );
}
