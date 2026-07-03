import { useMemo, useState, type KeyboardEvent } from 'react';
import type { DeviceDto, DeviceType, RoomSummaryDto } from '../services/types';
import { clockTime } from '../lib/format';
import { Panel } from '../components/shared/Panel';

type RoomLayout = {
  slug: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  labelY: number;
  floorClass: 'drawing' | 'work1' | 'work2';
  fans: Array<{ x: number; y: number }>;
  lights: Array<{ x: number; y: number }>;
};

type RoomModel = {
  layout: RoomLayout;
  room: RoomSummaryDto;
  fans: DeviceDto[];
  lights: DeviceDto[];
  lightRatio: number;
};

const FAN_BLADE_PATH =
  'M3 -7 C19 -35 47 -47 58 -36 C65 -29 59 -19 48 -18 C28 -16 15 -6 7 6 Z';

const ROOM_LAYOUTS: RoomLayout[] = [
  {
    slug: 'drawing-room',
    label: 'DRAWING ROOM',
    x: 64,
    y: 98,
    w: 268,
    h: 342,
    labelY: 224,
    floorClass: 'drawing',
    fans: [
      { x: 206, y: 142 },
      { x: 206, y: 329 },
    ],
    lights: [
      { x: 126, y: 142 },
      { x: 286, y: 142 },
      { x: 206, y: 390 },
    ],
  },
  {
    slug: 'work-room-1',
    label: 'WORK ROOM 1',
    x: 342,
    y: 98,
    w: 260,
    h: 342,
    labelY: 268,
    floorClass: 'work1',
    fans: [
      { x: 472, y: 142 },
      { x: 472, y: 307 },
    ],
    lights: [
      { x: 401, y: 142 },
      { x: 544, y: 142 },
      { x: 472, y: 390 },
    ],
  },
  {
    slug: 'work-room-2',
    label: 'WORK ROOM 2',
    x: 612,
    y: 98,
    w: 248,
    h: 342,
    labelY: 268,
    floorClass: 'work2',
    fans: [
      { x: 736, y: 142 },
      { x: 736, y: 307 },
    ],
    lights: [
      { x: 666, y: 142 },
      { x: 820, y: 142 },
      { x: 736, y: 390 },
    ],
  },
];

const DESKS = [
  { x: 420, y: 236, plant: false },
  { x: 548, y: 236, plant: false },
  { x: 420, y: 356, plant: true },
  { x: 548, y: 356, plant: true },
  { x: 682, y: 236, plant: true },
  { x: 814, y: 236, plant: true },
  { x: 682, y: 356, plant: true },
  { x: 814, y: 356, plant: true },
];

const DOORS = [
  { id: 'drawing-door', x: 278, y: 450, length: 58, angle: -90 },
  { id: 'work1-door', x: 352, y: 450, length: 58, angle: -90 },
  { id: 'work2-door', x: 632, y: 450, length: 58, angle: -90 },
  { id: 'entry-door', x: 500, y: 578, length: 66, angle: -90 },
];

function deviceNumber(device: DeviceDto): number {
  const match = device.name.match(/\d+/);
  return match ? Number(match[0]) : 0;
}

function sortDevices(devices: DeviceDto[]): DeviceDto[] {
  return [...devices].sort(
    (a, b) => deviceNumber(a) - deviceNumber(b) || a.name.localeCompare(b.name),
  );
}

function roomMatchesLayout(room: RoomSummaryDto, layout: RoomLayout): boolean {
  return room.slug === layout.slug || room.id === layout.slug;
}

function getDevices(room: RoomSummaryDto, type: DeviceType): DeviceDto[] {
  return sortDevices(room.devices.filter((device) => device.type === type));
}

function handleSvgKey(event: KeyboardEvent<SVGGElement>, action: () => void): void {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  event.preventDefault();
  action();
}

function Plant({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g className="plant" transform={`translate(${x} ${y}) scale(${scale})`}>
      <circle className="plant-pot" r="10" />
      <ellipse className="leaf leaf-a" cx="-8" cy="-5" rx="8" ry="17" transform="rotate(-35 -8 -5)" />
      <ellipse className="leaf leaf-b" cx="8" cy="-6" rx="8" ry="17" transform="rotate(35 8 -6)" />
      <ellipse className="leaf leaf-c" cx="-7" cy="8" rx="7" ry="15" transform="rotate(-125 -7 8)" />
      <ellipse className="leaf leaf-d" cx="8" cy="7" rx="7" ry="15" transform="rotate(125 8 7)" />
      <ellipse className="leaf leaf-e" cx="0" cy="-12" rx="7" ry="16" />
    </g>
  );
}

