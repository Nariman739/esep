"use client";

import { useEffect, useRef } from "react";
import { MessageBubble } from "./message-bubble";
import type { ChatMessage } from "@/lib/types";
import { Loader2 } from "lucide-react";

interface MessageListProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  onSaveKp?: () => void;
}

export function MessageList({ messages, isStreaming, onSaveKp }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) return null;

  return (
    <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
      {messages.map((msg, i) => (
        <MessageBubble
          key={msg.id}
          message={msg}
          onSaveKp={
            msg.calculationResult && i === messages.length - 1
              ? onSaveKp
              : undefined
          }
        />
      ))}

      {isStreaming && messages[messages.length - 1]?.content === "" && (
        <div className="flex gap-2 items-center text-muted-foreground text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Думаю...</span>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
