import mongoose from "mongoose";

const attachmentSchema = new mongoose.Schema(
    {
        filename: {
            type: String,
            required: true,
        },
        originalFilename: {
            type: String,
            required: true,
        },
        path: {
            type: String,
            required: true,
        },
        mimetype: {
            type: String,
            required: true,
        },
        size: {
            type: Number, // Size in bytes
            required: true,
        },
        bug: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Bug",
            required: false, // May be related to a comment only
        },
        comment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
            required: false, // May be related to a bug only
        },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { 
        timestamps: true 
    }
);

// Indexing for better performance
attachmentSchema.index({ bug: 1 });
attachmentSchema.index({ comment: 1 });
attachmentSchema.index({ uploadedBy: 1 });

const Attachment = mongoose.model("Attachment", attachmentSchema);
export default Attachment; 