function Desk({ x, y, plant = false }: { x: number; y: number; plant?: boolean }) {
  return (
    <g className="desk" transform={`translate(${x} ${y})`}>
      <rect className="chair chair-back" x="-20" y="28" width="40" height="24" rx="5" />
      <rect className="chair-seat" x="-17" y="21" width="34" height="18" rx="4" />
      <rect className="desk-shadow" x="-34" y="-23" width="68" height="52" rx="2" />
      <rect className="desk-top" x="-31" y="-26" width="62" height="48" rx="2" />
      <rect className="desk-edge" x="-31" y="-26" width="62" height="10" rx="2" />
      <rect className="monitor-base" x="-10" y="0" width="20" height="5" rx="1" />
      <rect className="monitor" x="-17" y="-15" width="34" height="20" rx="2" />
      <rect className="keyboard" x="-19" y="9" width="38" height="6" rx="2" />
      {plant && (
        <>
          <circle className="tiny-plant-pot" cx="-22" cy="-12" r="4" />
          <path
            className="tiny-plant-leaf"
            d="M-22 -15 C-31 -21 -24 -28 -19 -18 C-13 -27 -6 -19 -17 -14 Z"
          />
        </>
      )}
    </g>
  );
}

function MapWindow({
  x,
  y,
  width,
  height,
  orientation = 'horizontal',
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  orientation?: 'horizontal' | 'vertical';
}) {
  return (
    <g className="window">
      <rect x={x} y={y} width={width} height={height} rx="1" />
      {orientation === 'horizontal' ? (
        <line x1={x + 8} y1={y + height / 2} x2={x + width - 8} y2={y + height / 2} />
      ) : (
        <line x1={x + width / 2} y1={y + 8} x2={x + width / 2} y2={y + height - 8} />
      )}
    </g>
  );
}

function Door({ x, y, length, angle }: { x: number; y: number; length: number; angle: number }) {
  return (
    <g className="door-control is-open" transform={`translate(${x} ${y})`}>
      <circle className="door-hit" r={Math.max(length, 54)} />
      <g className="door-panel" transform={`rotate(${angle} 0 0)`}>
        <line className="door-leaf" x1="0" y1="0" x2={length} y2="0" />
      </g>
      <circle className="door-hinge" r="3.2" />
    </g>
  );
}

function FanDevice({
  device,
  x,
  y,
  onSelect,
}: {
  device: DeviceDto;
  x: number;
  y: number;
  onSelect: (device: DeviceDto) => void;
}) {
  const on = device.status === 'ON';
  const select = () => onSelect(device);

  return (
    <g
      className={`device fan ${on ? 'is-on' : ''}`}
      role="button"
      tabIndex={0}
      aria-pressed={on}
      aria-label={`${device.roomName} ${device.name}: ${device.status}, ${device.currentWatts} watts`}
      transform={`translate(${x} ${y}) scale(0.68)`}
      onClick={select}
      onKeyDown={(event) => handleSvgKey(event, select)}
    >
      <title>{`${device.roomName} ${device.name}: ${device.status} (${device.currentWatts}W)`}</title>
      <circle className="device-hit" r="46" />
      <line className="fan-stem" x1="0" y1="9" x2="0" y2="36" />
      <g className="fan-motion" aria-hidden="true">
        {on && (
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 0 0"
            to="360 0 0"
            dur="0.68s"
            repeatCount="indefinite"
          />
        )}
        <path className="fan-motion-blade" d={FAN_BLADE_PATH} />
        <path className="fan-motion-blade" d={FAN_BLADE_PATH} transform="rotate(120)" />
        <path className="fan-motion-blade" d={FAN_BLADE_PATH} transform="rotate(240)" />
      </g>
      <g className="fan-rotor">
        {on && (
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 0 0"
            to="360 0 0"
            dur="0.68s"
            repeatCount="indefinite"
          />
        )}
        <path className="fan-blade" d={FAN_BLADE_PATH} />
        <path className="fan-blade" d={FAN_BLADE_PATH} transform="rotate(120)" />
        <path className="fan-blade" d={FAN_BLADE_PATH} transform="rotate(240)" />
      </g>
      <circle className="fan-hub" r="9" />
      <circle className="fan-pin" r="3.5" />
    </g>
  );
}

