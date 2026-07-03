import { config } from '../config/index.js';

export interface BotMessageResponse {
  message: string;
  source: 'groq' | 'template';
  facts: unknown;
}

export interface AlertItem {
  id: string;
  type: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  roomName: string | null;
  message: string;
  createdAt: string;
}

export interface BotAlertsResponse {
  count: number;
  alerts: AlertItem[];
}

export class BackendUnavailableError extends Error {
  constructor() {
    super('The backend is not reachable. Is `npm run dev:backend` running?');
    this.name = 'BackendUnavailableError';
  }
}

/** HTTP client for the shared local backend. All device facts come from here. */
export class BackendApiClient {
  constructor(private readonly baseUrl = config.backendApiUrl) {}

  private async get<T>(path: string): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const res = await fetch(`${this.baseUrl}${path}`, { signal: controller.signal });
      if (res.status === 404) throw new Error('NOT_FOUND');
      if (!res.ok) throw new Error(`Backend responded ${res.status}`);
      return (await res.json()) as T;
    } catch (err) {
      if (err instanceof Error && err.message === 'NOT_FOUND') throw err;
      throw new BackendUnavailableError();
    } finally {
      clearTimeout(timeout);
    }
  }

  status(): Promise<BotMessageResponse> {
    return this.get('/api/v1/internal/bot/status');
  }

  room(slug: string): Promise<BotMessageResponse> {
    return this.get(`/api/v1/internal/bot/room/${encodeURIComponent(slug)}`);
  }

  usage(): Promise<BotMessageResponse> {
    return this.get('/api/v1/internal/bot/usage');
  }

  alerts(): Promise<BotAlertsResponse> {
    return this.get('/api/v1/internal/bot/alerts');
  }

  health(): Promise<{ status: string }> {
    return this.get('/health');
  }
}
