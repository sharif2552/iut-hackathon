import type { ConnectionStatus as Status } from '../../hooks/useOfficeMonitor';

const meta: Record<Status, { label: string; dot: string; text: string }> = {
  connected: { label: 'Live', dot: 'bg-good', text: 'text-good' },
  connecting: { label: 'Connecting…', dot: 'bg-warn', text: 'text-warn' },
  reconnecting: { label: 'Reconnecting…', dot: 'bg-warn animate-pulse', text: 'text-warn' },
  error: { label: 'Connection error', dot: 'bg-crit', text: 'text-crit' },
};

export function ConnectionStatus({ status }: { status: Status }) {
  const m = meta[status];
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className={`h-2.5 w-2.5 rounded-full ${m.dot}`} />
      <span className={m.text}>{m.label}</span>
    </div>
  );
}
