// actions.js (or inside helpers.ts if you compile to JS)
import {
  nextIntentOf,
  isCBTIntent,
  createMessagePayload,
  validateMessagePayload,
  advancePayload,
} from "@/domain/cbt";

/**
 * Send one chat turn.
 * @param {string} text - user's input
 * @param {Array} context - current ContextItem[] (JS array)
 * @param {string} identifiedIntent - current CBTIntent (e.g., "I1")
 * @param {string} effectiveTechnique - current Technique (e.g., "Baseline")
 * @returns {Promise<{
 *   ok: boolean,
 *   context?: Array,
 *   identifiedIntent?: string,
 *   nextIntent?: string|null,
 *   reply?: string,
 *   distortionIdentified?: string,
 *   error?: any
 * }>}
 */
export async function handleSendMessage(text, context, identifiedIntent, effectiveTechnique) {
  const trimmed = (text || "").trim();
  if (!trimmed) {
    return { ok: false, error: "Empty message" };
  }

  // 1) append user message (tag with current intent)
  const userTurn = {
    role: "user",
    text: trimmed,
    timestamp: new Date().toISOString(),
    intent: identifiedIntent,
  };
  const ctx1 = [...context, userTurn];

  // 2) build payload (propose next via routes)
  const proposedNext = nextIntentOf(identifiedIntent);
  const payload = createMessagePayload({
    message: trimmed,
    effectiveTechnique,
    context: ctx1,
    identifiedIntent,
    nextIntent: proposedNext,
  });

  // 3) runtime validation against your JSON Schema
  const { ok, errors } = validateMessagePayload(payload);
  if (!ok) {
    return { ok: false, error: errors };
  }

  try {
    // 4) call your backend
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    const reply = data.reply || "…";

    // 5) guard returned intents; fall back to route logic
    const incomingIdentified = isCBTIntent(data.identifiedIntent) ? data.identifiedIntent : identifiedIntent;

    const incomingNext = typeof data.nextIntent === "string" && isCBTIntent(data.nextIntent) ? data.nextIntent : data.nextIntent === null ? null : nextIntentOf(incomingIdentified);

    // 6) use advancePayload to append the assistant turn & set nextIntent
    const payload2 = {
      ...payload,
      identifiedIntent: incomingIdentified,
      nextIntent: incomingNext,
      ...(data.distortionIdentified ? { distortionIdentified: data.distortionIdentified } : {}),
    };

    const advanced = advancePayload(payload2, reply);

    return {
      ok: true,
      context: advanced.context,
      identifiedIntent: incomingIdentified,
      nextIntent: incomingNext,
      reply,
      distortionIdentified: data.distortionIdentified,
    };
  } catch (error) {
    return { ok: false, error };
  }
}