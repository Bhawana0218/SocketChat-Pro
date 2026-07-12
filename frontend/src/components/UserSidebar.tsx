import { useChatStore } from "@/store/chatStore";
import { formatTime } from "@/utils/formatTime";
import { Hash } from "lucide-react";
import { useMemo, useState } from "react";

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

export const UserSidebar = () => {
  const { onlineUsers, currentUser, setPrivateChatTarget, privateChatTarget, activeChat } =
    useChatStore();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = useMemo(() => {
    const usersWithoutSelf = onlineUsers.filter((u) => u.username !== currentUser);
    if (!searchQuery.trim()) return usersWithoutSelf;
    return usersWithoutSelf.filter((u) =>
      u.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [onlineUsers, searchQuery, currentUser]);

  const onlineList = filteredUsers.filter((u) => u.isOnline);
  const offlineList = filteredUsers.filter((u) => !u.isOnline);

  return (
    <div className="w-[280px] bg-[#1e293b] border-r border-[#334155] flex flex-col h-full shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-[#334155]">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Direct Messages
          </span>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search people..."
          className="w-full px-3 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-200"
        />
      </div>

      {/* Public Channel */}
      <div className="p-2">
        <button
          onClick={() => setPrivateChatTarget(null)}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all duration-150 ${
            activeChat === "public" && !privateChatTarget
              ? "bg-indigo-500/20 text-white"
              : "text-slate-300 hover:bg-white/5"
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-[#0f172a] flex items-center justify-center shrink-0">
            <Hash className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Global Room</p>
          </div>
          <span className="text-[10px] text-slate-500">
            {onlineUsers.filter((u) => u.isOnline).length}
          </span>
        </button>
      </div>

      <div className="px-2 py-1">
        <div className="h-px bg-[#334155]" />
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {onlineList.length > 0 && (
          <div className="mb-2">
            <span className="px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Online — {onlineList.length}
            </span>
            <div className="mt-1 space-y-0.5">
              {onlineList.map((user) => (
                <button
                  key={user.username}
                  onClick={() =>
                    setPrivateChatTarget({
                      username: user.username,
                      lastSeen: user.lastSeen,
                      isOnline: user.isOnline,
                    })
                  }
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all duration-150 group ${
                    privateChatTarget?.username === user.username
                      ? "bg-indigo-500/20 text-white"
                      : "text-slate-300 hover:bg-white/5"
                  }`}
                >
                  <div className="relative shrink-0">
                    <div
                      className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarColor(
                        user.username
                      )} flex items-center justify-center text-white text-xs font-bold`}
                    >
                      {user.username[0].toUpperCase()}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#1e293b]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {user.username}
                    </p>
                    <p className="text-[10px] text-emerald-400/80">Online</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {offlineList.length > 0 && (
          <div>
            <span className="px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Offline — {offlineList.length}
            </span>
            <div className="mt-1 space-y-0.5">
              {offlineList.map((user) => (
                <button
                  key={user.username}
                  onClick={() =>
                    setPrivateChatTarget({
                      username: user.username,
                      lastSeen: user.lastSeen,
                      isOnline: user.isOnline,
                    })
                  }
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all duration-150 group ${
                    privateChatTarget?.username === user.username
                      ? "bg-indigo-500/20 text-white"
                      : "text-slate-400 hover:bg-white/5"
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className="w-8 h-8 rounded-full bg-[#334155] flex items-center justify-center text-slate-400 text-xs font-bold">
                      {user.username[0].toUpperCase()}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-slate-500 rounded-full border-2 border-[#1e293b]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{user.username}</p>
                    <p className="text-[10px] text-slate-500">
                      Last seen {formatTime(user.lastSeen)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {filteredUsers.length === 0 && (
          <div className="text-center py-8">
            <p className="text-xs text-slate-500">
              {searchQuery ? "No users found" : "No other users online"}
            </p>
          </div>
        )}
      </div>

      {/* Current User */}
      {currentUser && (
        <div className="p-3 border-t border-[#334155]">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div
                className={`w-9 h-9 rounded-full bg-gradient-to-br ${getAvatarColor(
                  currentUser
                )} flex items-center justify-center text-white text-sm font-bold`}
              >
                {currentUser[0].toUpperCase()}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#1e293b]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {currentUser}
              </p>
              <p className="text-[10px] text-emerald-400">Online</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
