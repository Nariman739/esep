"use client";

import { useState, useCallback, useRef } from "react";
import { compressImage } from "@/lib/compress-image";
import type { ChatMessage, CalculationResult, RoomInput, ClientInfo } from "@/lib/types";

interface UseAssistantReturn {
  messages: ChatMessage[];
  sessionId: string | null;
  isStreaming: boolean;
  isUploading: boolean;
  extractedRooms: RoomInput[] | null;
  calculationResult: CalculationResult | null;
  clientData: ClientInfo | null;
  sendMessage: (text: string, imageUrl?: string) => Promise<void>;
  uploadPhoto: (file: File) => Promise<string | null>;
  startNewSession: () => void;
}

export function useAssistant(): UseAssistantReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [extractedRooms, setExtractedRooms] = useState<RoomInput[] | null>(null);
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
  const [clientData, setClientData] = useState<ClientInfo | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const uploadPhoto = useCallback(
    async (file: File): Promise<string | null> => {
      setIsUploading(true);
      try {
        const compressed = await compressImage(file);
        const formData = new FormData();
        formData.append("file", compressed);
        if (sessionId) formData.append("sessionId", sessionId);

        const res = await fetch("/api/assistant/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          console.error("Upload failed:", res.status, err);
          return null;
        }
        const data = await res.json();
        return data.url;
      } catch (err) {
        console.error("Upload error:", err);
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [sessionId]
  );

  const sendMessage = useCallback(
    async (text: string, imageUrl?: string) => {
      if (isStreaming) return;

      // Add user message immediately
      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: text,
        imageUrl,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsStreaming(true);

      // Placeholder for streaming assistant message
      const assistantId = crypto.randomUUID();
      const assistantMsg: ChatMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      try {
        abortRef.current = new AbortController();

        const res = await fetch("/api/assistant/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            imageUrl,
            sessionId,
          }),
          signal: abortRef.current.signal,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: err.error || "Ошибка. Попробуйте снова." }
                : m
            )
          );
          setIsStreaming(false);
          return;
        }

        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6).trim();
            if (!jsonStr) continue;

            try {
              const event = JSON.parse(jsonStr);

              switch (event.type) {
                case "session":
                  setSessionId(event.sessionId);
                  break;

                case "text":
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantId
                        ? { ...m, content: m.content + event.content }
                        : m
                    )
                  );
                  break;

                case "calculation":
                  setExtractedRooms(event.rooms);
                  setCalculationResult(event.result);
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantId
                        ? { ...m, calculationResult: event.result }
                        : m
                    )
                  );
                  break;

                case "clear_analyzing":
                  // Vision extraction done — clear "Анализирую..." indicator
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantId ? { ...m, content: "" } : m
                    )
                  );
                  break;

                case "client_data":
                  setClientData(event.data);
                  break;

                case "error":
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantId
                        ? { ...m, content: m.content + "\n\n⚠️ " + event.message }
                        : m
                    )
                  );
                  break;

                case "done":
                  break;
              }
            } catch {
              // skip invalid JSON
            }
          }
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: "Ошибка соединения. Попробуйте снова." }
              : m
          )
        );
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [isStreaming, sessionId]
  );

  const startNewSession = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    setMessages([]);
    setSessionId(null);
    setExtractedRooms(null);
    setCalculationResult(null);
    setClientData(null);
    setIsStreaming(false);
    setIsUploading(false);
  }, []);

  return {
    messages,
    sessionId,
    isStreaming,
    isUploading,
    extractedRooms,
    calculationResult,
    clientData,
    sendMessage,
    uploadPhoto,
    startNewSession,
  };
}
