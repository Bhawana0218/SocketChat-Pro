import type { Message } from "@/types/chat";
import { UserPlus, UserMinus } from "lucide-react";

interface SystemMessageProps {
  message: Message;
}

export const SystemMessage = ({ message }: SystemMessageProps) => {
  const isJoin = message.event === "user_joined";

  return (
    <div className="flex items-center justify-center my-3 animate-fade-in">
      <div className="flex items-center gap-3 w-full">
        <div className="flex-1 h-px bg-white/5" />
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/5">
          {isJoin ? (
            <UserPlus className="w-3 h-3 text-emerald-400" />
          ) : (
            <UserMinus className="w-3 h-3 text-amber-400" />
          )}
          <span className="text-xs text-slate-400">
            <span className="font-medium text-slate-300">
              {message.username}
            </span>
            {isJoin ? " joined the chat" : " left the chat"}
          </span>
        </div>
        <div className="flex-1 h-px bg-white/5" />
      </div>
    </div>
  );
};
