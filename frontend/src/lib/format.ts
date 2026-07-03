export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const sec = Math.round(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.round(hr / 24)}d ago`;
}

export function clockTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export const severityColor: Record<string, string> = {
  INFO: 'text-accent',
  WARNING: 'text-warn',
  CRITICAL: 'text-crit',
};

export const severityBg: Record<string, string> = {
  INFO: 'border-accent/40 bg-accent/5',
  WARNING: 'border-warn/40 bg-warn/5',
  CRITICAL: 'border-crit/40 bg-crit/5',
};
