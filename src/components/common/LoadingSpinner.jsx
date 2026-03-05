export default function LoadingSpinner({ size = 'md', fullScreen = false, text = '' }) {
  const sizes = { sm: 24, md: 40, lg: 60 };
  const s = sizes[size] || 40;

  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <svg
        width={s}
        height={s}
        viewBox="0 0 40 40"
        style={{ animation: 'ios-spin 1s steps(12, end) infinite' }}
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <rect
            key={i}
            x="18" y="3" width="4" height="11" rx="2"
            fill="#c9a227"
            opacity={Math.max(0.12, (i + 1) / 12)}
            transform={`rotate(${i * 30}, 20, 20)`}
          />
        ))}
      </svg>
      {text && <p className="text-sm text-slate-500 dark:text-slate-400">{text}</p>}
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
