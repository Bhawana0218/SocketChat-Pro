export interface Message {
  _id: string;
  username: string;
  message: string;
  createdAt: string;
  delivered: boolean;
  read: boolean;
  chatType: "public" | "private";
  recipient: string | null;
  messageType: "message" | "system";
  event: string | null;
  contentType: "text" | "voice" | "sticker";
}

export interface UserPresence {
  username: string;
  lastSeen: string;
  isOnline: boolean;
}

export type ConnectionStatus = "connected" | "reconnecting" | "disconnected";
export type ChatView = "public" | "private";

export interface PrivateChatTarget {
  username: string;
  lastSeen: string;
  isOnline: boolean;
}

export interface SignalData {
  type: "offer" | "answer" | "ice-candidate";
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
}

export type CallState = "idle" | "calling" | "ringing" | "connected";

export interface CallInfo {
  state: CallState;
  peer: string;
  callType: "voice" | "video";
}

export interface ServerToClientEvents {
  receive_message: (message: Message) => void;
  receive_private_message: (message: Message) => void;
  user_joined: (data: { username: string; onlineUsers: UserPresence[] }) => void;
  user_left: (data: { username: string; onlineUsers: UserPresence[] }) => void;
  system_message: (message: Message) => void;
  typing: (data: { username: string; chatType: string; recipient: string | null }) => void;
  stop_typing: (data: { username: string; chatType: string; recipient: string | null }) => void;
  online_users: (users: UserPresence[]) => void;
  message_delivered: (data: { messageId: string }) => void;
  message_read: (data: { messageId: string }) => void;
  call_invite: (data: { from: string; callType: "voice" | "video" }) => void;
  call_accept: (data: { from: string }) => void;
  call_reject: (data: { from: string }) => void;
  call_end: (data: { from: string }) => void;
  call_signal: (data: { from: string; signal: SignalData }) => void;
}

export interface ClientToServerEvents {
  join: (data: { username: string }) => void;
  send_message: (data: { username: string; message: string; contentType?: string }) => void;
  send_private_message: (data: { username: string; recipient: string; message: string; contentType?: string }) => void;
  typing: (data: { username: string; chatType: string; recipient: string | null }) => void;
  stop_typing: (data: { username: string; chatType: string; recipient: string | null }) => void;
  mark_delivered: (data: { messageId: string }) => void;
  mark_read: (data: { messageId: string; chatType: string; recipient: string | null }) => void;
  join_private_chat: (data: { with: string }) => void;
  call_invite: (data: { to: string; callType: "voice" | "video" }) => void;
  call_accept: (data: { to: string }) => void;
  call_reject: (data: { to: string }) => void;
  call_end: (data: { to: string }) => void;
  call_signal: (data: { to: string; signal: SignalData }) => void;
}

export interface ChatState {
  messages: Message[];
  privateMessages: Map<string, Message[]>;
  onlineUsers: UserPresence[];
  typingUsers: Map<string, string[]>;
  connectionStatus: ConnectionStatus;
  currentUser: string | null;
  isLoggedIn: boolean;
  activeChat: ChatView;
  privateChatTarget: PrivateChatTarget | null;
  callInfo: CallInfo;

  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  setPrivateMessages: (target: string, messages: Message[]) => void;
  addPrivateMessage: (target: string, message: Message) => void;
  setOnlineUsers: (users: UserPresence[]) => void;
  addTypingUser: (chatKey: string, username: string) => void;
  removeTypingUser: (chatKey: string, username: string) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  setCurrentUser: (username: string) => void;
  setActiveChat: (chat: ChatView) => void;
  setPrivateChatTarget: (target: PrivateChatTarget | null) => void;
  setCallInfo: (info: CallInfo) => void;
  logout: () => void;
  updateMessageStatus: (messageId: string, field: "delivered" | "read", value: boolean) => void;
}
