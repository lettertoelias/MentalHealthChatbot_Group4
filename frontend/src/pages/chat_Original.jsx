import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Bubble from "../components/ui/Bubble";
import TypingIndicator from "../components/ui/TypingIndicator";
import onKeyDown from "../helpers/onKeyDown";

// paramaters needed: Prompt technique, Prompt Disabling, Disable Count
// http://localhost:5173/?tech=socratic&count=-1

export default function Chat() {
  const params = new URLSearchParams(window.location.search);
  const technique = (params.get("tech") ?? "baseline").toLowerCase();
  const rawCount = params.get("count");
  const parsedCount = parseInt(rawCount ?? "", 10);
  const maxDisableCount = Number.isFinite(parsedCount) ? parsedCount : 0; // -1 = never disable; 0 = disable immediately; >0 = disable after count messages
  
  console.log("Technique:", technique, "Max disable count:", maxDisableCount);

  const [currentCount, setCurrentCount] = useState(0);

  const techniqueActive = (maxDisableCount === -1) || (currentCount < maxDisableCount);
  const effectiveTechnique = techniqueActive ? technique : "baseline";

  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef(null);
  const inputRef = useRef(null);

  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm here to help. How are you feeling today?", ts: Date.now() },
  ]);

  const [context, setContext] = useState(["Start of conversation."]);

  console.log("Context: ", context);

  // auto-scroll to bottom on new messages
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // autosize textarea as you type
  useEffect(() => {
    if (!inputRef.current) return;
    inputRef.current.style.height = "auto";
    inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 160)}px`;
  }, [text]);

  const fmt = (t) => new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  async function send() {
    const content = text.trim();
    if (!content || busy) return;

    const next = [...messages, { role: "user", content, ts: Date.now() }];
    setMessages(next);
    setText("");
    setBusy(true);

    console.log("Context before send: ", context);

    try {
      const res = await fetch("http://localhost:8000/api/chat/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          effectiveTechnique,
          context,
          intent: "i7",
        })
      });
      const data = await res.json();

      setMessages(m => [...m, { role: "assistant", content: data.reply }]);
      setCurrentCount(c => c + 1);
      setContext(prev => [...prev, `System: ${data.context}`]); 
      
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", content: `❌ ${e.message}`, ts: Date.now() }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(80%_60%_at_50%_-10%,hsl(var(--muted))/0.6,transparent_60%)]">
      <div className="max-w-3xl mx-auto p-4 sm:p-6">
        <Card className="h-[80vh] sm:h-[78vh] grid grid-rows-[auto_1fr_auto] overflow-hidden border shadow-sm">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-background/70 backdrop-blur">
            <div className="flex items-center gap-2">
              <span className={`inline-block h-2.5 w-2.5 rounded-full ${busy ? "bg-amber-500" : "bg-emerald-500"}`} />
              <div>
                <div className="text-sm font-medium">Mental Health Chatbot</div>
                <div className="text-xs text-muted-foreground">{busy ? "Assistant is typing…" : "Ready"}</div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div ref={listRef} className="overflow-y-auto px-3 sm:px-4 py-4 space-y-3 bg-background">
            {messages.map((m, i) => (
              <Bubble key={i} role={m.role} text={m.content} time={fmt(m.ts)} />
            ))}
            {busy && <TypingIndicator />}
          </div>

          {/* Composer */}
          <div className="border-t bg-background/80 backdrop-blur px-3 sm:px-4 py-3">
            <div className="flex gap-2">
              <Textarea
                ref={inputRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => onKeyDown(e, send)}
                placeholder="Type your message… (Shift+Enter for newline)"
                disabled={busy}
                className="flex-1 min-h-[44px] max-h-40"
              />
              <Button onClick={send} disabled={busy || !text.trim()} className="self-end">
                {busy ? "Sending…" : "Send"}
              </Button>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              This tool does not replace professional help. If you're in crisis, contact local emergency services.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
