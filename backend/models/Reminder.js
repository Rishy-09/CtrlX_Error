import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema(
    {
        task: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Task",
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        reminderDate: {
            type: Date,
            required: true,
        },
        message: {
            type: String,
            default: "Reminder for your task!",
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        }
    },
    { 
        timestamps: true 
    }
);

// Index for faster reminder fetching
reminderSchema.index({ user: 1, isRead: 1 });
reminderSchema.index({ reminderDate: 1, isActive: 1 });

const Reminder = mongoose.model("Reminder", reminderSchema);
export default Reminder; 