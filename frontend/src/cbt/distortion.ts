export const COGNITIVE_DISTORTIONS = {
  "All-or-Nothing Thinking": "Seeing things as all good or all bad — no gray area.",
  "Overgeneralization": "Taking one event and applying it broadly ('I always mess things up').",
  "Mental Filtering": "Focusing only on the negative and ignoring the positive.",
  "Discounting the Positive": "Rejecting positive experiences by insisting they don’t count.",
  "Jumping to Conclusions": "Making negative interpretations without evidence.",
  "Catastrophizing": "Exaggerating the importance of problems or imagining the worst-case scenario.",
  "Emotional Reasoning": "Believing that negative feelings reflect reality ('I feel it, so it must be true').",
  "Should Statements": "Using rigid rules on yourself or others ('I should always do well').",
  "Labeling": "Assigning global negative labels to yourself or others ('I’m a failure').",
  "Personalization & Blame": "Blaming yourself for things outside your control, or blaming others excessively.",
} as const;

export type CognitiveDistortion = keyof typeof COGNITIVE_DISTORTIONS;

export const COGNITIVE_DISTORTION_KEYS = Object.keys(
  COGNITIVE_DISTORTIONS
) as CognitiveDistortion[];