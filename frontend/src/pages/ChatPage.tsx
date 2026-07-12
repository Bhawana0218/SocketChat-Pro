import { useEffect, useRef, useState, useCallback } from "react";
import { useChatStore } from "@/store/chatStore";
import { useSocket, useMessages } from "@/hooks/useSocket";
import { ChatHeader } from "@/components/ChatHeader";
import { MessageBubble } from "@/components/MessageBubble";
import { TypingIndicator } from "@/components/TypingIndicator";
import { MessageInput } from "@/components/MessageInput";
import { EmptyState } from "@/components/EmptyState";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { DateSeparator } from "@/components/DateSeparator";
import { UserSidebar } from "@/components/UserSidebar";
import { ScrollToBottom } from "@/components/ScrollToBottom";
import { PrivateChatPage } from "./PrivateChatPage";

export const ChatPage = () => {
  const messages = useChatStore((s) => s.messages);
  const currentUser = useChatStore((s) => s.currentUser);
  const connectionStatus = useChatStore((s) => s.connectionStatus);
  const activeChat = useChatStore((s) => s.activeChat);
  const { sendMessage, startTyping, stopTyping } = useSocket();
  const { fetchMessages } = useMessages();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  useEffect(() => {
    const loadMessages = async () => {
      setIsLoading(true);
      await fetchMessages();
      setIsLoading(false);
    };
    loadMessages();
  }, [fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollBtn(!isNearBottom);
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const shouldShowAvatar = (index: number) => {
    if (index === 0) return true;
    return messages[index - 1].username !== messages[index].username;
  };

  const shouldShowDateSeparator = (index: number) => {
    if (index === 0) return true;
    return (
      new Date(messages[index].createdAt).toDateString() !==
      new Date(messages[index - 1].createdAt).toDateString()
    );
  };

  if (connectionStatus === "disconnected" && !isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Connection Lost</h2>
          <p className="text-slate-400 text-sm mb-4">Attempting to reconnect...</p>
          <div className="flex justify-center">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#0f172a]">
      <ChatHeader />
      {activeChat === "public" && <OnlineUsersInline />}

      <div className="flex-1 flex overflow-hidden">
        <div className="hidden md:flex">
          <UserSidebar />
        </div>

        <div className="flex-1 flex flex-col min-w-0 relative">
          {activeChat === "private" ? (
            <PrivateChatPage />
          ) : (
            <>
              <div
                ref={containerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto px-4 sm:px-6 py-4"
                style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}
              >
                {isLoading ? (
                  <LoadingSkeleton />
                ) : messages.length === 0 ? (
                  <EmptyState />
                ) : (
                  <>
                    {messages.map((msg, index) => (
                      <div key={msg._id}>
                        {msg.messageType === "system" ? (
                          <div className="flex items-center justify-center my-3 animate-fade-in">
                            <div className="flex items-center gap-3 w-full">
                              <div className="flex-1 h-px bg-[#334155]" />
                              <div className="px-3 py-1.5 bg-[#1e293b] rounded-full border border-[#334155]">
                                <span className="text-[11px] text-slate-400">
                                  <span className="font-medium text-slate-300">{msg.username}</span>
                                  {msg.event === "user_joined" ? " joined the chat" : " left the chat"}
                                </span>
                              </div>
                              <div className="flex-1 h-px bg-[#334155]" />
                            </div>
                          </div>
                        ) : (
                          <>
                            {shouldShowDateSeparator(index) && (
                              <DateSeparator dateString={msg.createdAt} />
                            )}
                            <MessageBubble
                              message={msg}
                              isOwn={msg.username === currentUser}
                              showAvatar={shouldShowAvatar(index)}
                            />
                          </>
                        )}
                      </div>
                    ))}
                  </>
                )}
                <div ref={messagesEndRef} />
              </div>

              {showScrollBtn && <ScrollToBottom onClick={scrollToBottom} />}

              <TypingIndicator chatKey="public" />

              <MessageInput
                onSendMessage={(msg, ct) => sendMessage(msg, ct)}
                onTyping={() => startTyping("public")}
                onStopTyping={() => stopTyping("public")}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const OnlineUsersInline = () => {
  const onlineUsers = useChatStore((s) => s.onlineUsers);
  const online = onlineUsers.filter((u) => u.isOnline);
  if (online.length === 0) return null;
  return (
    <div className="bg-[#1e293b] border-b border-[#334155] px-4 sm:px-6 py-2 md:hidden">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-slate-400 font-medium">Online:</span>
        {online.map((user) => (
          <span key={user.username} className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#0f172a] rounded-full text-xs text-slate-300 border border-[#334155]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            {user.username}
          </span>
        ))}
      </div>
    </div>
  );
};
