"use client"
import * as React from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send } from "lucide-react"
const initialMessages = [
  { id: 1, user: "Alex", message: "Hey team! How's the project going?", time: "10:00 AM", isMe: false },
  { id: 2, user: "You", message: "Going great! Just finished the API integration", time: "10:02 AM", isMe: true },
  { id: 3, user: "Sarah", message: "Nice work! I'm wrapping up the UI components", time: "10:03 AM", isMe: false },
  { id: 4, user: "You", message: "Perfect, should we sync up later today?", time: "10:05 AM", isMe: true },
  { id: 5, user: "Alex", message: "Sounds good. How about 2 PM?", time: "10:06 AM", isMe: false },
  { id: 6, user: "Sarah", message: "Works for me! 👍", time: "10:07 AM", isMe: false },
  { id: 7, user: "You", message: "Great, see you both then", time: "10:08 AM", isMe: true },
  { id: 8, user: "Alex", message: "Just pushed my changes to the staging branch", time: "11:30 AM", isMe: false },
  { id: 9, user: "Sarah", message: "Reviewing now...", time: "11:32 AM", isMe: false },
  { id: 10, user: "You", message: "I'll test it after lunch", time: "11:35 AM", isMe: true },
]
export default function ScrollAreaChat() {
  const [messages, setMessages] = React.useState(initialMessages)
  const [input, setInput] = React.useState("")
  const scrollRef = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])
  const sendMessage = () => {
    if (input.trim()) {
      const newMessage = {
        id: messages.length + 1,
        user: "You",
        message: input,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        isMe: true
      }
      setMessages([...messages, newMessage])
      setInput("")
    }
  }
  return (
    // <div 
    //   className="flex justify-center self-start pt-6 w-full" 
    //   style={{ 
    //     all: 'revert',
    //     display: 'flex',
    //     justifyContent: 'center',
    //     alignSelf: 'flex-start',
    //     paddingTop: '1.5rem',
    //     width: '100%',
    //     fontSize: '14px',
    //     lineHeight: '1.5',
    //     letterSpacing: 'normal'
    //   }}
    // >
    // </div>
    <div className="w-full h-screen max-w-md border rounded-lg">
      <div className="border-b p-3">
        <h3 className="font-semibold">Team Chat</h3>
      </div>
      <ScrollArea className="h-screen p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.isMe ? 'flex-row-reverse' : ''}`}
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {msg.user[0]}
                </AvatarFallback>
              </Avatar>
              <div className={`flex flex-col gap-1 ${msg.isMe ? 'items-end' : ''}`}>
                <div className={`rounded-lg px-3 py-2 max-w-[250px] ${
                  msg.isMe 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'
                }`}>
                  <p className="text-sm">{msg.message}</p>
                </div>
                <span className="text-xs text-muted-foreground">{msg.time}</span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="border-t p-3">
        <form 
          onSubmit={(e) => {
            e.preventDefault()
            sendMessage()
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
