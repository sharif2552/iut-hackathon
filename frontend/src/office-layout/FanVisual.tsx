import type { DeviceDto } from '../services/types';

export function FanVisual({ device, onClick }: { device: DeviceDto; onClick: () => void }) {
  const on = device.status === 'ON';
  return (
    <button
      onClick={onClick}
      title={`${device.name}: ${device.status} (${device.currentWatts}W)`}
      className="group relative flex flex-col items-center"
    >
      <svg width="34" height="34" viewBox="0 0 100 100" aria-hidden>
        <circle
          cx="50"
          cy="50"
          r="46"
          fill={on ? 'rgba(56,189,248,0.12)' : 'rgba(35,48,72,0.5)'}
          stroke={on ? '#38bdf8' : '#334155'}
          strokeWidth="4"
        />
        <g className={on ? 'fan-blades-on' : ''} style={{ transformOrigin: '50px 50px' }}>
          {[0, 90, 180, 270].map((deg) => (
            <ellipse
              key={deg}
              cx="50"
              cy="28"
              rx="9"
              ry="20"
              fill={on ? '#7dd3fc' : '#475569'}
              transform={`rotate(${deg} 50 50)`}
            />
          ))}
          <circle cx="50" cy="50" r="7" fill={on ? '#0ea5e9' : '#64748b'} />
        </g>
      </svg>
      <span className="mt-0.5 text-[9px] text-slate-400">{device.name}</span>
    </button>
  );
}
