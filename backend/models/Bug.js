import mongoose from "mongoose";

const checklistItemSchema = new mongoose.Schema({
    text: {
        type: String,
        required: [true, "Checklist item text is required"],
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    completedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    completedAt: {
        type: Date
    }
});

const bugSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Title is required"],
            trim: true,
            minlength: [5, "Title must be at least 5 characters long"],
        },
        description: {
            type: String,
            required: [true, "Description is required"],
            trim: true,
            minlength: [10, "Description must be at least 10 characters long"]
        },
        priority: {
            type: String,
            enum: ["Low", "Medium", "High"],
            default: "Medium",
            required: true
        },
        severity: {
            type: String,
            enum: ["Minor", "Major", "Critical"],
            default: "Minor",
            required: true
        },
        status: {
            type: String,
            enum: ["Open", "In Progress", "Closed"],
            default: "Open",
            required: true
        },
        dueDate: {
            type: Date,
            validate: {
                validator: function(value) {
                    if (!value) return true;
                    return value > new Date();
                },
                message: "Due date must be in the future"
            }
        },
        module: {
            type: String,
            trim: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        assignedTo: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "At least one developer must be assigned"]
        }],
        attachments: [{
            type: String,
            trim: true
        }],
        checklist: {
            type: [checklistItemSchema],
            validate: {
                validator: function(v) {
                    return Array.isArray(v);
                },
                message: "Checklist must be an array"
            }
        },
        lastUpdatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        updateHistory: [{
            field: String,
            oldValue: mongoose.Schema.Types.Mixed,
            newValue: mongoose.Schema.Types.Mixed,
            updatedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            updatedAt: {
                type: Date,
                default: Date.now
            }
        }]
    },
    {
        timestamps: true
    }
);

// Add index for better query performance
bugSchema.index({ createdBy: 1, status: 1 });
bugSchema.index({ assignedTo: 1, status: 1 });
bugSchema.index({ title: "text", description: "text" });

// Pre-save middleware to track updates
bugSchema.pre('save', function(next) {
    if (this.isModified()) {
        const modifiedFields = this.modifiedPaths();
        modifiedFields.forEach(field => {
            if (field !== 'updateHistory' && field !== 'lastUpdatedBy') {
                this.updateHistory.push({
                    field,
                    oldValue: this.get(field),
                    newValue: this.get(field),
                    updatedBy: this.lastUpdatedBy
                });
            }
        });
    }
    next();
});

const Bug = mongoose.model("Bug", bugSchema);
export default Bug;
