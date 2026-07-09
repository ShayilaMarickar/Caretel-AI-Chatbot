"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send } from "lucide-react";
import { sendMessage } from "@/lib/chat";

interface Message {
  role: "user" | "bot";
  content: string;
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      content: "Hi there! 👋 I'm CareTel's AI Assistant. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");
    setIsTyping(true);

    try {
      const reply = await sendMessage(trimmed);
      setMessages((prev) => [...prev, { role: "bot", content: reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content: "Sorry, something went wrong. Please try again in a moment.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <>
      {/* Floating bubble */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open chat"
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-caretel-green text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-green-400 ring-2 ring-white" />
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[560px] w-[380px] max-h-[calc(100vh-3rem)] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between bg-caretel-green px-4 py-3 text-white">
            <div>
              <p className="font-semibold">CareTel Assistant</p>
              <p className="text-xs text-white/80">We typically reply in a few minutes</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              className="rounded-full p-1 hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 min-h-0 px-4 py-3">
            <div className="flex flex-col gap-3">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                    msg.role === "user"
                      ? "self-end bg-caretel-green text-white"
                      : "self-start bg-muted text-foreground"
                  }`}
                >
                  {msg.content}
                </div>
              ))}

              {isTyping && (
                <div className="self-start rounded-2xl bg-muted px-3 py-2 text-sm text-muted-foreground">
                  <span className="inline-flex gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" />
                  </span>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="flex items-center gap-2 border-t border-border p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              disabled={isTyping}
              className="flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-caretel-green disabled:opacity-50"
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={isTyping || !input.trim()}
              className="rounded-full bg-caretel-green hover:bg-caretel-green-dark"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}