import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        chat: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Chat",
            required: true,
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        content: {
            type: String,
            required: true,
            trim: true,
        },
        attachments: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Attachment",
            }
        ],
        isAIMessage: {
            type: Boolean,
            default: false,
        },
        mentions: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            }
        ],
        readBy: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },
                readAt: {
                    type: Date,
                    default: Date.now,
                }
            }
        ],
        isDeleted: {
            type: Boolean,
            default: false,
        },
        replyTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
            default: null,
        },
        reactions: [
            {
                emoji: {
                    type: String,
                    required: true,
                },
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true,
                }
            }
        ]
    },
    {
        timestamps: true
    }
);

// Indexes for better performance
messageSchema.index({ chat: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ mentions: 1 });
messageSchema.index({ "readBy.user": 1 });

const Message = mongoose.model("Message", messageSchema);
export default Message; 