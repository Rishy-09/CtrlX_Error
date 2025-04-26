import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            default: "",
        },
        chatType: {
            type: String,
            enum: ["public", "team", "private", "ai_assistant"],
            default: "public"
        },
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ],
        admins: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ],
        isActive: {
            type: Boolean,
            default: true
        },
        associatedBug: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Bug",
            default: null
        },
        lastMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
            default: null
        },
        aiAssistant: {
            enabled: {
                type: Boolean,
                default: false
            },
            model: {
                type: String,
                default: "openai/gpt-3.5-turbo"
            },
            systemPrompt: {
                type: String,
                default: "You are a helpful AI assistant that helps the team solve technical issues."
            }
        }
    },
    {
        timestamps: true
    }
);

// Indexes for better performance
chatSchema.index({ chatType: 1 });
chatSchema.index({ participants: 1 });
chatSchema.index({ associatedBug: 1 });

const Chat = mongoose.model("Chat", chatSchema);
export default Chat; 