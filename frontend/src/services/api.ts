import type {
  AlertsResponse,
  EnergyResponse,
  OfficeSummaryDto,
  SimulatorState,
} from './types';

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:4000';

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) throw new Error(`Request failed: ${res.status} ${path}`);
  return (await res.json()) as T;
}

async function post<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { method: 'POST' });
  if (!res.ok) throw new Error(`Request failed: ${res.status} ${path}`);
  return (await res.json()) as T;
}

export const api = {
  summary: () => getJson<OfficeSummaryDto>('/api/v1/office/summary'),
  energy: () => getJson<EnergyResponse>('/api/v1/energy'),
  alerts: () => getJson<AlertsResponse>('/api/v1/alerts'),
  startSimulator: () => post<SimulatorState>('/api/v1/dev/simulator/start'),
  stopSimulator: () => post<SimulatorState>('/api/v1/dev/simulator/stop'),
  runScenario: (name: string) => post<SimulatorState>(`/api/v1/dev/scenarios/${name}`),
  toggleDevice: (id: string) => post(`/api/v1/dev/devices/${id}/toggle`),
};
