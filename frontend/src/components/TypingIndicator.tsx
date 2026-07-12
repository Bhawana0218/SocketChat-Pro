import { useChatStore } from "@/store/chatStore";

export const TypingIndicator = ({ chatKey }: { chatKey: string }) => {
  const typingUsers = useChatStore((s) => s.typingUsers);
  const users = typingUsers.get(chatKey) || [];

  if (users.length === 0) return null;

  const getTypingText = () => {
    if (users.length === 1) return `${users[0]} is typing`;
    if (users.length === 2) return `${users[0]} and ${users[1]} are typing`;
    return `${users[0]} and ${users.length - 1} others are typing`;
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2 animate-fade-in">
      <div className="flex items-center gap-1.5 px-3 py-2 bg-[#1e293b] rounded-xl border border-[#334155]">
        <div className="flex gap-1">
          <span
            className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse-dot"
            style={{ animationDelay: "0s" }}
          />
          <span
            className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse-dot"
            style={{ animationDelay: "0.2s" }}
          />
          <span
            className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse-dot"
            style={{ animationDelay: "0.4s" }}
          />
        </div>
        <span className="text-xs text-slate-400 ml-1">
          {getTypingText()}...
        </span>
      </div>
    </div>
  );
};
