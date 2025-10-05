// src/domain/cbt/schema.ts
import Ajv, { ValidateFunction } from "ajv";
import addFormats from "ajv-formats";
import { CBT_INTENTS, TECHNIQUES } from "./intent";
import { COGNITIVE_DISTORTION_KEYS } from "./distortion";

/** JSON Schema for MessagePayload (AJV / JSON Forms ready) */
export const messageSchema = {
  $id: "https://example.com/schemas/messagePayload.json",
  type: "object",
  additionalProperties: false,
  properties: {
    message: { type: "string", title: "User Message" },
    effectiveTechnique: {
      type: "string",
      enum: TECHNIQUES,
      title: "Technique",
    },
    context: {
      type: "array",
      title: "Context",
      minItems: 0,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          role: { type: "string", enum: ["user", "assistant", "system"] },
          text: { type: "string" },
          intent: { type: "string", enum: CBT_INTENTS },
          distortion: { type: "string", enum: COGNITIVE_DISTORTION_KEYS },
          timestamp: { type: "string", format: "date-time" },
          tags: { type: "array", items: { type: "string" } },
        },
        required: ["role", "text"],
      },
    },
    distortionIdentified: {
      type: "string",
      enum: COGNITIVE_DISTORTION_KEYS,
      title: "Cognitive Distortion",
    },
    identifiedIntent: {
      type: "string",
      enum: CBT_INTENTS,
      title: "Identified Intent",
    },
    nextIntent: {
      title: "Next Intent",
      oneOf: [{ type: "string", enum: CBT_INTENTS }, { type: "null" }],
    },
  },
  required: ["message", "effectiveTechnique", "context", "identifiedIntent", "nextIntent"],
} as const;

/** Optional: JSON Forms UISchema for a clean layout */
export const messageUiSchema = {
  type: "VerticalLayout",
  elements: [
    { type: "Control", scope: "#/properties/message" },
    { type: "Control", scope: "#/properties/effectiveTechnique" },
    {
      type: "Group",
      label: "CBT Flow",
      elements: [
        { type: "Control", scope: "#/properties/identifiedIntent" },
        { type: "Control", scope: "#/properties/nextIntent" },
      ],
    },
    { type: "Control", scope: "#/properties/distortionIdentified" },
    { type: "Control", scope: "#/properties/context" },
  ],
} as const;

/** AJV compiler (reuse this to validate payloads at runtime) */
let _validator: ValidateFunction | null = null;

export function compileMessageValidator(): ValidateFunction {
  if (_validator) return _validator;
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  _validator = ajv.compile(messageSchema);
  return _validator;
}