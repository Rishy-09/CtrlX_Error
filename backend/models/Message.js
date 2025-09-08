import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    content: {
      type: String,
      required: true,
    },
    attachments: [{
      filename: String,
      path: String,
      mimetype: String,
    }],
    mentions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    reactions: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      emoji: String,
    }],
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isAIMessage: {
      type: Boolean,
      default: false,
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    readBy: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      readAt: {
        type: Date,
        default: Date.now,
      },
    }],
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", MessageSchema);
export default Message; 