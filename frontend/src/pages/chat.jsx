import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Bubble from "../components/ui/Bubble";
import TypingIndicator from "../components/ui/TypingIndicator";
import onKeyDown from "../helpers/onKeyDown";


import { 
  normalizeTechnique,
  nextIntentOf,
  createMessagePayload,
  validateMessagePayload,
  appendUserTurn,
  applyInboundAndAdvance
} from "@/cbt/helpers";

export default function Chat() {
  const params = new URLSearchParams(window.location.search);

  // Technique disable logic
  const rawCount = params.get("count");
  const parsedCount = parseInt(rawCount ?? "", 10);
  const maxDisableCount = Number.isFinite(parsedCount) ? parsedCount : 0; // -1 never; 0 immediately; >0 after N
  const [currentCount, setCurrentCount] = useState(0);

  // Normalize technique; fallback handled inside normalizeTechnique
  const technique = normalizeTechnique(params.get("tech"));
  const isTechniqueActive = maxDisableCount === -1 || currentCount < maxDisableCount;
  const effectiveTechnique = isTechniqueActive ? technique : "Baseline";

  // Schema-shaped context
  const [context, setContext] = useState([
    {
      role: "assistant",
      text: "Hi! I'm here to help. How are you feeling today?",
      timestamp: new Date().toISOString(),
    },
  ]);

  // Intent pointers
  const [identifiedIntent, setIdentifiedIntent] = useState("I1");
  const [nextIntent, setNextIntent] = useState(nextIntentOf("I1"));

  // UI state
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [context]);

  // at top of Chat.jsx (helper)
  function formatTime(iso) {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      // e.g., "3:07 PM"
      return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    } catch {
      return "";
    }
  }

  async function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || busy) return;

    setBusy(true);
    setText("");
    setCurrentCount((c) => c + 1);

    // 1) append user turn (tag with current intent)
    const ctx1 = appendUserTurn(context, trimmed, identifiedIntent);
    setContext(ctx1);

    // 2) build schema-aligned payload
    const payload = createMessagePayload({
      message: trimmed,
      effectiveTechnique,
      context: ctx1,
      identifiedIntent,
      nextIntent: nextIntentOf(identifiedIntent),
    });

    // 3) validate against JSON Schema (AJV)
    const { ok, errors } = validateMessagePayload(payload);
    if (!ok) {
      console.warn("Payload validation failed:", errors);
      setBusy(false);
      return;
    }

    try {
      // 4) call your backend
      const res = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      // Expected inbound shape: { reply, identifiedIntent?, nextIntent?, distortionIdentified? }
      const data = await res.json();

      // 5) guard inbound + advance via domain helper
      const { advanced, identifiedIntent: id2, nextIntent: next2 } = applyInboundAndAdvance(payload, data);

      // 6) hydrate UI
      
      setContext(advanced.context);
      setIdentifiedIntent(id2);
      setNextIntent(next2);
      console.log("Data: ", data);
      console.log("Context: ", context);
      console.log("Identified Intent: ", identifiedIntent);
      console.log("Next Intent: ", nextIntent);
    } catch (err) {
      console.error("Send failed:", err);
      setContext((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Sorry—something went wrong. Please try again.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Card className="p-4">
        <div ref={listRef} className="h-[60vh] overflow-y-auto space-y-3 pb-3">
          {context.map((m, i) => (
            <Bubble
              key={i}
              role={m.role}
              text={m.text}
              time={formatTime(m.timestamp)} 
            />
          ))}
          {busy && <TypingIndicator />}
        </div>

        <div className="mt-3 flex items-end gap-2">
          <Textarea
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => onKeyDown(e, handleSend)}
            placeholder="Type your message…"
            className="min-h-[90px]"
          />
          <Button onClick={handleSend} disabled={busy || !text.trim()}>
            Send
          </Button>
        </div>

        <div className="mt-2 text-xs text-muted-foreground">
          Technique: <b>{effectiveTechnique}</b> · Intent: <b>{identifiedIntent}</b> → Next:{" "}
          <b>{nextIntent ?? "End"}</b>
        </div>
      </Card>
    </div>
  );
}