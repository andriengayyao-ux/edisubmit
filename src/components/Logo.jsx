// EdiSubmit logo (inline SVG, no external image).
// Idea: an assignment sheet with a check mark = "submitted", plus a lightning bolt = "last-minute but done".
// Mirrors public/favicon.svg. Props: size (px), withWordmark, mono (one-colour version for the dark sidebar).

export function LogoMark({ size = 36, mono = false }) {
  const gid = `edi-g-${size}-${mono ? 'm' : 'c'}`;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="EdiSubmit logo" className="shrink-0">
      {!mono && (
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#8B5CF6" /><stop offset="1" stopColor="#6D28D9" />
          </linearGradient>
        </defs>
      )}
      <rect width="64" height="64" rx="15" fill={mono ? 'currentColor' : `url(#${gid})`} />
      <rect x="16" y="13" width="31" height="40" rx="5" fill={mono ? 'var(--c-sidebar)' : '#fff'} />
      <rect x="22" y="21" width="14" height="3.5" rx="1.75" fill={mono ? 'currentColor' : '#C4B5FD'} opacity={mono ? 0.5 : 1} />
      <rect x="22" y="28" width="19" height="3.5" rx="1.75" fill={mono ? 'currentColor' : '#C4B5FD'} opacity={mono ? 0.5 : 1} />
      <path d="M23 42l6 6 12-13" fill="none" stroke={mono ? 'currentColor' : '#7C3AED'} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M47 5L36 22h8l-3 13 14-20h-8z" fill={mono ? 'var(--c-sidebar)' : '#FBBF24'} stroke={mono ? 'currentColor' : '#6D28D9'} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

export default function Logo({ size = 36, withWordmark = true, mono = false, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark size={size} mono={mono} />
      {withWordmark && (
        <span className="text-xl leading-none tracking-tight" style={{ fontSize: Math.max(16, size * 0.55) }}>
          <span className="font-medium">Edi</span><span className="font-extrabold">Submit</span>
        </span>
      )}
    </span>
  );
}
