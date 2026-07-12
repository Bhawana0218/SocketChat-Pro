import { create } from "zustand";
import type {
  ChatState,
  Message,
  ConnectionStatus,
  ChatView,
  PrivateChatTarget,
  UserPresence,
  CallInfo,
} from "@/types/chat";

const getStoredUser = (): string | null => {
  try {
    return localStorage.getItem("socketchat_user");
  } catch {
    return null;
  }
};

const setStoredUser = (username: string | null): void => {
  try {
    if (username) localStorage.setItem("socketchat_user", username);
    else localStorage.removeItem("socketchat_user");
  } catch {}
};

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  privateMessages: new Map(),
  onlineUsers: [],
  typingUsers: new Map(),
  connectionStatus: "disconnected",
  currentUser: getStoredUser(),
  isLoggedIn: !!getStoredUser(),
  activeChat: "public",
  privateChatTarget: null,
  callInfo: { state: "idle", peer: "", callType: "voice" },

  setMessages: (messages: Message[]) => set({ messages }),

  addMessage: (message: Message) =>
    set((state) => {
      if (state.messages.some((m) => m._id === message._id)) return state;
      return { messages: [...state.messages, message] };
    }),

  setPrivateMessages: (target: string, messages: Message[]) =>
    set((state) => {
      const newMap = new Map(state.privateMessages);
      newMap.set(target, messages);
      return { privateMessages: newMap };
    }),

  addPrivateMessage: (target: string, message: Message) =>
    set((state) => {
      const newMap = new Map(state.privateMessages);
      const existing = newMap.get(target) || [];
      if (existing.some((m) => m._id === message._id)) return state;
      newMap.set(target, [...existing, message]);
      return { privateMessages: newMap };
    }),

  setOnlineUsers: (users: UserPresence[]) => set({ onlineUsers: users }),

  addTypingUser: (chatKey: string, username: string) =>
    set((state) => {
      const newMap = new Map(state.typingUsers);
      const existing = newMap.get(chatKey) || [];
      if (existing.includes(username)) return state;
      newMap.set(chatKey, [...existing, username]);
      return { typingUsers: newMap };
    }),

  removeTypingUser: (chatKey: string, username: string) =>
    set((state) => {
      const newMap = new Map(state.typingUsers);
      const existing = newMap.get(chatKey) || [];
      newMap.set(chatKey, existing.filter((u) => u !== username));
      return { typingUsers: newMap };
    }),

  setConnectionStatus: (status: ConnectionStatus) => set({ connectionStatus: status }),

  setCurrentUser: (username: string) => {
    setStoredUser(username);
    set({ currentUser: username, isLoggedIn: true });
  },

  setActiveChat: (chat: ChatView) => set({ activeChat: chat }),

  setPrivateChatTarget: (target: PrivateChatTarget | null) =>
    set({ privateChatTarget: target, activeChat: target ? "private" : "public" }),

  setCallInfo: (info: CallInfo) => set({ callInfo: info }),

  logout: () => {
    setStoredUser(null);
    set({
      currentUser: null,
      isLoggedIn: false,
      messages: [],
      privateMessages: new Map(),
      onlineUsers: [],
      typingUsers: new Map(),
      activeChat: "public",
      privateChatTarget: null,
      callInfo: { state: "idle", peer: "", callType: "voice" },
    });
  },

  updateMessageStatus: (messageId: string, field: "delivered" | "read", value: boolean) =>
    set((state) => {
      const newPrivate = new Map(state.privateMessages);
      for (const [key, msgs] of newPrivate) {
        newPrivate.set(
          key,
          msgs.map((m) => (m._id === messageId ? { ...m, [field]: value } : m))
        );
      }
      return {
        messages: state.messages.map((m) =>
          m._id === messageId ? { ...m, [field]: value } : m
        ),
        privateMessages: newPrivate,
      };
    }),
}));
