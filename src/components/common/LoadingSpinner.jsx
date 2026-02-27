export default function LoadingSpinner({ size = 'md', fullScreen = false, text = '' }) {
  const sizes = { sm: 20, md: 36, lg: 56 };
  const s = sizes[size] || 36;

  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <svg width={s} height={s} viewBox="0 0 40 40">
        {Array.from({ length: 12 }).map((_, i) => (
          <rect
            key={i}
            x="18" y="2" width="4" height="10" rx="2"
            fill="#c9a227"
            opacity={1 - (i * 0.07)}
            transform={`rotate(${i * 30}, 20, 20)`}
            style={{ animation: `spin-steps 1s steps(12, end) ${-(i / 12)}s infinite` }}
          />
        ))}
      </svg>
      {text && <p className="text-sm text-gray-500 dark:text-slate-400">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-brand-bg dark:bg-slate-950 z-50">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      {spinner}
    </div>
  );
}
