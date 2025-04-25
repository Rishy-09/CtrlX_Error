import mongoose from "mongoose";

const BugSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot be more than 100 characters"]
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [5000, "Description cannot be more than 5000 characters"]
    },
    steps: {
      type: String,
      trim: true,
      maxlength: [5000, "Steps to reproduce cannot be more than 5000 characters"]
    },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Testing", "Closed", "Reopened"],
      default: "Open"
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium"
    },
    severity: {
      type: String,
      enum: ["Minor", "Major", "Critical", "Blocker"],
      default: "Minor"
    },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    todoChecklist: [
      {
        item: {
          type: String,
          required: true
        },
        completed: {
          type: Boolean,
          default: false
        },
        completedAt: {
          type: Date,
          default: null
        },
        completedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          default: null
        }
      }
    ],
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    attachments: [
      {
        filename: String,
        path: String,
        mimetype: String,
        size: Number,
        uploadedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    environment: {
      type: String,
      trim: true
    },
    browser: {
      type: String,
      trim: true
    },
    os: {
      type: String,
      trim: true
    },
    version: {
      type: String,
      trim: true
    },
    dueDate: {
      type: Date,
      default: null
    },
    closedAt: {
      type: Date,
      default: null
    },
    closedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    bugType: {
      type: String,
      enum: ["Functional", "UI/UX", "Performance", "Security", "Compatibility", "Other"],
      default: "Functional"
    }
  },
  {
    timestamps: true
  }
);

// Indexing for better performance
BugSchema.index({ status: 1 });
BugSchema.index({ priority: 1 });
BugSchema.index({ assignedTo: 1 });
BugSchema.index({ reporter: 1 });
BugSchema.index({ createdAt: -1 });

const Bug = mongoose.model("Bug", BugSchema);
export default Bug; 