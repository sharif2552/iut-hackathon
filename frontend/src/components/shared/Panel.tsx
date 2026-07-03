import type { ReactNode } from 'react';

export function Panel({
  title,
  right,
  children,
  className = '',
}: {
  title?: string;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-edge bg-panel/80 backdrop-blur-sm shadow-lg ${className}`}
    >
      {title && (
        <header className="flex items-center justify-between px-5 py-3 border-b border-edge/70">
          <h2 className="text-sm font-semibold tracking-wide text-slate-200 uppercase">
            {title}
          </h2>
          {right}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}
