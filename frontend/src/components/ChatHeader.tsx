
import { useChatStore } from "@/store/chatStore";
import { LogOut, ArrowLeft, Hash} from "lucide-react";

export const ChatHeader = () => {
  const {
    currentUser,
    connectionStatus,
    onlineUsers,
    activeChat,
    privateChatTarget,
    setPrivateChatTarget,
    setActiveChat,
    logout,
  } = useChatStore();

  const onlineCount = onlineUsers.filter((u) => u.isOnline).length;

  return (
    <>
      <div className="bg-[#1e293b] border-b border-[#334155] px-4 sm:px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          {activeChat === "private" && privateChatTarget ? (
            <>
              <button
                onClick={() => {
                  setPrivateChatTarget(null);
                  setActiveChat("public");
                }}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-all duration-200 shrink-0"
              >
                <ArrowLeft className="w-5 h-5 text-slate-300" />
              </button>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {privateChatTarget.username[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <h1 className="text-sm font-semibold text-white truncate">
                  {privateChatTarget.username}
                </h1>
                <p className="text-[11px] text-slate-400">
                  {privateChatTarget.isOnline ? (
                    <span className="text-emerald-400">Online</span>
                  ) : (
                    "Private conversation"
                  )}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center shrink-0">
                <Hash className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm font-semibold text-white">
                  Global Room
                </h1>
                <p className="text-[11px] text-slate-400">
                  {onlineCount} member{onlineCount !== 1 ? "s" : ""} online
                </p>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="flex items-center gap-1.5">
            {connectionStatus === "connected" ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-emerald-400 hidden sm:inline">
                  Connected
                </span>
              </>
            ) : connectionStatus === "reconnecting" ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-xs text-amber-400 hidden sm:inline">
                  Reconnecting...
                </span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-red-400" />
                <span className="text-xs text-red-400 hidden sm:inline">
                  Disconnected
                </span>
              </>
            )}
          </div>

          {activeChat === "public" && currentUser && (
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-[#0f172a] rounded-lg border border-[#334155]">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white text-[10px] font-bold">
                {currentUser[0].toUpperCase()}
              </div>
              <span className="text-xs text-slate-300">{currentUser}</span>
            </div>
          )}

          <button
            onClick={logout}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
};
