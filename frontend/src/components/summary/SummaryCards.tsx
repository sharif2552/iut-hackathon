import { motion } from 'framer-motion';
import type { OfficeSummaryDto } from '../../services/types';
import type { ConnectionStatus } from '../../hooks/useOfficeMonitor';

function Card({
  label,
  value,
  sub,
  accent = 'text-slate-100',
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <motion.div
      layout
      className="rounded-2xl border border-edge bg-panel/80 p-5 shadow-lg"
    >
      <div className="text-xs uppercase tracking-wide text-slate-400">{label}</div>
      <div className={`mt-2 text-3xl font-bold tabular-nums ${accent}`}>{value}</div>
      {sub && <div className="mt-1 text-xs text-slate-500">{sub}</div>}
    </motion.div>
  );
}

export function SummaryCards({
  summary,
  connection,
}: {
  summary: OfficeSummaryDto;
  connection: ConnectionStatus;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
      <Card
        label="Current Power"
        value={`${summary.officeWatts} W`}
        sub="Live office draw"
        accent="text-accent"
      />
      <Card
        label="Energy Today"
        value={`${summary.todayKwh.toFixed(2)} kWh`}
        sub="Accumulated from watts"
        accent="text-good"
      />
      <Card
        label="Active Devices"
        value={`${summary.activeDevices} / ${summary.totalDevices}`}
        sub={`${summary.totalRooms} rooms`}
      />
      <Card
        label="Active Alerts"
        value={`${summary.activeAlertCount}`}
        sub={summary.activeAlertCount === 0 ? 'All clear' : 'Needs attention'}
        accent={summary.activeAlertCount > 0 ? 'text-crit' : 'text-good'}
      />
      <Card
        label="Connection"
        value={connection === 'connected' ? 'Live' : 'Syncing'}
        sub={connection === 'connected' ? 'Realtime socket' : connection}
        accent={connection === 'connected' ? 'text-good' : 'text-warn'}
      />
    </div>
  );
}
