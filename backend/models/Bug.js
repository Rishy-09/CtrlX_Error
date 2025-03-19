import mongoose from 'mongoose';

const BugSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  severity: { type: String, enum: ["Low", "Medium", "High", "Critical"], required: true },
  status: { type: String, enum: ["Open", "In Progress", "Resolved", "Closed"], default: "Open" },
  assignees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Multiple assignees
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  priority: { type: String, enum: ["Low", "Medium", "High", "Critical"], default: "Medium" }, // Priority level
  attachments: [{ type: String }], // Array of file URLs
  createdAt: { type: Date, default: Date.now }
});

const Bug = mongoose.model("Bug", BugSchema);
export default Bug
