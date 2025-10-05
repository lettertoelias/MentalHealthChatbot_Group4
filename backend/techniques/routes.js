// backend/src/cbt/router.js
import { INTENT_ROUTES } from "./dictionaries.js";

export function computeNextIntent(current) {
  // force terminal at I7 even if the map accidentally loops
  if (current === "I7") return null;
  return INTENT_ROUTES[current] ?? null;
}

export function advanceIntent(current) {
  const next = computeNextIntent(current);
  return { current, next };
}