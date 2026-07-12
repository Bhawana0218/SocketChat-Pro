import { useEffect, useRef, useCallback } from "react";
import { getSocket, disconnectSocket, type ChatSocket } from "@/services/socket";
import { chatApi } from "@/api/chatApi";
import { useChatStore } from "@/store/chatStore";
import type { Message } from "@/types/chat";

const useRefCallback = <T extends (...args: never[]) => unknown>(fn: T) => {
  const fnRef = useRef(fn);
  fnRef.current = fn;
  return useCallback((...args: Parameters<T>) => fnRef.current(...args), []);
};

export const useSocket = () => {
  const socketRef = useRef<ChatSocket | null>(null);
  const connectedRef = useRef(false);

  const addMessage = useChatStore((s) => s.addMessage);
  const addPrivateMessage = useChatStore((s) => s.addPrivateMessage);
  const setOnlineUsers = useChatStore((s) => s.setOnlineUsers);
  const addTypingUser = useChatStore((s) => s.addTypingUser);
  const removeTypingUser = useChatStore((s) => s.removeTypingUser);
  const setConnectionStatus = useChatStore((s) => s.setConnectionStatus);
  const updateMessageStatus = useChatStore((s) => s.updateMessageStatus);
  const currentUser = useChatStore((s) => s.currentUser);

  const stableAddMessage = useRefCallback(addMessage);
  const stableAddPrivateMessage = useRefCallback(addPrivateMessage);
  const stableSetOnlineUsers = useRefCallback(setOnlineUsers);
  const stableAddTypingUser = useRefCallback(addTypingUser);
  const stableRemoveTypingUser = useRefCallback(removeTypingUser);
  const stableSetConnectionStatus = useRefCallback(setConnectionStatus);
  const stableUpdateMessageStatus = useRefCallback(updateMessageStatus);

  useEffect(() => {
    if (!currentUser || connectedRef.current) return;

    const socket = getSocket();
    socketRef.current = socket;
    connectedRef.current = true;

    socket.on("connect", () => {
      stableSetConnectionStatus("connected");
      socket.emit("join", { username: currentUser });
    });

    socket.on("disconnect", () => {
      stableSetConnectionStatus("disconnected");
    });

    socket.on("connect_error", () => {
      stableSetConnectionStatus("reconnecting");
    });

    socket.io.on("reconnect_attempt", () => {
      stableSetConnectionStatus("reconnecting");
    });

    socket.io.on("reconnect", () => {
      stableSetConnectionStatus("connected");
      socket.emit("join", { username: currentUser });
    });

    socket.on("receive_message", (message: Message) => {
      stableAddMessage(message);
    });

    socket.on("receive_private_message", (message: Message) => {
      const target =
        message.username === currentUser
          ? message.recipient!
          : message.username;
      stableAddPrivateMessage(target, message);
    });

    socket.on("system_message", (message: Message) => {
      stableAddMessage(message);
    });

    socket.on("online_users", (users) => {
      stableSetOnlineUsers(users);
    });

    socket.on("typing", (data) => {
      const chatKey =
        data.chatType === "private" && data.recipient
          ? [currentUser, data.recipient].sort().join("__")
          : "public";
      stableAddTypingUser(chatKey, data.username);
    });

    socket.on("stop_typing", (data) => {
      const chatKey =
        data.chatType === "private" && data.recipient
          ? [currentUser, data.recipient].sort().join("__")
          : "public";
      stableRemoveTypingUser(chatKey, data.username);
    });

    socket.on("message_delivered", (data) => {
      stableUpdateMessageStatus(data.messageId, "delivered", true);
    });

    socket.on("message_read", (data) => {
      stableUpdateMessageStatus(data.messageId, "read", true);
    });

    socket.connect();

    return () => {
      connectedRef.current = false;
      socket.removeAllListeners();
      socket.io.removeAllListeners();
      disconnectSocket();
    };
  }, [currentUser]);

  const sendMessage = useCallback(
    (message: string, contentType: string = "text") => {
      const user = useChatStore.getState().currentUser;
      if (!user || !socketRef.current) return;
      socketRef.current.emit("send_message", {
        username: user,
        message,
        contentType,
      });
    },
    []
  );

  const sendPrivateMessage = useCallback(
    (recipient: string, message: string, contentType: string = "text") => {
      const user = useChatStore.getState().currentUser;
      if (!user || !socketRef.current) return;
      socketRef.current.emit("send_private_message", {
        username: user,
        recipient,
        message,
        contentType,
      });
    },
    []
  );

  const joinPrivateChat = useCallback((withUser: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit("join_private_chat", { with: withUser });
  }, []);

  const startTyping = useCallback(
    (chatType: string = "public", recipient: string | null = null) => {
      const user = useChatStore.getState().currentUser;
      if (!user || !socketRef.current) return;
      socketRef.current.emit("typing", {
        username: user,
        chatType,
        recipient,
      });
    },
    []
  );

  const stopTyping = useCallback(
    (chatType: string = "public", recipient: string | null = null) => {
      const user = useChatStore.getState().currentUser;
      if (!user || !socketRef.current) return;
      socketRef.current.emit("stop_typing", {
        username: user,
        chatType,
        recipient,
      });
    },
    []
  );

  return {
    sendMessage,
    sendPrivateMessage,
    joinPrivateChat,
    startTyping,
    stopTyping,
  };
};

export const useMessages = () => {
  const setMessages = useChatStore((s) => s.setMessages);
  const setPrivateMessages = useChatStore((s) => s.setPrivateMessages);

  const fetchMessages = useCallback(async () => {
    try {
      const messages = await chatApi.getMessages(50);
      setMessages(messages.reverse());
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  }, [setMessages]);

  const fetchPrivateMessages = useCallback(
    async (targetUsername: string) => {
      const user = useChatStore.getState().currentUser;
      if (!user) return;
      try {
        const messages = await chatApi.getPrivateMessages(
          user,
          targetUsername,
          50
        );
        setPrivateMessages(targetUsername, messages.reverse());
      } catch (error) {
        console.error("Failed to fetch private messages:", error);
      }
    },
    [setPrivateMessages]
  );

  useEffect(() => {
    const user = useChatStore.getState().currentUser;
    if (user) fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    const unsub = useChatStore.subscribe((state, prev) => {
      if (
        state.privateChatTarget &&
        state.privateChatTarget !== prev.privateChatTarget
      ) {
        fetchPrivateMessages(state.privateChatTarget.username);
      }
    });
    return unsub;
  }, [fetchPrivateMessages]);

  return { fetchMessages, fetchPrivateMessages };
};
