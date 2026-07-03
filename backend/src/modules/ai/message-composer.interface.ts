import type { AlertFacts, RoomFacts, StatusFacts, UsageFacts } from './ai.schemas.js';

export type MessageSource = 'groq' | 'template';

export interface ComposedMessage {
  message: string;
  source: MessageSource;
}

/**
 * Turns VERIFIED backend facts into friendly wording. Implementations must
 * never invent numbers, device states, alerts, or predictions — they only
 * rephrase the facts they are given.
 */
export interface MessageComposer {
  composeStatusMessage(facts: StatusFacts): Promise<ComposedMessage>;
  composeRoomMessage(facts: RoomFacts): Promise<ComposedMessage>;
  composeUsageMessage(facts: UsageFacts): Promise<ComposedMessage>;
  composeAlertMessage(facts: AlertFacts): Promise<ComposedMessage>;
}
