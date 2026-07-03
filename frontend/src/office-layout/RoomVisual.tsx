import type { DeviceDto, RoomSummaryDto } from '../services/types';
import { FanVisual } from './FanVisual';
import { LightVisual } from './LightVisual';

export function RoomVisual({
  room,
  onDeviceClick,
}: {
  room: RoomSummaryDto;
  onDeviceClick: (d: DeviceDto) => void;
}) {
  const fans = room.devices.filter((d) => d.type === 'FAN');
  const lights = room.devices.filter((d) => d.type === 'LIGHT');
  const hasAlert = room.activeAlertCount > 0;

  return (
    <div
      className={`relative flex flex-col rounded-2xl border-2 p-3 transition-colors ${
        hasAlert ? 'border-crit/60 bg-crit/5' : 'border-edge bg-panelSoft/60'
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-100">{room.name}</span>
        <span className={`text-xs tabular-nums ${hasAlert ? 'text-crit' : 'text-slate-400'}`}>
          {room.watts}W {hasAlert ? '⚠️' : ''}
        </span>
      </div>

      {/* Furniture: a desk + chairs to make it feel like a real office */}
      <div className="relative mb-3 h-16 rounded-lg border border-edge/60 bg-base/40">
        <div className="absolute left-1/2 top-1/2 h-6 w-20 -translate-x-1/2 -translate-y-1/2 rounded bg-edge/70" />
        <div className="absolute left-[30%] top-1 h-3 w-3 -translate-x-1/2 rounded-sm bg-slate-600" />
        <div className="absolute left-[70%] top-1 h-3 w-3 -translate-x-1/2 rounded-sm bg-slate-600" />
        <div className="absolute left-[30%] bottom-1 h-3 w-3 -translate-x-1/2 rounded-sm bg-slate-600" />
        <div className="absolute left-[70%] bottom-1 h-3 w-3 -translate-x-1/2 rounded-sm bg-slate-600" />
      </div>

      <div className="flex items-end justify-around gap-1">
        {fans.map((d) => (
          <FanVisual key={d.id} device={d} onClick={() => onDeviceClick(d)} />
        ))}
      </div>
      <div className="mt-2 flex items-end justify-around gap-1">
        {lights.map((d) => (
          <LightVisual key={d.id} device={d} onClick={() => onDeviceClick(d)} />
        ))}
      </div>
    </div>
  );
}
