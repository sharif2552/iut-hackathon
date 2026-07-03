import { useState } from 'react';
import { api } from '../../services/api';

const SCENARIOS = [
  'normal-working-hours',
  'lunch-break',
  'after-hours-waste',
  'room-overactive',
  'high-power-usage',
  'all-off',
];

export function ScenarioControls() {
  const [busy, setBusy] = useState<string | null>(null);
  const [running, setRunning] = useState(true);

  const run = async (fn: () => Promise<unknown>, key: string) => {
    setBusy(key);
    try {
      await fn();
    } catch {
      /* ignore — dashboard keeps working from realtime */
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={() =>
          run(async () => {
            if (running) await api.stopSimulator();
            else await api.startSimulator();
            setRunning(!running);
          }, 'toggle')
        }
        className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
          running
            ? 'border-warn/50 bg-warn/10 text-warn'
            : 'border-good/50 bg-good/10 text-good'
        }`}
      >
        {running ? '⏸ Pause sim' : '▶ Resume sim'}
      </button>
      <span className="text-[11px] text-slate-500">Scenarios:</span>
      {SCENARIOS.map((s) => (
        <button
          key={s}
          disabled={busy !== null}
          onClick={() => run(() => api.runScenario(s), s)}
          className="rounded-lg border border-edge bg-panelSoft px-3 py-1.5 text-xs text-slate-300 hover:border-accent/50 hover:text-accent disabled:opacity-50"
        >
          {busy === s ? '…' : s}
        </button>
      ))}
    </div>
  );
}
