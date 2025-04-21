import asyncHandler from "express-async-handler";
import Attachment from "../models/Attachment.js";
import Task from "../models/Task.js";
import Bug from "../models/Bug.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Configure file filter
const fileFilter = (req, file, cb) => {
  // Accept all file types for now, can be restricted later
  cb(null, true);
};

// Initialize upload middleware
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
}).array('files', 5); // Allow up to 5 files per upload

// @desc    Upload attachments
// @route   POST /api/attachments/upload
// @access  Private
const uploadAttachments = asyncHandler(async (req, res) => {
  upload(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      res.status(400);
      throw new Error(`Upload error: ${err.message}`);
    } else if (err) {
      res.status(500);
      throw new Error(`Server error: ${err.message}`);
    }

    // Get bug or comment ID from query parameters
    const { bugId, commentId } = req.query;
    
    if (!bugId && !commentId) {
      res.status(400);
      throw new Error('Either bugId or commentId must be provided');
    }

    const attachments = [];
    
    // Process each uploaded file
    for (const file of req.files) {
      const attachment = await Attachment.create({
        filename: file.filename,
        originalFilename: file.originalname,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size,
        uploadedBy: req.user._id,
        bug: bugId || null,
        comment: commentId || null,
      });
      
      attachments.push(attachment);
    }

    res.status(201).json({ 
      success: true, 
      count: attachments.length,
      data: attachments
    });
  });
});

// @desc    Get attachment by ID
// @route   GET /api/attachments/:id
// @access  Private
const getAttachment = asyncHandler(async (req, res) => {
  const attachment = await Attachment.findById(req.params.id);

  if (!attachment) {
    res.status(404);
    throw new Error('Attachment not found');
  }

  res.status(200).json(attachment);
});

// @desc    Delete attachment
// @route   DELETE /api/attachments/:id
// @access  Private
const deleteAttachment = asyncHandler(async (req, res) => {
  const attachment = await Attachment.findById(req.params.id);

  if (!attachment) {
    res.status(404);
    throw new Error('Attachment not found');
  }

  // Check if user is authorized to delete
  if (attachment.uploadedBy.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to delete this attachment');
  }

  // Delete file from filesystem
  fs.unlink(attachment.path, async (err) => {
    if (err) {
      console.error('Error deleting file:', err);
      // Continue with deletion from database even if file removal fails
    }
    
    // Remove from database
    await attachment.deleteOne();
    
    res.status(200).json({ 
      success: true, 
      message: 'Attachment removed' 
    });
  });
});

// @desc    Download attachment
// @route   GET /api/attachments/download/:id
// @access  Private
const downloadAttachment = asyncHandler(async (req, res) => {
  const attachment = await Attachment.findById(req.params.id);

  if (!attachment) {
    res.status(404);
    throw new Error('Attachment not found');
  }

  // Check if file exists
  if (!fs.existsSync(attachment.path)) {
    res.status(404);
    throw new Error('File not found on server');
  }

  // Set appropriate headers
  res.setHeader('Content-Type', attachment.mimetype);
  res.setHeader('Content-Disposition', `attachment; filename=${attachment.filename}`);
  
  // Stream the file
  const fileStream = fs.createReadStream(attachment.path);
  fileStream.pipe(res);
});

export {
  uploadAttachments,
  getAttachment,
  deleteAttachment,
  downloadAttachment,
}; 