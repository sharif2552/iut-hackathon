import { AnimatePresence, motion } from 'framer-motion';
import type { AlertDto } from '../../services/types';
import { clockTime, severityBg, severityColor, timeAgo } from '../../lib/format';
import { Panel } from '../shared/Panel';

function AlertRow({ alert, resolved }: { alert: AlertDto; resolved?: boolean }) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className={`rounded-xl border px-3 py-2 ${resolved ? 'border-edge bg-panelSoft/50 opacity-70' : severityBg[alert.severity]}`}
    >
      <div className="flex items-center justify-between">
        <span className={`text-xs font-semibold uppercase ${severityColor[alert.severity]}`}>
          {alert.severity}
        </span>
        <span className="text-[11px] text-slate-500">
          {clockTime(alert.createdAt)} · {timeAgo(alert.createdAt)}
        </span>
      </div>
      <p className="mt-1 text-sm text-slate-200">{alert.message}</p>
    </motion.li>
  );
}

export function AlertsPanel({ active, recent }: { active: AlertDto[]; recent: AlertDto[] }) {
  const resolved = recent.filter((a) => a.status === 'RESOLVED').slice(0, 6);
  return (
    <Panel
      title="Alerts"
      right={
        <span className="text-xs text-slate-400">
          {active.length} active
        </span>
      }
    >
      <div className="space-y-4">
        <div>
          <div className="mb-2 text-xs uppercase tracking-wide text-slate-400">Active</div>
          {active.length === 0 ? (
            <p className="text-sm text-good">No active alerts. Everything looks efficient. ✅</p>
          ) : (
            <ul className="space-y-2">
              <AnimatePresence initial={false}>
                {active.map((a) => (
                  <AlertRow key={a.id} alert={a} />
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>
        {resolved.length > 0 && (
          <div>
            <div className="mb-2 text-xs uppercase tracking-wide text-slate-400">
              Recently resolved
            </div>
            <ul className="space-y-2">
              {resolved.map((a) => (
                <AlertRow key={a.id} alert={a} resolved />
              ))}
            </ul>
          </div>
        )}
      </div>
    </Panel>
  );
}
