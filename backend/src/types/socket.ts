export interface ServerToClientEvents {
  receive_message: (message: ChatMessage) => void;
  receive_private_message: (message: ChatMessage) => void;
  user_joined: (data: { username: string; onlineUsers: UserPresence[] }) => void;
  user_left: (data: { username: string; onlineUsers: UserPresence[] }) => void;
  system_message: (message: ChatMessage) => void;
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

export interface ChatMessage {
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

export interface SignalData {
  type: "offer" | "answer" | "ice-candidate";
  sdp?: unknown;
  candidate?: unknown;
}

export interface SocketData {
  username: string;
}
