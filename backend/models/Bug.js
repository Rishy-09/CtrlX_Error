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

const bugSchema = new mongoose.Schema(
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
            enum: ["Low", "Medium", "High", "Critical"],
            default: "Medium",
        },
        severity: {
            type: String,
            enum: ["Minor", "Major", "Critical", "Blocker"],
            default: "Minor",
        },
        status: {
            type: String,
            enum: ["Open", "In Progress", "Testing", "Closed", "Reopened"],
            default: "Open",
        },
        bugType: {
            type: String,
            enum: ["Functional", "UI/UX", "Performance", "Security", "Compatibility", "Other"],
            default: "Functional",
        },
        environment: {
            type: String,
            enum: ["Development", "Staging", "Production"],
            default: "Development",
        },
        version: {
            type: String,
            default: "1.0",
        },
        dueDate: {
            type: Date,
            required: false,
        },
        reporter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        assignedTo: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            }
        ],
        watchers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            }
        ],
        stepsToReproduce: {
            type: String,
            default: "",
        },
        attachments: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Attachment",
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
                type: mongoose.Schema.Types.ObjectId,
                ref: "Comment",
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
                ref: "Bug"
            }
        ],
        blockedBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Bug"
            }
        ]
    },
    { 
        timestamps: true 
    }
);

// Indexing for better performance
bugSchema.index({ status: 1 });
bugSchema.index({ priority: 1 });
bugSchema.index({ assignedTo: 1 });
bugSchema.index({ reporter: 1 });
bugSchema.index({ createdAt: -1 });

const Bug = mongoose.model("Bug", bugSchema);
export default Bug; 