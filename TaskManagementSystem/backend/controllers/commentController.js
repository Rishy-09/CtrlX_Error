import Comment from "../models/Comment.js";
import Bug from "../models/Bug.js";
import Attachment from "../models/Attachment.js";

// @desc    Add comment to a bug
// @route   POST /api/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const { bugId, text, mentions, parentComment } = req.body;
    
    if (!bugId || !text) {
      return res.status(400).json({
        message: "Bug ID and comment text are required"
      });
    }

    // Check if bug exists
    const bug = await Bug.findById(bugId);
    if (!bug) {
      return res.status(404).json({
        message: "Bug not found"
      });
    }

    // Check if parent comment exists, if provided
    if (parentComment) {
      const parentCommentExists = await Comment.findById(parentComment);
      if (!parentCommentExists) {
        return res.status(404).json({
          message: "Parent comment not found"
        });
      }
    }

    // Create the comment
    const comment = await Comment.create({
      bug: bugId,
      user: req.user._id,
      text,
      mentions: mentions || [],
      parentComment: parentComment || null
    });

    // Handle file attachments if any
    if (req.files && req.files.length > 0) {
      const attachmentPromises = req.files.map(async (file) => {
        const attachment = await Attachment.create({
          filename: file.filename,
          originalFilename: file.originalname,
          path: file.path,
          mimetype: file.mimetype,
          size: file.size,
          comment: comment._id,
          bug: bugId,
          uploadedBy: req.user._id
        });
        
        return attachment._id;
      });
      
      const attachmentIds = await Promise.all(attachmentPromises);
      
      // Update comment with attachment IDs
      comment.attachments = attachmentIds;
      await comment.save();
    }

    // Add comment to bug's comments array
    bug.comments.push(comment._id);
    await bug.save();

    // Return the populated comment
    const populatedComment = await Comment.findById(comment._id)
      .populate("user", "name email profileImageURL")
      .populate("mentions", "name email profileImageURL")
      .populate({
        path: "attachments",
        select: "filename originalFilename mimetype size"
      });

    res.status(201).json({
      message: "Comment added successfully",
      comment: populatedComment
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message
    });
  }
};

// @desc    Get comments for a bug
// @route   GET /api/comments/:bugId
// @access  Private
const getComments = async (req, res) => {
  try {
    const { bugId } = req.params;
    
    // Check if bug exists
    const bug = await Bug.findById(bugId);
    if (!bug) {
      return res.status(404).json({
        message: "Bug not found"
      });
    }

    // Get comments for the bug
    const comments = await Comment.find({ bug: bugId, isDeleted: false })
      .populate("user", "name email profileImageURL")
      .populate("mentions", "name email profileImageURL")
      .populate({
        path: "attachments",
        select: "filename originalFilename mimetype size"
      })
      .sort({ createdAt: 1 }); // Oldest first

    res.json({
      comments
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message
    });
  }
};

// @desc    Update a comment
// @route   PUT /api/comments/:id
// @access  Private
const updateComment = async (req, res) => {
  try {
    const { text, mentions } = req.body;
    
    // Find the comment
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({
        message: "Comment not found"
      });
    }
    
    // Check if user is the owner of the comment
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to update this comment"
      });
    }
    
    // Update the comment
    comment.text = text || comment.text;
    comment.mentions = mentions || comment.mentions;
    comment.isEdited = true;
    
    // Handle new attachments if any
    if (req.files && req.files.length > 0) {
      const attachmentPromises = req.files.map(async (file) => {
        const attachment = await Attachment.create({
          filename: file.filename,
          originalFilename: file.originalname,
          path: file.path,
          mimetype: file.mimetype,
          size: file.size,
          comment: comment._id,
          bug: comment.bug,
          uploadedBy: req.user._id
        });
        
        return attachment._id;
      });
      
      const attachmentIds = await Promise.all(attachmentPromises);
      
      // Add new attachments to existing ones
      comment.attachments = [...comment.attachments, ...attachmentIds];
    }
    
    await comment.save();
    
    // Return the updated comment
    const updatedComment = await Comment.findById(comment._id)
      .populate("user", "name email profileImageURL")
      .populate("mentions", "name email profileImageURL")
      .populate({
        path: "attachments",
        select: "filename originalFilename mimetype size"
      });
    
    res.json({
      message: "Comment updated successfully",
      comment: updatedComment
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message
    });
  }
};

// @desc    Delete a comment (soft delete)
// @route   DELETE /api/comments/:id
// @access  Private
const deleteComment = async (req, res) => {
  try {
    // Find the comment
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({
        message: "Comment not found"
      });
    }
    
    // Check if user is the owner of the comment or an admin
    if (comment.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Not authorized to delete this comment"
      });
    }
    
    // Soft delete the comment
    comment.isDeleted = true;
    await comment.save();
    
    res.json({
      message: "Comment deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message
    });
  }
};

// @desc    Get replies for a comment
// @route   GET /api/comments/:id/replies
// @access  Private
const getCommentReplies = async (req, res) => {
  try {
    // Find the comment
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({
        message: "Comment not found"
      });
    }
    
    // Get replies for the comment
    const replies = await Comment.find({ 
      parentComment: req.params.id,
      isDeleted: false 
    })
      .populate("user", "name email profileImageURL")
      .populate("mentions", "name email profileImageURL")
      .populate({
        path: "attachments",
        select: "filename originalFilename mimetype size"
      })
      .sort({ createdAt: 1 }); // Oldest first
    
    res.json({
      replies
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message
    });
  }
};

export {
  addComment,
  getComments,
  updateComment,
  deleteComment,
  getCommentReplies
}; 