import { config } from '../shared/config/index.js';
import { logger } from '../shared/logger/index.js';
import type { SimulatorService } from './simulator.service.js';

/**
 * Drives the simulator on a fixed interval. Ticks only fire while the simulator
 * is in the running state, so pause/resume is respected without clearing timers.
 */
export class SimulatorScheduler {
  private timer: NodeJS.Timeout | null = null;

  constructor(private readonly simulator: SimulatorService) {}

  start(): void {
    if (this.timer) return;
    this.timer = setInterval(() => {
      if (!this.simulator.isRunning()) return;
      try {
        this.simulator.tick();
      } catch (err) {
        logger.error({ err }, 'simulator tick failed');
      }
    }, config.SIMULATOR_INTERVAL_MS);
    logger.info({ intervalMs: config.SIMULATOR_INTERVAL_MS }, 'simulator scheduler started');
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
