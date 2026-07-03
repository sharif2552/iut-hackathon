import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { EnergyResponse } from '../../services/types';
import { clockTime } from '../../lib/format';
import { Panel } from '../shared/Panel';

export function RoomPowerChart({ energy }: { energy: EnergyResponse }) {
  const data = [...energy.samples]
    .reverse()
    .slice(-40)
    .map((s) => ({
      time: clockTime(s.sampledAt),
      Office: s.officeWatts,
      'Drawing Room': s.drawingRoomWatts,
      'Work Room 1': s.workRoom1Watts,
      'Work Room 2': s.workRoom2Watts,
    }));

  return (
    <Panel
      title="Power History"
      right={<span className="text-xs text-slate-400">{energy.officeWatts} W now</span>}
    >
      <div className="mb-4 grid grid-cols-3 gap-2">
        {energy.rooms.map((r) => (
          <div key={r.slug} className="rounded-xl border border-edge bg-panelSoft px-3 py-2">
            <div className="text-[11px] text-slate-400">{r.name}</div>
            <div className="text-lg font-semibold text-accent tabular-nums">{r.watts} W</div>
          </div>
        ))}
      </div>
      <div className="h-56">
        {data.length < 2 ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            Collecting samples… the chart fills in as the simulator ticks.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="office" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#233048" />
              <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 11 }} minTickGap={24} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  background: '#111726',
                  border: '1px solid #233048',
                  borderRadius: 12,
                  color: '#e5edff',
                }}
              />
              <Area
                type="monotone"
                dataKey="Office"
                stroke="#38bdf8"
                fill="url(#office)"
                strokeWidth={2}
              />
              <Area type="monotone" dataKey="Drawing Room" stroke="#34d399" fill="transparent" />
              <Area type="monotone" dataKey="Work Room 1" stroke="#fbbf24" fill="transparent" />
              <Area type="monotone" dataKey="Work Room 2" stroke="#f472b6" fill="transparent" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </Panel>
  );
}
