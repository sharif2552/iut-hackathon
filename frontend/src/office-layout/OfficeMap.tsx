import { useState } from 'react';
import type { DeviceDto, RoomSummaryDto } from '../services/types';
import { clockTime } from '../lib/format';
import { Panel } from '../components/shared/Panel';
import { RoomVisual } from './RoomVisual';

export function OfficeMap({
  rooms,
  onToggle,
}: {
  rooms: RoomSummaryDto[];
  onToggle: (d: DeviceDto) => void;
}) {
  const [selected, setSelected] = useState<DeviceDto | null>(null);

  return (
    <Panel
      title="Office Map — top view"
      right={
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">💡 light</span>
          <span className="flex items-center gap-1">🌀 fan</span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-crit" /> alert
          </span>
        </div>
      }
    >
      <div className="grid gap-3 md:grid-cols-3">
        {rooms.map((room) => (
          <RoomVisual key={room.id} room={room} onDeviceClick={setSelected} />
        ))}
      </div>

      {selected && (
        <div className="mt-4 flex items-center justify-between rounded-xl border border-edge bg-panelSoft px-4 py-3">
          <div>
            <div className="text-sm font-semibold text-slate-100">
              {selected.roomName} · {selected.name}
            </div>
            <div className="text-xs text-slate-400">
              {selected.type} · {selected.status} · {selected.currentWatts}W · nominal{' '}
              {selected.nominalWattage}W · changed {clockTime(selected.lastChangedAt)}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onToggle(selected)}
              className="rounded-lg border border-accent/50 bg-accent/10 px-3 py-1.5 text-sm text-accent hover:bg-accent/20"
            >
              Toggle
            </button>
            <button
              onClick={() => setSelected(null)}
              className="rounded-lg border border-edge px-3 py-1.5 text-sm text-slate-400 hover:text-slate-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </Panel>
  );
}
