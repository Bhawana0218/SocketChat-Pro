import { Message, IMessage, ChatType, ContentType } from "../models/Message";

export class MessageService {
  async createMessage(
    username: string,
    message: string,
    chatType: ChatType = "public",
    recipient: string | null = null,
    messageType: "message" | "system" = "message",
    event: string | null = null,
    contentType: ContentType = "text"
  ): Promise<IMessage> {
    const newMessage = new Message({
      username,
      message,
      chatType,
      recipient,
      messageType,
      event,
      contentType,
    });
    return await newMessage.save();
  }

  async getMessages(limit: number = 50, before?: string) {
    const query: Record<string, unknown> = { chatType: "public" };
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }
    return await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  async getPrivateMessages(
    user1: string,
    user2: string,
    limit: number = 50,
    before?: string
  ) {
    const query: Record<string, unknown> = {
      chatType: "private",
      $or: [
        { username: user1, recipient: user2 },
        { username: user2, recipient: user1 },
      ],
    };
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }
    return await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  async markAsDelivered(messageId: string): Promise<IMessage | null> {
    return await Message.findByIdAndUpdate(
      messageId,
      { delivered: true },
      { new: true }
    );
  }

  async markAsRead(messageId: string): Promise<IMessage | null> {
    return await Message.findByIdAndUpdate(
      messageId,
      { read: true, delivered: true },
      { new: true }
    );
  }

  async markAllAsDelivered(username: string): Promise<void> {
    await Message.updateMany(
      { username: { $ne: username }, delivered: false, chatType: "public" },
      { delivered: true }
    );
  }

  async markPrivateAsDelivered(sender: string, recipient: string): Promise<void> {
    await Message.updateMany(
      { username: sender, recipient: recipient, delivered: false },
      { delivered: true }
    );
  }
}

export const messageService = new MessageService();
