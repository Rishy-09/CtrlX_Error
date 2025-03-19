import Comment from "../models/Comment.js";
import Bug from "../models/Bug.js";

// Add a Comment to a Bug
export const addComment = async (req, res) => {
  try {
    const { text } = req.body;

    // Check if the bug exists
    const bugExists = await Bug.findById(req.params.bugId);
    if (!bugExists) return res.status(404).json({ message: "Bug not found" });

    const comment = new Comment({ bug: req.params.bugId, user: req.user.id, text });
    await comment.save();

    res.status(201).json(comment);

    // Emit WebSocket event to notify others about the new comment
    const io = req.app.get("io");
    io.emit("newComment", { bugId: req.params.bugId, comment });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get All Comments for a Bug
export const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ bug: req.params.bugId }).populate("user", "name");
    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a Comment (Only the author can delete it)
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // 🔹 Ensure only the comment author can delete it
    if (comment.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized: Only the author can delete this comment" });
    }

    await comment.deleteOne();
    res.status(200).json({ message: "Comment deleted successfully" });

    // Emit WebSocket event to notify others
    const io = req.app.get("io");
    io.emit("commentDeleted", { commentId: req.params.commentId });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
