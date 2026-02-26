"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, ImagePlus, Send, X, Loader2, AlertCircle, Mic, MicOff } from "lucide-react";

interface ChatInputProps {
  onSend: (text: string, imageUrl?: string) => void;
  onUploadPhoto: (file: File) => Promise<string | null>;
  disabled?: boolean;
  isUploading?: boolean;
}

export function ChatInput({ onSend, onUploadPhoto, disabled, isUploading }: ChatInputProps) {
  const [text, setText] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    setVoiceSupported(!!(w.SpeechRecognition || w.webkitSpeechRecognition));
  }, []);

  const handleSubmit = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed && !uploadedUrl) return;

    onSend(trimmed || "Отправлено фото", uploadedUrl || undefined);
    setText("");
    setPreviewUrl(null);
    setUploadedUrl(null);
    setUploadError(false);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [text, uploadedUrl, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    setUploadError(false);
    setUploadedUrl(null);

    e.target.value = "";

    const url = await onUploadPhoto(file);
    if (url) {
      setUploadedUrl(url);
    } else {
      setUploadError(true);
    }
  };

  const removePhoto = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setUploadedUrl(null);
    setUploadError(false);
  };

  const retryUpload = () => {
    setPreviewUrl(null);
    setUploadedUrl(null);
    setUploadError(false);
    galleryInputRef.current?.click();
  };

  const toggleVoice = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SpeechRecognition = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "ru-RU";
    recognition.continuous = false;
    recognition.interimResults = false;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setText((prev) => (prev ? prev + " " + transcript : transcript));
      setIsListening(false);
      // Auto-resize textarea
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
          textareaRef.current.style.height =
            Math.min(textareaRef.current.scrollHeight, 120) + "px";
        }
      }, 0);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  };

  return (
    <div className="border-t bg-white px-3 py-2 safe-area-bottom">
      {/* Photo preview */}
      {previewUrl && (
        <div className="mb-2">
          <div className="relative inline-block">
            <img
              src={previewUrl}
              alt="Preview"
              className="h-20 w-20 object-cover rounded-lg"
            />
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg">
                <Loader2 className="h-5 w-5 animate-spin text-white" />
              </div>
            )}
            {uploadError && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
            )}
            <button
              type="button"
              onClick={removePhoto}
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
          {uploadError && (
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs text-destructive">Ошибка загрузки</p>
              <button
                type="button"
                onClick={retryUpload}
                className="text-xs text-[#1e3a5f] underline"
              >
                Повторить
              </button>
            </div>
          )}
          {uploadedUrl && (
            <p className="text-xs text-green-600 mt-1">Фото загружено</p>
          )}
        </div>
      )}

      {/* Input row */}
      <div className="flex items-end gap-1.5">
        {/* Gallery button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-10 w-10 shrink-0"
          disabled={disabled || isUploading}
          onClick={() => galleryInputRef.current?.click()}
        >
          <ImagePlus className="h-5 w-5" />
        </Button>

        {/* Camera button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-10 w-10 shrink-0"
          disabled={disabled || isUploading}
          onClick={() => cameraInputRef.current?.click()}
        >
          <Camera className="h-5 w-5" />
        </Button>

        {/* Voice button (only if supported) */}
        {voiceSupported && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={`h-10 w-10 shrink-0 transition-colors ${
              isListening
                ? "text-red-500 bg-red-50 hover:bg-red-100"
                : ""
            }`}
            disabled={disabled}
            onClick={toggleVoice}
          >
            {isListening ? (
              <MicOff className="h-5 w-5 animate-pulse" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </Button>
        )}

        {/* Hidden file inputs */}
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Text input */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? "Говорите..." : "Размеры или вопрос..."}
          disabled={disabled}
          rows={1}
          className={`flex-1 resize-none rounded-xl border bg-muted/50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 min-h-[44px] max-h-[120px] transition-colors ${
            isListening ? "border-red-300 bg-red-50/50" : ""
          }`}
        />

        {/* Send button */}
        <Button
          type="button"
          size="icon"
          className="h-10 w-10 shrink-0 bg-[#1e3a5f] hover:bg-[#152d4a]"
          disabled={disabled || isUploading || (!text.trim() && !uploadedUrl)}
          onClick={handleSubmit}
        >
          {disabled ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>
    </div>
  );
}
