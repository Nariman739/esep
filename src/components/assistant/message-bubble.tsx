"use client";

import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/lib/types";
import { CalculationCard } from "./calculation-card";

interface MessageBubbleProps {
  message: ChatMessage;
  onSaveKp?: () => void;
}

export function MessageBubble({ message, onSaveKp }: MessageBubbleProps) {
  const isUser = message.role === "user";

  // Clean room_data / client_data blocks from display
  const displayContent = message.content
    .replace(/```room_data[\s\S]*?```/g, "")
    .replace(/```client_data[\s\S]*?```/g, "")
    .trim();

  return (
    <div className={cn("flex gap-2 max-w-[90%]", isUser ? "ml-auto flex-row-reverse" : "")}>
      {/* Avatar */}
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-[#1e3a5f] text-white" : "bg-muted text-muted-foreground"
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      {/* Content */}
      <div className="space-y-2 min-w-0">
        {/* Image preview */}
        {message.imageUrl && (
          <div className={cn("rounded-lg overflow-hidden max-w-[240px]", isUser ? "ml-auto" : "")}>
            <img
              src={message.imageUrl}
              alt="Фото"
              className="w-full h-auto rounded-lg"
            />
          </div>
        )}

        {/* Text bubble */}
        {displayContent && (
          <div
            className={cn(
              "rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap break-words",
              isUser
                ? "bg-[#1e3a5f] text-white rounded-br-md"
                : "bg-muted rounded-bl-md"
            )}
          >
            {displayContent}
          </div>
        )}

        {/* Inline calculation result */}
        {message.calculationResult && (
          <CalculationCard
            result={message.calculationResult}
            onSaveKp={onSaveKp}
          />
        )}
      </div>
    </div>
  );
}
