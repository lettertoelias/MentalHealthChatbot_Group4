// backend/src/server.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";

import prompts from "./techniques/prompts.js";
import { CBT_INTENTS } from "./techniques/dictionaries.js";
import { buildPromptMessages } from "./techniques/prompting.js";
import { computeNextIntent } from "./techniques/routes.js";

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN ?? "http://localhost:5173", credentials: true }));
app.use(express.json());

// Health check (optional)
app.get("/health", (_req, res) => res.json({ ok: true }));

// Inbound payload schema (from FE)
const ContextItemSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  text: z.string(),
  intent: z.string().optional(),
  timestamp: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

const PayloadSchema = z.object({
  message: z.string().min(1),
  effectiveTechnique: z.string().min(1),
  context: z.array(ContextItemSchema),               // client-managed context
  identifiedIntent: z.enum([...(CBT_INTENTS)]),
  nextIntent: z.union([z.enum([...(CBT_INTENTS)]), z.null()]),
  distortionIdentified: z.string().optional(),
});

// LLM only needs to return assistant text
const LlmReplySchema = z.object({ reply: z.string() });

const model = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4o-mini",
  temperature: 0.2,
}).withStructuredOutput(LlmReplySchema);

app.post("/api/chat", async (req, res) => {
  try {
    // 1) validate inbound
    const parsed = PayloadSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid payload", details: parsed.error.format() });
    }

    console.log(parsed);
    const {
      message,
      effectiveTechnique,
      context,
      identifiedIntent,
      distortionIdentified,
    } = parsed.data;

    // 2) choose technique text
    const promptTechnique =
      prompts?.[effectiveTechnique] ??
      prompts?.Baseline ??
      "You are a supportive mental health assistant.";

    // 3) build prompt (intent instructions + compact context + user message)
    const messages = await buildPromptMessages({
      promptTechnique,
      intent: identifiedIntent,
      context,
      message,
    });

    // 4) invoke LLM
    const llm = await model.invoke(messages); // { reply }
    const assistantText = llm.reply;

    // 5) compute next intent (server-owned)
    const nextIntent = computeNextIntent(identifiedIntent);

    // 6) return minimal shape (NO context) — client will append via advancePayload(...)
    return res.json({
      reply: assistantText,
      identifiedIntent,          // echo the step just executed
      nextIntent,                // where to go next
      ...(distortionIdentified ? { distortionIdentified } : {}),
    });
  } catch (err) {
    console.error("POST /api/chat error:", err);
    return res.status(500).json({ error: err?.message || "Something went wrong" });
  }
});

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`API running at http://localhost:${port}`));