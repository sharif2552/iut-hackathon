import type { DeviceDto } from '../services/types';

export function LightVisual({ device, onClick }: { device: DeviceDto; onClick: () => void }) {
  const on = device.status === 'ON';
  return (
    <button
      onClick={onClick}
      title={`${device.name}: ${device.status} (${device.currentWatts}W)`}
      className="group flex flex-col items-center"
    >
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full text-sm transition-all ${
          on ? 'bg-warn/25 shadow-lightGlow' : 'bg-panelSoft'
        }`}
        style={{ border: on ? '2px solid #fbbf24' : '2px solid #334155' }}
      >
        {on ? '💡' : '○'}
      </span>
      <span className="mt-0.5 text-[9px] text-slate-400">{device.name}</span>
    </button>
  );
}
