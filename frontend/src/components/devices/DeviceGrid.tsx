import { motion } from 'framer-motion';
import type { DeviceDto, RoomSummaryDto } from '../../services/types';
import { timeAgo } from '../../lib/format';
import { Panel } from '../shared/Panel';

function DeviceChip({ device, onToggle }: { device: DeviceDto; onToggle: (d: DeviceDto) => void }) {
  const on = device.status === 'ON';
  const icon = device.type === 'FAN' ? '🌀' : '💡';
  return (
    <motion.button
      layout
      onClick={() => onToggle(device)}
      title="Click to toggle (dev)"
      className={`flex items-center justify-between rounded-xl border px-3 py-2 text-left transition-colors ${
        on
          ? 'border-good/50 bg-good/10 hover:bg-good/15'
          : 'border-edge bg-panelSoft hover:bg-panelSoft/70'
      }`}
    >
      <div className="flex items-center gap-2">
        <span className={on && device.type === 'FAN' ? 'inline-block fan-blades-on' : ''}>
          {icon}
        </span>
        <div>
          <div className="text-sm font-medium text-slate-100">{device.name}</div>
          <div className="text-[11px] text-slate-500">{timeAgo(device.lastChangedAt)}</div>
        </div>
      </div>
      <div className="text-right">
        <div className={`text-xs font-semibold ${on ? 'text-good' : 'text-slate-500'}`}>
          {device.status}
        </div>
        <div className="text-[11px] text-slate-400 tabular-nums">{device.currentWatts} W</div>
      </div>
    </motion.button>
  );
}

export function DeviceGrid({
  rooms,
  onToggle,
}: {
  rooms: RoomSummaryDto[];
  onToggle: (d: DeviceDto) => void;
}) {
  return (
    <Panel title="Device Status — by room">
      <div className="grid gap-5 md:grid-cols-3">
        {rooms.map((room) => (
          <div key={room.id}>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-200">{room.name}</h3>
              <span className="text-xs text-slate-400 tabular-nums">
                {room.activeDeviceCount}/{room.deviceCount} · {room.watts}W
              </span>
            </div>
            <div className="grid gap-2">
              {room.devices.map((d) => (
                <DeviceChip key={d.id} device={d} onToggle={onToggle} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
