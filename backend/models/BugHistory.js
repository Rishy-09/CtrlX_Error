import mongoose from "mongoose"

const BugHistorySchema = new mongoose.Schema({
  bug: { type: mongoose.Schema.Types.ObjectId, ref: "Bug", required: true },
  action: { type: String, required: true }, // e.g., "Status Updated", "Assigned"
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  timestamp: { type: Date, default: Date.now }
});

const BugHistory = mongoose.model("BugHistory", BugHistorySchema);
export default BugHistory