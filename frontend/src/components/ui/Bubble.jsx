
export default function Bubble({ role, text, time }) {
  const isUser = role === "user";
  const wrap = "max-w-[85%] sm:max-w-[70%] px-3 py-2 rounded-2xl text-sm shadow-sm whitespace-pre-wrap";
  const side = isUser ? "ml-auto" : "mr-auto";
  const color = isUser ? "bg-primary text-primary-foreground" : "bg-muted text-foreground";
  return (
    <div className={`${wrap} ${side} ${color}`}>
      <div>{text}</div>
      <div className={`mt-1 text-[10px] opacity-70 ${isUser ? "text-primary-foreground" : "text-muted-foreground"}`}>
        {time}
      </div>
    </div>
  );
}