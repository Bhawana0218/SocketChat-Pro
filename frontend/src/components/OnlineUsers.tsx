import { useChatStore } from "@/store/chatStore";

export const OnlineUsers = () => {
  const onlineUsers = useChatStore((s) => s.onlineUsers);
  const online = onlineUsers.filter((u) => u.isOnline);

  if (online.length === 0) return null;

  return (
    <div className="bg-[#1e293b] border-b border-[#334155] px-4 sm:px-6 py-2">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-slate-400 font-medium">Online:</span>
        {online.map((user) => (
          <span
            key={user.username}
            className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#0f172a] rounded-full text-xs text-slate-300 border border-[#334155]"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            {user.username}
          </span>
        ))}
      </div>
    </div>
  );
};
