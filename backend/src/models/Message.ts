import mongoose, { Schema, Document } from "mongoose";

export type ChatType = "public" | "private";
export type MessageType = "message" | "system";
export type ContentType = "text" | "voice" | "sticker";

export interface IMessage extends Document {
  username: string;
  message: string;
  createdAt: Date;
  delivered: boolean;
  read: boolean;
  chatType: ChatType;
  recipient: string | null;
  messageType: MessageType;
  event: string | null;
  contentType: ContentType;
}

const messageSchema = new Schema<IMessage>(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
      maxlength: [30, "Username cannot exceed 30 characters"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxlength: [50000, "Message cannot exceed 50KB"],
    },
    delivered: {
      type: Boolean,
      default: false,
    },
    read: {
      type: Boolean,
      default: false,
    },
    chatType: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
    recipient: {
      type: String,
      default: null,
      trim: true,
    },
    messageType: {
      type: String,
      enum: ["message", "system"],
      default: "message",
    },
    event: {
      type: String,
      default: null,
    },
    contentType: {
      type: String,
      enum: ["text", "voice", "sticker"],
      default: "text",
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ createdAt: -1 });
messageSchema.index({ chatType: 1, recipient: 1, username: 1 });
messageSchema.index({ messageType: 1 });

export const Message = mongoose.model<IMessage>("Message", messageSchema);
