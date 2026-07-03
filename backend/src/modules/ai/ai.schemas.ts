import { z } from 'zod';

export const roomFactSchema = z.object({
  name: z.string(),
  watts: z.number(),
  fansOn: z.number(),
  fansTotal: z.number(),
  lightsOn: z.number(),
  lightsTotal: z.number(),
});

export const statusFactsSchema = z.object({
  kind: z.literal('status'),
  officeWatts: z.number(),
  todayKwh: z.number(),
  activeDevices: z.number(),
  totalDevices: z.number(),
  activeAlertCount: z.number(),
  rooms: z.array(roomFactSchema),
  topAlerts: z.array(z.string()),
});

export const roomMessageFactsSchema = z.object({
  kind: z.literal('room'),
  name: z.string(),
  watts: z.number(),
  fansOn: z.number(),
  fansTotal: z.number(),
  lightsOn: z.number(),
  lightsTotal: z.number(),
  devices: z.array(z.object({ name: z.string(), status: z.string(), watts: z.number() })),
  alerts: z.array(z.string()),
});

export const usageFactsSchema = z.object({
  kind: z.literal('usage'),
  officeWatts: z.number(),
  todayKwh: z.number(),
  activeDevices: z.number(),
  totalDevices: z.number(),
  highestRoom: z.object({ name: z.string(), watts: z.number() }).nullable(),
});

export const alertFactsSchema = z.object({
  kind: z.literal('alert'),
  message: z.string(),
  severity: z.string(),
  roomName: z.string().nullable(),
  createdAt: z.string(),
});

export type StatusFacts = z.infer<typeof statusFactsSchema>;
export type RoomFacts = z.infer<typeof roomMessageFactsSchema>;
export type UsageFacts = z.infer<typeof usageFactsSchema>;
export type AlertFacts = z.infer<typeof alertFactsSchema>;

/** Groq must return exactly this shape. */
export const groqOutputSchema = z.object({
  message: z.string().min(1).max(1200),
});

export const MAX_MESSAGE_LENGTH = 1200;
