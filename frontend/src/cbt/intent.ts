/** Canonical CBT intents (Layered CBT flow) */
export const CBT_INTENTS = ["I1", "I2", "I3", "I4", "I5", "I6", "I7"] as const;
export type CBTIntent = typeof CBT_INTENTS[number];

export const INTENT_LABELS: Record<CBTIntent, string> = {
  I1: "Situation Identification",
  I2: "Automatic Thought Identification",
  I3: "Mood Rating",                 // initial rating
  I4: "Evidence For Thought",
  I5: "Evidence Against Thought",
  I6: "Mood Re-Rating",              // ← dedicated step
  I7: "Coping Strategy Recommendation",
};

/** Default linear routing (with re-rate loop I6 → I3) */
export const INTENT_ROUTES: Record<CBTIntent, CBTIntent | null> = {
  I1: "I2",
  I2: "I3",
  I3: "I4",   // after initial rating, proceed to evidence-for
  I4: "I5",
  I5: "I6",   // after evidence against, go to re-rating
  I6: "I7",   // after re-rating, go to coping
  I7: "I1",   // end
};

/** Optional: techniques used in your experiments */
export const TECHNIQUES = [
  "Baseline",
  "Few-Shot",
  "Chain-of-Thought",
  "Persona-Based",
  "Plan-and-Solve",
] as const;
export type Technique = typeof TECHNIQUES[number];