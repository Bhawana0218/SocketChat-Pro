import { useState, useRef, useCallback, useEffect } from "react";
import { Send, Smile, Paperclip, Mic } from "lucide-react";
import { EmojiPicker } from "./EmojiPicker";
import { StickerPicker } from "./StickerPicker";
import { VoiceRecorder } from "./VoiceRecorder";

interface MessageInputProps {
  onSendMessage: (message: string, contentType?: string) => void;
  onTyping: () => void;
  onStopTyping: () => void;
  placeholder?: string;
}

export const MessageInput = ({
  onSendMessage,
  onTyping,
  onStopTyping,
  placeholder = "Type a message...",
}: MessageInputProps) => {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleTyping = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true);
      onTyping();
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      onStopTyping();
    }, 2000);
  }, [isTyping, onTyping, onStopTyping]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = message.trim();
      if (!trimmed) return;
      onSendMessage(trimmed, "text");
      setMessage("");
      setIsTyping(false);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      onStopTyping();
    },
    [message, onSendMessage, onStopTyping]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e);
      }
    },
    [handleSubmit]
  );

  const handleEmojiSelect = useCallback(
    (emoji: string) => {
      setMessage((prev) => prev + emoji);
      setShowEmoji(false);
      inputRef.current?.focus();
    },
    []
  );

  const handleStickerSelect = useCallback(
    (sticker: string) => {
      onSendMessage(sticker, "sticker");
      setShowStickers(false);
    },
    [onSendMessage]
  );

  const handleVoiceSend = useCallback(
    (base64Audio: string) => {
      onSendMessage(base64Audio, "voice");
      setIsRecording(false);
    },
    [onSendMessage]
  );

  if (isRecording) {
    return (
      <VoiceRecorder
        onSend={handleVoiceSend}
        onCancel={() => setIsRecording(false)}
      />
    );
  }

  return (
    <div className="bg-[#1e293b] border-t border-[#334155] px-4 sm:px-6 py-3 shrink-0 relative">
      {showEmoji && (
        <EmojiPicker
          onSelect={handleEmojiSelect}
          onClose={() => setShowEmoji(false)}
        />
      )}
      {showStickers && (
        <StickerPicker
          onSelect={handleStickerSelect}
          onClose={() => setShowStickers(false)}
        />
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setShowEmoji(!showEmoji);
              setShowStickers(false);
            }}
            className={`p-2 rounded-lg transition-all duration-200 ${
              showEmoji
                ? "text-indigo-400 bg-indigo-500/10"
                : "text-slate-400 hover:text-yellow-400 hover:bg-white/5"
            }`}
          >
            <Smile className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => {
              setShowStickers(!showStickers);
              setShowEmoji(false);
            }}
            className={`p-2 rounded-lg transition-all duration-200 ${
              showStickers
                ? "text-indigo-400 bg-indigo-500/10"
                : "text-slate-400 hover:text-indigo-400 hover:bg-white/5"
            }`}
          >
            <Paperclip className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping();
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full px-4 py-3 bg-[#0f172a] border border-[#334155] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-200 text-[15px]"
            maxLength={2000}
          />
          {message.length > 0 && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-500">
              {message.length}/2000
            </div>
          )}
        </div>

        {message.trim() ? (
          <button
            type="submit"
            className="p-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all duration-200 transform hover:scale-105 active:scale-95 shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIsRecording(true)}
            className="p-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all duration-200 transform hover:scale-105 active:scale-95 shrink-0"
          >
            <Mic className="w-5 h-5" />
          </button>
        )}
      </form>
    </div>
  );
};
