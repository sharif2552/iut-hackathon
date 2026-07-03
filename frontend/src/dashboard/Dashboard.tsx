import { useOfficeMonitor } from '../hooks/useOfficeMonitor';
import { api } from '../services/api';
import type { DeviceDto } from '../services/types';
import { SummaryCards } from '../components/summary/SummaryCards';
import { DeviceGrid } from '../components/devices/DeviceGrid';
import { AlertsPanel } from '../components/alerts/AlertsPanel';
import { RoomPowerChart } from '../components/charts/RoomPowerChart';
import { OfficeMap } from '../office-layout/OfficeMap';
import { ConnectionStatus } from '../components/shared/ConnectionStatus';
import { ScenarioControls } from '../components/shared/ScenarioControls';

export function Dashboard() {
  const { summary, energy, connection } = useOfficeMonitor();

  const toggle = (d: DeviceDto) => {
    api.toggleDevice(d.id).catch(() => undefined);
  };

  if (summary.isLoading || !summary.data) {
    return (
      <div className="flex h-screen items-center justify-center text-slate-400">
        {summary.isError ? (
          <div className="text-center">
            <p className="text-crit">Cannot reach the backend.</p>
            <p className="mt-1 text-sm">
              Start it with <code className="text-accent">npm run dev:backend</code>.
            </p>
          </div>
        ) : (
          'Loading office data…'
        )}
      </div>
    );
  }

  const data = summary.data;
  const recentAlerts = data.activeAlerts; // active shown live; resolved come via /alerts refetch

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            ⚡ Office Energy Monitor
          </h1>
          <p className="text-sm text-slate-400">
            Live control center · updated {new Date(data.generatedAt).toLocaleTimeString()}
          </p>
        </div>
        <ConnectionStatus status={connection} />
      </header>

      <div className="mb-6">
        <ScenarioControls />
      </div>

      <div className="space-y-6">
        <SummaryCards summary={data} connection={connection} />

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <OfficeMap rooms={data.rooms} onToggle={toggle} />
          </div>
          <AlertsPanel active={data.activeAlerts} recent={recentAlerts} />
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <DeviceGrid rooms={data.rooms} onToggle={toggle} />
          </div>
          {energy.data && <RoomPowerChart energy={energy.data} />}
        </div>
      </div>

      <footer className="mt-10 pb-6 text-center text-xs text-slate-600">
        Backend is the single source of truth · {data.totalDevices} devices across{' '}
        {data.totalRooms} rooms · dashboard + Discord bot share the same data.
      </footer>
    </div>
  );
}