function LightDevice({
  device,
  x,
  y,
  onSelect,
}: {
  device: DeviceDto;
  x: number;
  y: number;
  onSelect: (device: DeviceDto) => void;
}) {
  const on = device.status === 'ON';
  const select = () => onSelect(device);

  return (
    <g
      className={`device light ${on ? 'is-on' : ''}`}
      role="button"
      tabIndex={0}
      aria-pressed={on}
      aria-label={`${device.roomName} ${device.name}: ${device.status}, ${device.currentWatts} watts`}
      transform={`translate(${x} ${y})`}
      onClick={select}
      onKeyDown={(event) => handleSvgKey(event, select)}
    >
      <title>{`${device.roomName} ${device.name}: ${device.status} (${device.currentWatts}W)`}</title>
      <circle className="device-hit" r="32" />
      <circle className="bulb-aura" r="30" />
      <circle className="bulb-glass" r="13.5" />
      <circle className="bulb-core" r="8.4" />
      <path className="bulb-shine" d="M-4 -7 C-1 -10 4 -10 7 -5" />
    </g>
  );
}

export function OfficeMap({
  rooms,
  onToggle,
}: {
  rooms: RoomSummaryDto[];
  onToggle: (d: DeviceDto) => void;
}) {
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

  const roomModels = useMemo<RoomModel[]>(
    () =>
      ROOM_LAYOUTS.map((layout) => {
        const room = rooms.find((candidate) => roomMatchesLayout(candidate, layout));
        if (!room) return null;

        const lights = getDevices(room, 'LIGHT');
        const fans = getDevices(room, 'FAN');

        return {
          layout,
          room,
          fans,
          lights,
          lightRatio: room.lightsTotal > 0 ? room.lightsOn / room.lightsTotal : 0,
        };
      }).filter((model): model is RoomModel => model !== null),
    [rooms],
  );

  const selected = useMemo(
    () =>
      selectedDeviceId
        ? rooms.flatMap((room) => room.devices).find((device) => device.id === selectedDeviceId) ?? null
        : null,
    [rooms, selectedDeviceId],
  );

  const totalDevices = rooms.reduce((sum, room) => sum + room.deviceCount, 0);

  return (
    <Panel
      title="Office Map — top view"
      right={
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-warn shadow-lightGlow" /> light
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-accent shadow-glow" /> fan
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-crit" /> alert
          </span>
        </div>
      }
    >
      <div className="office-map-scroll">
        <svg
          className="office-map-rich"
          viewBox="0 0 920 660"
          role="img"
          aria-labelledby="officeMapTitle officeMapDescription"
        >
          <title id="officeMapTitle">Office layout top view</title>
          <desc id="officeMapDescription">
            Live top-view office plan with rooms, fans, lights, furniture, doors, windows, and
            alerts.
          </desc>

          <defs>
            {roomModels.map(({ layout }) => (
              <clipPath key={layout.slug} id={`clip-${layout.slug}`}>
                <rect x={layout.x} y={layout.y} width={layout.w} height={layout.h} />
              </clipPath>
            ))}

            <filter id="officePaperShadow" x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow dx="0" dy="18" stdDeviation="18" floodColor="#1f2933" floodOpacity="0.12" />
            </filter>

            <filter id="officeFurnitureShadow" x="-30%" y="-30%" width="160%" height="180%">
              <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#222" floodOpacity="0.22" />
            </filter>

            <filter id="officeBulbGlow" x="-220%" y="-220%" width="540%" height="540%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feColorMatrix
                in="blur"
                type="matrix"
                values="1 0 0 0 1  0 0.88 0 0 0.72  0 0 0.34 0 0.18  0 0 0 0.85 0"
                result="warmBlur"
              />
              <feMerge>
                <feMergeNode in="warmBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <radialGradient id="officeLightPool" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff7a8" stopOpacity="0.74" />
              <stop offset="48%" stopColor="#ffe786" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#ffe08a" stopOpacity="0" />
            </radialGradient>

            <linearGradient id="officeWoodFloor" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#cda979" />
              <stop offset="47%" stopColor="#ddc196" />
              <stop offset="100%" stopColor="#b98f63" />
            </linearGradient>

            <pattern id="officeDrawingTiles" width="34" height="34" patternUnits="userSpaceOnUse">
              <rect width="34" height="34" fill="#e9dfcb" />
              <path d="M34 0H0V34" fill="none" stroke="#cfc4b2" strokeWidth="1" opacity="0.55" />
            </pattern>

            <pattern id="officeWorkTiles" width="34" height="34" patternUnits="userSpaceOnUse">
              <rect width="34" height="34" fill="#dededb" />
              <path d="M34 0H0V34" fill="none" stroke="#c8c8c3" strokeWidth="1" opacity="0.48" />
            </pattern>

            <pattern id="officeCorridorTiles" width="34" height="34" patternUnits="userSpaceOnUse">
              <rect width="34" height="34" fill="#eee1d0" />
              <path d="M34 0H0V34" fill="none" stroke="#d8cab6" strokeWidth="1" opacity="0.55" />
            </pattern>

            <pattern id="officeWoodLines" width="36" height="18" patternUnits="userSpaceOnUse">
              <rect width="36" height="18" fill="url(#officeWoodFloor)" />
              <path d="M0 5H36M0 15H36" stroke="#926d49" strokeWidth="0.8" opacity="0.24" />
            </pattern>
          </defs>

          <rect className="paper" x="18" y="24" width="884" height="618" />
          <text className="map-title" x="462" y="58" textAnchor="middle">
            OFFICE LAYOUT (TOP VIEW)
          </text>
          <text className="map-subtitle" x="462" y="82" textAnchor="middle">
            Live status from {totalDevices} devices across {rooms.length} rooms
          </text>

          <g className="floor-plan">
            <rect className="building-wall" x="54" y="88" width="816" height="500" />

            {roomModels.map(({ layout, lightRatio }) => (
              <rect
                key={layout.slug}
                className={`room-floor room-floor-${layout.floorClass}`}
                data-room={layout.slug}
                x={layout.x}
                y={layout.y}
                width={layout.w}
                height={layout.h}
                style={{
                  filter: `brightness(${0.86 + lightRatio * 0.18}) saturate(${
                    0.86 + lightRatio * 0.14
                  })`,
                }}
              />
            ))}

            <rect className="corridor-floor" x="64" y="450" width="796" height="128" />

            {roomModels.flatMap(({ layout, lights }) =>
              layout.lights.map((position, index) => {
                const device = lights[index];
                if (!device) return null;

                return (
                  <circle
                    key={`spill-${device.id}`}
                    className={`light-spill ${device.status === 'ON' ? 'is-on' : ''}`}
                    cx={position.x}
                    cy={position.y}
                    r="125"
                    clipPath={`url(#clip-${layout.slug})`}
                  />
                );
              }),
            )}

            <g className="furniture">
              <rect className="rug" x="154" y="244" width="104" height="118" rx="2" />
              <rect className="coffee-shadow" x="184" y="252" width="48" height="91" rx="3" />
              <rect className="coffee-table" x="180" y="248" width="50" height="92" rx="3" />
              <rect className="coffee-highlight" x="188" y="257" width="11" height="73" rx="2" />

              <g className="sofa" transform="translate(82 212)">
                <rect className="sofa-shadow" x="-3" y="4" width="54" height="146" rx="10" />
                <rect className="sofa-body" x="0" y="0" width="55" height="144" rx="10" />
                <rect className="sofa-arm" x="-4" y="6" width="10" height="132" rx="6" />
                <rect className="sofa-arm" x="48" y="6" width="10" height="132" rx="6" />
                <rect className="sofa-cushion" x="8" y="9" width="39" height="39" rx="6" />
                <rect className="sofa-cushion" x="8" y="52" width="39" height="39" rx="6" />
                <rect className="sofa-cushion" x="8" y="95" width="39" height="39" rx="6" />
              </g>

              <g className="armchair" transform="translate(101 395) rotate(25)">
                <rect className="chair-soft-shadow" x="-21" y="-19" width="47" height="55" rx="8" />
                <rect className="chair-soft" x="-24" y="-24" width="45" height="52" rx="8" />
                <rect className="chair-soft-seat" x="-14" y="-12" width="28" height="31" rx="5" />
              </g>

              {DESKS.map((desk) => (
                <Desk key={`${desk.x}-${desk.y}`} {...desk} />
              ))}

              <Plant x={90} y={128} scale={0.85} />
              <Plant x={296} y={410} scale={0.88} />
              <Plant x={87} y={518} scale={0.82} />
              <Plant x={806} y={544} scale={0.76} />

              <g className="water-cooler" transform="translate(844 518)">
                <rect className="cooler-shadow" x="-11" y="11" width="25" height="49" rx="3" />
                <rect className="cooler-body" x="-9" y="16" width="20" height="42" rx="3" />
                <rect className="cooler-panel" x="-6" y="24" width="14" height="20" rx="2" />
                <ellipse className="water-bottle" cx="1" cy="7" rx="12" ry="13" />
                <rect className="water-line" x="-8" y="3" width="18" height="4" rx="2" />
              </g>
            </g>

            {roomModels.map(({ layout, lightRatio }) => (
              <rect
                key={`dimmer-${layout.slug}`}
                className="room-dimmer"
                data-room={layout.slug}
                x={layout.x}
                y={layout.y}
                width={layout.w}
                height={layout.h}
                style={{ opacity: Math.max(0.04, 0.36 - lightRatio * 0.32) }}
              />
            ))}

            <rect className="inner-wall" x="332" y="88" width="10" height="362" />
            <rect className="inner-wall" x="602" y="88" width="10" height="362" />
            <rect className="inner-wall" x="54" y="440" width="816" height="10" />
            <rect className="outer-wall-top" x="54" y="88" width="816" height="10" />
            <rect className="outer-wall-left" x="54" y="88" width="10" height="500" />
            <rect className="outer-wall-right" x="860" y="88" width="10" height="500" />
            <rect className="outer-wall-bottom" x="54" y="578" width="816" height="10" />

            <rect className="door-gap" x="216" y="436" width="62" height="18" />
            <rect className="door-gap" x="352" y="436" width="62" height="18" />
            <rect className="door-gap" x="632" y="436" width="62" height="18" />
            <rect className="door-gap" x="500" y="574" width="70" height="18" />

            {DOORS.map((door) => (
              <Door key={door.id} {...door} />
            ))}

            <MapWindow x={128} y={90} width={92} height={8} />
            <MapWindow x={706} y={90} width={86} height={8} />
            <MapWindow x={56} y={167} width={8} height={70} orientation="vertical" />
            <MapWindow x={862} y={244} width={8} height={90} orientation="vertical" />

            {roomModels.map(({ layout, room }) => (
              <g key={`room-label-${layout.slug}`}>
                <text className="room-label" x={layout.x + layout.w / 2} y={layout.labelY} textAnchor="middle">
                  {layout.label}
                </text>
                {room.activeAlertCount > 0 && (
                  <rect
                    className="room-alert-outline"
                    x={layout.x + 16}
                    y={layout.y + 16}
                    width={layout.w - 32}
                    height={layout.h - 32}
                    rx="6"
                  />
                )}
              </g>
            ))}

            <text className="entry-label" x="535" y="635" textAnchor="middle">
              ENTRY
            </text>
            <path className="entry-arrow" d="M535 614 V590" />

            <g className="devices">
              {roomModels.flatMap(({ layout, fans }) =>
                layout.fans.map((position, index) => {
                  const device = fans[index];
                  if (!device) return null;
                  return (
                    <FanDevice
                      key={device.id}
                      device={device}
                      x={position.x}
                      y={position.y}
                      onSelect={(clicked) => setSelectedDeviceId(clicked.id)}
                    />
                  );
                }),
              )}
              {roomModels.flatMap(({ layout, lights }) =>
                layout.lights.map((position, index) => {
                  const device = lights[index];
                  if (!device) return null;
                  return (
                    <LightDevice
                      key={device.id}
                      device={device}
                      x={position.x}
                      y={position.y}
                      onSelect={(clicked) => setSelectedDeviceId(clicked.id)}
                    />
                  );
                }),
              )}
            </g>
          </g>
        </svg>
      </div>

      {selected && (
        <div className="mt-4 flex flex-col gap-3 rounded-lg border border-edge bg-panelSoft/80 px-4 py-3 md:flex-row md:items-center md:justify-between">
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
              onClick={() => setSelectedDeviceId(null)}
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
