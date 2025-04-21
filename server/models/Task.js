import mongoose from "mongoose";

const todoSchema = new mongoose.Schema(
    {
        text: {
            type: String,
            required: true,
        },
        completed: {
            type: Boolean,
            default: false,
        },
    }
);

const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            default: null,
        },
        priority: {
            type: String,
            enum: ["Low", "Medium", "High"],
            default: "Medium",
        },
        status: {
            type: String,
            enum: ["Pending", "In Progress", "Completed"],
            default: "Pending",
        },
        dueDate: {
            type: Date,
            required: true,
        },
        assignedTo: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            }
        ],
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        attachments: [
            {
                type: String,
            }
        ],
        todoChecklist: [
            todoSchema
        ],
        progress: {
            type: Number,
            default: 0,
        },
        comments: [
            {
                text: {
                    type: String,
                    required: true
                },
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true
                },
                createdAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        timeEntries: [
            {
                startTime: {
                    type: Date,
                    required: true
                },
                endTime: {
                    type: Date,
                    default: null
                },
                duration: {
                    type: Number, // Duration in minutes
                    default: 0
                },
                description: {
                    type: String,
                    default: ""
                },
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true
                }
            }
        ],
        totalTimeSpent: {
            type: Number, // Total time spent in minutes
            default: 0
        },
        dependencies: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Task"
            }
        ],
        blockedBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Task"
            }
        ]
    },
    { 
        timestamps: true 
    }
);

const Task = mongoose.model("Task", taskSchema);
export default Task;