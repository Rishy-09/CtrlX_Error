import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["public", "team", "private", "ai_assistant"],
      default: "private",
    },
    participants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    admins: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    aiAssistant: {
      enabled: {
        type: Boolean,
        default: false,
      },
      model: {
        type: String,
        enum: ["gpt-3.5-turbo", "gpt-4", "claude-3-sonnet", "claude-3-opus"],
        default: "gpt-3.5-turbo",
      },
      systemPrompt: {
        type: String,
        default: "You are a helpful assistant in a bug tracking application.",
      },
    },
  },
  { timestamps: true }
);

const Chat = mongoose.model("Chat", ChatSchema);
export default Chat; 