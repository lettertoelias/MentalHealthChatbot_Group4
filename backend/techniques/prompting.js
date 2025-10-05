// backend/src/cbt/prompting.js
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { INTENT_PROMPTS } from "./dictionaries.js";

/** Turn array-of-turns into a compact context string for the prompt */
export function contextToSummary(ctx = []) {
  if (!Array.isArray(ctx) || ctx.length === 0) return "No context yet.";
  const lines = ctx.map((t) => {
    const who = t.role === "assistant" ? "Assistant" : t.role === "user" ? "User" : "System";
    const intent = t.intent ? ` [${t.intent}]` : "";
    return `${who}${intent}: ${t.text}`;
  });
  return lines.slice(-12).join("\n");
}

/**
 * Build prompt messages composed of:
 * - technique block (Baseline / Few-Shot / etc.)
 * - intent block (I1..I7 task instructions)
 * - compact context summary
 * - user's latest message
 */
export async function buildPromptMessages({ promptTechnique, intent, context, message }) {
  const intentBlock = INTENT_PROMPTS[intent]?.system ?? "";

  const tpl = ChatPromptTemplate.fromMessages([
    [
      "system",
      `
Use this Prompt Technique: {promptTechnique}
${intentBlock}
      `.trim(),
    ],
    ["system", `Conversation context:\n{context}`],
    ["human", `{message}`],
  ]);

  return tpl.formatMessages({
    promptTechnique,
    context: contextToSummary(context),
    message: (message ?? "").trim(),
  });
}