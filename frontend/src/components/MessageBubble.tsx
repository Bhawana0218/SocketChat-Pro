import type { Message } from "@/types/chat";
import { formatMessageTime } from "@/utils/formatTime";
import { Check, CheckCheck, Play, Pause } from "lucide-react";
import { useState, useRef, useCallback } from "react";

const AVATAR_COLORS = [
  "from-violet-500 to-purple-500",
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-500",
  "from-indigo-500 to-blue-500",
];

const getAvatarColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

interface VoiceMessageProps {
  base64Audio: string;
  isOwn: boolean;
}

const VoiceMessage = ({ base64Audio, isOwn }: VoiceMessageProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(`data:audio/webm;base64,${base64Audio}`);
      audioRef.current.addEventListener("ended", () => {
        setIsPlaying(false);
        setProgress(0);
      });
      audioRef.current.addEventListener("timeupdate", () => {
        if (audioRef.current) {
          setProgress(
            (audioRef.current.currentTime / audioRef.current.duration) * 100
          );
        }
      });
    }

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, base64Audio]);

  return (
    <div className="flex items-center gap-2.5 min-w-[180px]">
      <button
        onClick={togglePlay}
        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 ${
          isOwn
            ? "bg-white/20 hover:bg-white/30 text-white"
            : "bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400"
        }`}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4 ml-0.5" />
        )}
      </button>
      <div className="flex-1">
        <div className={`h-1.5 rounded-full overflow-hidden ${isOwn ? "bg-white/20" : "bg-[#334155]"}`}>
          <div
            className={`h-full rounded-full transition-all duration-100 ${
              isOwn ? "bg-white" : "bg-indigo-500"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex gap-0.5 mt-1 items-center h-3">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className={`w-0.5 rounded-full ${
                isOwn ? "bg-white/40" : "bg-slate-400/40"
              }`}
              style={{ height: `${2 + Math.sin(i * 0.8) * 4 + Math.random() * 2}px` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar: boolean;
}

export const MessageBubble = ({
  message,
  isOwn,
  showAvatar,
}: MessageBubbleProps) => {
  const getStatusIcon = () => {
    if (!isOwn) return null;
    if (message.read)
      return <CheckCheck className="w-3.5 h-3.5 text-indigo-400" />;
    if (message.delivered)
      return <CheckCheck className="w-3.5 h-3.5 text-slate-400" />;
    return <Check className="w-3.5 h-3.5 text-slate-400" />;
  };

  const isSticker =
    message.contentType === "sticker" ||
    (message.message.length <= 4 && /\p{Emoji}/u.test(message.message));
  const isVoice = message.contentType === "voice";

  if (isOwn) {
    return (
      <div className={`flex justify-end ${showAvatar ? "mt-3" : "mt-0.5"}`}>
        <div className="flex flex-row-reverse items-end gap-2 max-w-[70%]">
          <div className="w-8 h-8 flex-shrink-0" />
          <div className="flex items-end flex-col">
            {isSticker ? (
              <div className="text-5xl p-2 hover:scale-110 transition-transform duration-200 cursor-default">
                {message.message}
              </div>
            ) : isVoice ? (
              <div className="px-4 py-3 rounded-2xl rounded-br-md bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/20">
                <VoiceMessage
                  base64Audio={message.message}
                  isOwn={true}
                />
              </div>
            ) : (
              <div className="px-[18px] py-3 rounded-2xl rounded-br-md bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/20 transition-all duration-200 hover:shadow-indigo-500/30">
                <p className="text-[15px] leading-relaxed break-words whitespace-pre-wrap">
                  {message.message}
                </p>
              </div>
            )}
            <div className="flex items-center gap-1 mt-1 mr-1">
              <span className="text-[10px] text-slate-500">
                {formatMessageTime(message.createdAt)}
              </span>
              {getStatusIcon()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex justify-start ${showAvatar ? "mt-3" : "mt-0.5"}`}>
      <div className="flex items-end gap-2 max-w-[70%]">
        {showAvatar ? (
          <div
            className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarColor(
              message.username
            )} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
          >
            {message.username[0].toUpperCase()}
          </div>
        ) : (
          <div className="w-8 h-8 flex-shrink-0" />
        )}
        <div className="flex items-end flex-col">
          {showAvatar && (
            <span className="text-xs text-slate-400 ml-1 mb-1 font-medium">
              {message.username}
            </span>
          )}
          {isSticker ? (
            <div className="text-5xl p-2 hover:scale-110 transition-transform duration-200 cursor-default">
              {message.message}
            </div>
          ) : isVoice ? (
            <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-[#1e293b] border border-[#334155]">
              <VoiceMessage
                base64Audio={message.message}
                isOwn={false}
              />
            </div>
          ) : (
            <div className="px-[18px] py-3 rounded-2xl rounded-bl-md bg-[#1e293b] text-white border border-[#334155] transition-all duration-200 hover:border-[#475569]">
              <p className="text-[15px] leading-relaxed break-words whitespace-pre-wrap">
                {message.message}
              </p>
            </div>
          )}
          <div className="flex items-center gap-1 mt-1 ml-1">
            <span className="text-[10px] text-slate-500">
              {formatMessageTime(message.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
