import { motion } from 'framer-motion';
import type { DeviceDto, RoomSummaryDto } from '../../services/types';
import { timeAgo } from '../../lib/format';
import { Panel } from '../shared/Panel';

const FAN_BLADE_PATH =
  'M3 -7 C19 -35 47 -47 58 -36 C65 -29 59 -19 48 -18 C28 -16 15 -6 7 6 Z';

function FanStatusIcon({ on, spinKey }: { on: boolean; spinKey: string }) {
  return (
    <svg
      className="device-chip-fan-icon"
      viewBox="-46 -46 92 92"
      aria-hidden="true"
      focusable="false"
    >
      <circle className="device-chip-fan-ring" r="38" />
      <line className="device-chip-fan-stem" x1="0" y1="8" x2="0" y2="32" />
      <g
        key={spinKey}
        className={`device-chip-fan-rotor ${on ? 'is-spinning' : ''}`}
      >
        <path className="device-chip-fan-blade" d={FAN_BLADE_PATH} />
        <path className="device-chip-fan-blade" d={FAN_BLADE_PATH} transform="rotate(120)" />
        <path className="device-chip-fan-blade" d={FAN_BLADE_PATH} transform="rotate(240)" />
      </g>
      <circle className="device-chip-fan-hub" r="8" />
      <circle className="device-chip-fan-pin" r="3" />
    </svg>
  );
}

function LightStatusIcon({ on }: { on: boolean }) {
  return (
    <span
      className={`device-chip-light-icon ${on ? 'is-on' : ''}`}
      aria-hidden="true"
    >
      💡
    </span>
  );
}

function DeviceChip({ device, onToggle }: { device: DeviceDto; onToggle: (d: DeviceDto) => void }) {
  const on = device.status === 'ON';
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
        {device.type === 'FAN' ? (
          <FanStatusIcon on={on} spinKey={`${device.status}-${device.lastChangedAt}`} />
        ) : (
          <LightStatusIcon on={on} />
        )}
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
