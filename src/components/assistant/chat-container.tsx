"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAssistant } from "@/hooks/use-assistant";
import { MessageList } from "./message-list";
import { ChatInput } from "./chat-input";
import { SaveKpDialog } from "./save-kp-dialog";
import { Button } from "@/components/ui/button";
import {
  Bot,
  Camera,
  MessageSquare,
  RotateCcw,
  History,
  X,
  Loader2,
  ChevronRight,
} from "lucide-react";
import type { ClientInfo } from "@/lib/types";
import { formatDateShort } from "@/lib/format";

interface SessionPreview {
  id: string;
  preview: string;
  messageCount: number;
  estimateId: string | null;
  clientName: string | null;
  status: string;
  updatedAt: string;
}

export function ChatContainer() {
  const router = useRouter();
  const {
    messages,
    sessionId,
    isStreaming,
    isUploading,
    isLoadingSession,
    calculationResult,
    clientData,
    sendMessage,
    uploadPhoto,
    startNewSession,
    loadSession,
  } = useAssistant();

  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [sessions, setSessions] = useState<SessionPreview[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  const fetchSessions = async () => {
    setLoadingSessions(true);
    try {
      const res = await fetch("/api/assistant/sessions");
      if (res.ok) setSessions(await res.json());
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    if (showHistory) fetchSessions();
  }, [showHistory]);

  const handleSaveKp = async (data: ClientInfo) => {
    if (!sessionId) return;

    const res = await fetch("/api/assistant/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        clientName: data.name,
        clientPhone: data.phone,
        clientAddress: data.address,
      }),
    });

    if (res.ok) {
      const result = await res.json();
      setShowSaveDialog(false);
      router.push(`/dashboard/estimates/${result.estimateId}`);
    }
  };

  const handleLoadSession = async (id: string) => {
    setShowHistory(false);
    await loadSession(id);
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="flex flex-col h-[calc(100dvh-4rem)] md:h-[calc(100dvh-2rem)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-white shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1e3a5f] text-white">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-sm font-semibold">AI Ассистент</h1>
            <p className="text-xs text-muted-foreground">Расчёт по фото и тексту</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHistory(true)}
            className="text-muted-foreground"
          >
            <History className="h-4 w-4 mr-1" />
            История
          </Button>
          {hasMessages && (
            <Button variant="ghost" size="sm" onClick={startNewSession}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Новый
            </Button>
          )}
        </div>
      </div>

      {/* History panel (slide-in overlay) */}
      {showHistory && (
        <div className="absolute inset-0 z-50 flex">
          <div className="w-full max-w-sm bg-white border-r shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h2 className="font-semibold text-sm">История чатов</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowHistory(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loadingSessions ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : sessions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-12 px-4">
                  Нет сохранённых чатов
                </p>
              ) : (
                <div className="divide-y">
                  {sessions.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleLoadSession(s.id)}
                      className="w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors flex items-center justify-between group"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">
                          {s.clientName || s.preview}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatDateShort(new Date(s.updatedAt))} · {s.messageCount} сообщ.
                          {s.estimateId && (
                            <span className="ml-1 text-green-600">· КП сохранён</span>
                          )}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="p-3 border-t">
              <Button
                className="w-full"
                variant="outline"
                onClick={() => { setShowHistory(false); startNewSession(); }}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Новый чат
              </Button>
            </div>
          </div>
          {/* Backdrop */}
          <div
            className="flex-1 bg-black/30"
            onClick={() => setShowHistory(false)}
          />
        </div>
      )}

      {/* Loading session indicator */}
      {isLoadingSession ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : hasMessages ? (
        <MessageList
          messages={messages}
          isStreaming={isStreaming}
          onSaveKp={calculationResult ? () => setShowSaveDialog(true) : undefined}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center space-y-6 max-w-sm">
            <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-[#1e3a5f]/10 text-[#1e3a5f]">
              <Bot className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">AI Ассистент</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Отправьте фото тех.паспорта, чертежа дизайнера или напишите размеры комнат
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => sendMessage("Зал 5×4м, 8 спотов, 1 люстра")}
                className="flex flex-col items-center gap-2 rounded-xl border p-3 text-sm hover:bg-muted transition-colors"
              >
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Текстом</span>
                <span className="text-xs font-medium">&quot;Зал 5×4м, 8 спотов&quot;</span>
              </button>
              <button
                onClick={() => {
                  const input = document.querySelector<HTMLInputElement>("input[type='file']:not([capture])");
                  input?.click();
                }}
                className="flex flex-col items-center gap-2 rounded-xl border p-3 text-sm hover:bg-muted transition-colors"
              >
                <Camera className="h-5 w-5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Фото</span>
                <span className="text-xs font-medium">Тех.паспорт / чертёж</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <ChatInput
        onSend={sendMessage}
        onUploadPhoto={uploadPhoto}
        disabled={isStreaming || isLoadingSession}
        isUploading={isUploading}
      />

      {/* Save KP dialog */}
      <SaveKpDialog
        open={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        onSave={handleSaveKp}
        prefilled={clientData}
      />
    </div>
  );
}
