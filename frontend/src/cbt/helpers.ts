// src/domain/cbt/helpers.ts
import {
  CBT_INTENTS,
  CBTIntent,
  INTENT_LABELS,
  INTENT_ROUTES,
  TECHNIQUES,
  Technique,
} from "./intent";
import {
  COGNITIVE_DISTORTION_KEYS,
  COGNITIVE_DISTORTIONS,
  CognitiveDistortion,
} from "./distortion";

import { compileMessageValidator } from "./schema";

/** Lookups */
export const getIntentLabel = (id: CBTIntent) => INTENT_LABELS[id];
export const nextIntentOf = (id: CBTIntent) => INTENT_ROUTES[id];
export const isTerminalIntent = (id: CBTIntent) => INTENT_ROUTES[id] === null;

/** Normalize a free form string to a categorized technique */
export function normalizeTechnique(raw: string | undefined | null): Technique {
  if (!raw) return TECHNIQUES[0];
  
  const lowered = raw.toLowerCase();
  for (const tech of TECHNIQUES) {
    if(lowered.includes(tech.toLowerCase())){
      return tech;
    }
  }
  
  return TECHNIQUES[0]; 
};

/** Type guards for untrusted input */
export const isCBTIntent = (v: unknown): v is CBTIntent =>
  typeof v === "string" && (CBT_INTENTS as readonly string[]).includes(v);

export const isTechnique = (v: unknown): v is Technique =>
  typeof v === "string" && (TECHNIQUES as readonly string[]).includes(v);

export const isCognitiveDistortion = (v: unknown): v is CognitiveDistortion =>
  typeof v === "string" &&
  (COGNITIVE_DISTORTION_KEYS as readonly string[]).includes(v);

/** Payload types (useful across app) */
export type Role = "user" | "assistant" | "system";

/** Safe read of a distortion description */
export const distortionDescription = (d: CognitiveDistortion) =>
  COGNITIVE_DISTORTIONS[d];

// src/domain/cbt/turns.js (or add to helpers.ts if you compile to JS)
export function appendUserTurn(context: any, text: any, intent: any, opts: any) {
  return [
    ...context,
    {
      role: "user",
      text,
      intent,                       // tag current intent
      timestamp: opts?.timestamp ?? new Date().toISOString(),
      tags: opts?.tags,
    },
  ];
}

export interface ContextItem {
  role: Role;
  text: string;
  intent?: CBTIntent;
  distortion?: CognitiveDistortion;
  timestamp?: string; // ISO 8601
  tags?: string[];
}

export interface MessagePayload {
  message: string;
  effectiveTechnique: Technique;
  context: ContextItem[];
  distortionIdentified?: CognitiveDistortion;
  identifiedIntent: CBTIntent;
  nextIntent: CBTIntent | null;
}

/** Advance the flow using INTENT_ROUTES and append an assistant turn */
export function advancePayload(
  payload: MessagePayload,
  assistantText: string,
  opts?: {
    overrideNext?: CBTIntent | null;
    timestamp?: string;
    tags?: string[];
  }
): MessagePayload {
  const computedNext =
    typeof opts?.overrideNext !== "undefined"
      ? opts.overrideNext
      : nextIntentOf(payload.identifiedIntent);

  const next: MessagePayload = {
    ...payload,
    context: [
      ...payload.context,
      {
        role: "assistant",
        text: assistantText,
        intent: payload.identifiedIntent,
        timestamp: opts?.timestamp ?? new Date().toISOString(),
        tags: opts?.tags,
      },
    ],
    nextIntent: computedNext,
  };

  return next;
}

/**
 * @param {object} payload - outbound payload you sent
 * @param {{ reply: string, identifiedIntent?: string, nextIntent?: string|null, distortionIdentified?: string }} inbound
 * @returns {{ advanced: object, identifiedIntent: string, nextIntent: string|null }}
 */
export function applyInboundAndAdvance(payload, inbound) {
  const safeIdentified = isCBTIntent(inbound.identifiedIntent)
    ? inbound.identifiedIntent
    : payload.identifiedIntent;

  const safeNext =
    typeof inbound.nextIntent === "string" && isCBTIntent(inbound.nextIntent)
      ? inbound.nextIntent
      : inbound.nextIntent === null
      ? null
      : nextIntentOf(safeIdentified);

  const merged = {
    ...payload,
    identifiedIntent: safeIdentified,
    nextIntent: safeNext,
    ...(inbound.distortionIdentified
      ? { distortionIdentified: inbound.distortionIdentified }
      : {}),
  };

  const advanced = advancePayload(merged, inbound.reply || "…");
  return { advanced, identifiedIntent: safeIdentified, nextIntent: safeNext };
}

/** Build a schema-shaped payload */
export function createMessagePayload({
  message,
  effectiveTechnique,
  context,
  identifiedIntent,
  nextIntent,
  distortionIdentified,
}: {
  message: string;
  effectiveTechnique: Technique;
  context: any[];              // ContextItem[] if TS
  identifiedIntent: CBTIntent;
  nextIntent: CBTIntent | null;
  distortionIdentified?: CognitiveDistortion;
}) {
  return {
    message,
    effectiveTechnique,
    context,
    identifiedIntent,
    nextIntent,
    ...(distortionIdentified ? { distortionIdentified } : {}),
  };
}

/** Validate against JSON Schema (AJV) */
export function validateMessagePayload(payload: any) {
  const validate = compileMessageValidator();
  const ok = validate(payload);
  return { ok: !!ok, errors: ok ? undefined : validate.errors };
}