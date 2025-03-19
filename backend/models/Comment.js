import mongoose from "mongoose"

const CommentSchema = new mongoose.Schema({
  bug: { type: mongoose.Schema.Types.ObjectId, ref: "Bug", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true }, // the actual comment text
  createdAt: { type: Date, default: Date.now } // Timestamp when the comment created
});

const Comment = mongoose.model("Comment", CommentSchema)
export default Comment
