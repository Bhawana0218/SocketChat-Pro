import { useEffect, useRef } from "react";
import { useChatStore } from "@/store/chatStore";
import { useSocket } from "@/hooks/useSocket";
import { MessageBubble } from "@/components/MessageBubble";
import { TypingIndicator } from "@/components/TypingIndicator";
import { MessageInput } from "@/components/MessageInput";
import { DateSeparator } from "@/components/DateSeparator";
import { Lock, Phone, Video } from "lucide-react";
import { getSocket } from "@/services/socket";

export const PrivateChatPage = () => {
  const privateMessages = useChatStore((s) => s.privateMessages);
  const currentUser = useChatStore((s) => s.currentUser);
  const privateChatTarget = useChatStore((s) => s.privateChatTarget);
  const setCallInfo = useChatStore((s) => s.setCallInfo);
  const { sendPrivateMessage, joinPrivateChat, startTyping, stopTyping } =
    useSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const targetUsername = privateChatTarget?.username || "";
  const chatKey = [currentUser, targetUsername].sort().join("__");
  const messages = privateMessages.get(targetUsername) || [];

  useEffect(() => {
    if (targetUsername) joinPrivateChat(targetUsername);
  }, [targetUsername, joinPrivateChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  const initiateCall = (callType: "voice" | "video") => {
    if (!targetUsername) return;
    setCallInfo({ state: "calling", peer: targetUsername, callType });
    const socket = getSocket();
    socket.emit("call_invite", { to: targetUsername, callType });
  };

  if (!privateChatTarget) return null;

  return (
    <div className="flex flex-col h-full">
      {/* Call buttons */}
      <div className="flex items-center gap-2 px-4 py-2 bg-[#0f172a] border-b border-[#334155]">
        <button
          onClick={() => initiateCall("voice")}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-medium transition-all duration-200 border border-emerald-500/20"
        >
          <Phone className="w-3.5 h-3.5" />
          Voice Call
        </button>
        <button
          onClick={() => initiateCall("video")}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg text-xs font-medium transition-all duration-200 border border-blue-500/20"
        >
          <Video className="w-3.5 h-3.5" />
          Video Call
        </button>
      </div>

      <div
        className="flex-1 overflow-y-auto px-4 sm:px-6 py-4"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(255,255,255,0.1) transparent",
        }}
      >
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center h-full">
            <div className="text-center animate-fade-in">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-4">
                <Lock className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Private Conversation
              </h3>
              <p className="text-slate-400 text-sm max-w-xs">
                Messages with {targetUsername} are private. You can also start a
                voice or video call.
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, index) => (
              <div key={msg._id}>
                {shouldShowDateSeparator(index) && (
                  <DateSeparator dateString={msg.createdAt} />
                )}
                <MessageBubble
                  message={msg}
                  isOwn={msg.username === currentUser}
                  showAvatar={shouldShowAvatar(index)}
                />
              </div>
            ))}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      <TypingIndicator chatKey={chatKey} />

      <MessageInput
        onSendMessage={(msg, ct) =>
          sendPrivateMessage(targetUsername, msg, ct)
        }
        onTyping={() => startTyping("private", targetUsername)}
        onStopTyping={() => stopTyping("private", targetUsername)}
        placeholder={`Message ${targetUsername}...`}
      />
    </div>
  );
};
