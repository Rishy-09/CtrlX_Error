import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
    {
        bug: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Bug",
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        text: {
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
        mentions: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            }
        ],
        isEdited: {
            type: Boolean,
            default: false,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
        parentComment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
            default: null,
        },
    },
    { 
        timestamps: true 
    }
);

// Indexing for better performance
commentSchema.index({ bug: 1, createdAt: -1 });
commentSchema.index({ user: 1 });
commentSchema.index({ parentComment: 1 });

const Comment = mongoose.model("Comment", commentSchema);
export default Comment; 