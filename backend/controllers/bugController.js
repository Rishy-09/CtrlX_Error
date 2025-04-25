import Bug from "../models/Bug.js";
import Attachment from "../models/Attachment.js";
import Comment from "../models/Comment.js";
import User from "../models/User.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// @desc    Get all bugs (Admin/Developer: all, Tester: only reported bugs)
// @route   GET /api/bugs/
// @access  Private
const getBugs = async (req, res) => {
  try {
    const { status, priority, severity, assignedTo, reporter, environment, bugType } = req.query;

    let filter = {};

    // Apply filters if provided
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (severity) filter.severity = severity;
    if (environment) filter.environment = environment;
    if (bugType) filter.bugType = bugType;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (reporter) filter.reporter = reporter;

    let bugs;

    // Role-based access control
    if (req.user.role === "admin" || req.user.role === "developer") {
      // Admins and developers can see all bugs
      if (req.user.role === "developer" && !assignedTo) {
        // If developer and no assignedTo filter, show assigned to them by default
        filter.assignedTo = req.user._id;
      }
      
      bugs = await Bug.find(filter)
        .populate("reporter", "name email profileImageURL")
        .populate("assignedTo", "name email profileImageURL")
        .sort({ createdAt: -1 });
    } else {
      // Testers can only see bugs they reported or are assigned to
      bugs = await Bug.find({
        ...filter,
        $or: [
          { reporter: req.user._id },
          { assignedTo: req.user._id }
        ]
      })
        .populate("reporter", "name email profileImageURL")
        .populate("assignedTo", "name email profileImageURL")
        .sort({ createdAt: -1 });
    }

    // Add completed todoChecklist count to each bug
    bugs = await Promise.all(
      bugs.map(async (bug) => {
        const completedCount = bug.todoChecklist.filter(
          (item) => item.completed
        ).length;
        return {
          ...bug._doc,
          completedCount: completedCount,
        };
      })
    );

    // Status summary counts
    const allBugs = await Bug.countDocuments(
      req.user.role === "admin" || req.user.role === "developer" 
        ? {}
        : { $or: [{ reporter: req.user._id }, { assignedTo: req.user._id }] }
    );

    const openBugs = await Bug.countDocuments({
      ...filter,
      status: "Open",
      ...(req.user.role === "tester" && { 
        $or: [{ reporter: req.user._id }, { assignedTo: req.user._id }] 
      }),
    });

    const inProgressBugs = await Bug.countDocuments({
      ...filter,
      status: "In Progress",
      ...(req.user.role === "tester" && { 
        $or: [{ reporter: req.user._id }, { assignedTo: req.user._id }] 
      }),
    });

    const testingBugs = await Bug.countDocuments({
      ...filter,
      status: "Testing",
      ...(req.user.role === "tester" && { 
        $or: [{ reporter: req.user._id }, { assignedTo: req.user._id }] 
      }),
    });

    const closedBugs = await Bug.countDocuments({
      ...filter,
      status: "Closed",
      ...(req.user.role === "tester" && { 
        $or: [{ reporter: req.user._id }, { assignedTo: req.user._id }] 
      }),
    });

    const reopenedBugs = await Bug.countDocuments({
      ...filter,
      status: "Reopened",
      ...(req.user.role === "tester" && { 
        $or: [{ reporter: req.user._id }, { assignedTo: req.user._id }] 
      }),
    });

    res.json({
      bugs,
      statusSummary: {
        all: allBugs,
        openBugs,
        inProgressBugs,
        testingBugs,
        closedBugs,
        reopenedBugs,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Get bug by ID
// @route   GET /api/bugs/:id
// @access  Private
const getBugById = async (req, res) => {
  try {
    const bug = await Bug.findById(req.params.id)
      .populate("reporter", "name email profileImageURL")
      .populate("assignedTo", "name email profileImageURL")
      .populate("comments");

    if (!bug) {
      return res.status(404).json({
        message: "Bug not found",
      });
    }
    
    // Check if user is authorized to view this bug
    if (req.user.role === "tester" && 
        !bug.reporter.equals(req.user._id) && 
        !bug.assignedTo.some(user => user._id.equals(req.user._id))) {
      return res.status(403).json({
        message: "Not authorized to view this bug",
      });
    }
    
    res.json({
      bug,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Create a new bug
// @route   POST /api/bugs/
// @access  Private
const createBug = async (req, res) => {
  try {
    const {
      title,
      description,
      priority,
      severity,
      bugType,
      environment,
      version,
      stepsToReproduce,
      assignedTo,
      todoChecklist,
    } = req.body;

    // Create bug
    const bug = await Bug.create({
      title,
      description,
      priority: priority || "Medium",
      severity: severity || "Minor",
      bugType: bugType || "Functional",
      environment: environment || "Development",
      version: version || "1.0",
      stepsToReproduce: stepsToReproduce || "",
      reporter: req.user._id,
      assignedTo: assignedTo || [],
      todoChecklist: todoChecklist || [],
    });

    // Handle file attachments
    if (req.files && req.files.length > 0) {
      const attachmentPromises = req.files.map(async (file) => {
        const attachment = await Attachment.create({
          filename: file.filename,
          originalFilename: file.originalname,
          path: file.path,
          mimetype: file.mimetype,
          size: file.size,
          bug: bug._id,
          uploadedBy: req.user._id
        });
        
        return attachment._id;
      });
      
      const attachmentIds = await Promise.all(attachmentPromises);
      
      // Update bug with attachment IDs
      bug.attachments = attachmentIds;
      await bug.save();
    }

    res.status(201).json({
      message: "Bug reported successfully",
      bug,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Update bug details
// @route   PUT /api/bugs/:id
// @access  Private
const updateBug = async (req, res) => {
  try {
    const bug = await Bug.findById(req.params.id);

    if (!bug) {
      return res.status(404).json({
        message: "Bug not found",
      });
    }

    // Check if user is authorized to update this bug
    if (req.user.role === "tester" && 
        !bug.reporter.equals(req.user._id) && 
        !bug.assignedTo.some(userId => userId.toString() === req.user._id.toString())) {
      return res.status(403).json({
        message: "Not authorized to update this bug",
      });
    }

    // Update fields
    const fieldsToUpdate = [
      "title", "description", "priority", "severity", 
      "bugType", "environment", "version", "stepsToReproduce",
      "todoChecklist", "dueDate"
    ];
    
    fieldsToUpdate.forEach(field => {
      if (req.body[field] !== undefined) {
        bug[field] = req.body[field];
      }
    });

    // Update assignees if provided and user is admin or developer
    if (req.body.assignedTo && (req.user.role === "admin" || req.user.role === "developer")) {
      if (!Array.isArray(req.body.assignedTo)) {
        return res.status(400).json({
          message: "assignedTo must be an array of user IDs",
        });
      }
      bug.assignedTo = req.body.assignedTo;
    }

    // Handle new file attachments
    if (req.files && req.files.length > 0) {
      const attachmentPromises = req.files.map(async (file) => {
        const attachment = await Attachment.create({
          filename: file.filename,
          originalFilename: file.originalname,
          path: file.path,
          mimetype: file.mimetype,
          size: file.size,
          bug: bug._id,
          uploadedBy: req.user._id
        });
        
        return attachment._id;
      });
      
      const attachmentIds = await Promise.all(attachmentPromises);
      
      // Add new attachments to existing ones
      bug.attachments = [...bug.attachments, ...attachmentIds];
    }

    const updatedBug = await bug.save();
    
    res.json({
      message: "Bug updated successfully",
      bug: updatedBug,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Delete a bug (Admin only)
// @route   DELETE /api/bugs/:id
// @access  Private (Admin)
const deleteBug = async (req, res) => {
  try {
    const bug = await Bug.findById(req.params.id);
    if (!bug) {
      return res.status(404).json({
        message: "Bug not found",
      });
    }
    
    // Delete related attachments
    if (bug.attachments && bug.attachments.length > 0) {
      await Attachment.deleteMany({ _id: { $in: bug.attachments } });
    }
    
    // Delete related comments
    await Comment.deleteMany({ bug: bug._id });
    
    // Delete the bug
    await bug.deleteOne();
    
    res.json({
      message: "Bug deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Update bug status
// @route   PUT /api/bugs/:id/status
// @access  Private
const updateBugStatus = async (req, res) => {
  try {
    const bug = await Bug.findById(req.params.id);

    if (!bug) {
      return res.status(404).json({
        message: "Bug not found",
      });
    }

    // Check if user is authorized to update this bug
    const isAssigned = bug.assignedTo.some(
      (userId) => userId.toString() === req.user._id.toString()
    );

    if (req.user.role === "tester" && !bug.reporter.equals(req.user._id) && !isAssigned) {
      return res.status(403).json({
        message: "Not authorized to update this bug status",
      });
    }

    // Role-based status update restrictions
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        message: "Status is required",
      });
    }
    
    // Restrictions based on roles and current status
    if (req.user.role === "tester") {
      // Testers can only set status to "Open", "Testing", or "Reopened"
      if (!["Open", "Testing", "Reopened"].includes(status)) {
        return res.status(403).json({
          message: "Testers can only set status to Open, Testing, or Reopened",
        });
      }
      
      // Can only reopen if current status is Closed
      if (status === "Reopened" && bug.status !== "Closed") {
        return res.status(400).json({
          message: "Can only reopen bugs that are currently Closed",
        });
      }
    } else if (req.user.role === "developer") {
      // Developers can't set status to Open or Reopened directly
      if (["Open", "Reopened"].includes(status) && !["Open", "Reopened"].includes(bug.status)) {
        return res.status(403).json({
          message: "Developers cannot set bugs to Open or Reopened status",
        });
      }
    }

    bug.status = status;

    // If status is "Closed", mark all todos as completed
    if (status === "Closed") {
      bug.todoChecklist.forEach((item) => {
        item.completed = true;
      });
      bug.progress = 100;
    }

    await bug.save();
    
    // Populate the updated bug
    const updatedBug = await Bug.findById(req.params.id)
      .populate("reporter", "name email profileImageURL")
      .populate("assignedTo", "name email profileImageURL");
    
    res.json({
      message: "Bug status updated",
      bug: updatedBug,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Update bug todoChecklist
// @route   PUT /api/bugs/:id/todo
// @access  Private
const updateBugChecklist = async (req, res) => {
  try {
    const { todoChecklist } = req.body;
    const bug = await Bug.findById(req.params.id);

    if (!bug) {
      return res.status(404).json({
        message: "Bug not found",
      });
    }

    // Check if user has permission to update the checklist
    const isAssigned = bug.assignedTo.some(
      userId => userId.toString() === req.user._id.toString()
    );
    
    const isReporter = bug.reporter.toString() === req.user._id.toString();
    
    if (req.user.role === "tester" && !isReporter && !isAssigned) {
      return res.status(403).json({
        message: "Not authorized to update checklist",
      });
    }

    bug.todoChecklist = todoChecklist; // Replace with updated checklist

    // Auto-update progress based on checklist completion
    const completedCount = todoChecklist.filter(
      (item) => item.completed
    ).length;
    const totalItems = bug.todoChecklist.length;
    bug.progress =
      totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

    // Auto-update status based on progress
    if (bug.status !== "Closed" && bug.status !== "Reopened") {
      if (bug.progress === 100) {
        bug.status = "Testing"; // All todos complete, ready for testing
      } else if (bug.progress > 0) {
        bug.status = "In Progress"; // Some progress made
      }
    }

    await bug.save();

    const updatedBug = await Bug.findById(req.params.id)
      .populate("reporter", "name email profileImageURL")
      .populate("assignedTo", "name email profileImageURL");

    res.json({
      message: "Bug checklist updated",
      bug: updatedBug,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Dashboard data (Admin/Developer)
// @route   GET /api/bugs/dashboard-data
// @access  Private
const getDashboardData = async (req, res) => {
  try {
    let filter = {};
    
    // For developers, only show bugs assigned to them
    if (req.user.role === "developer") {
      filter.assignedTo = req.user._id;
    } else if (req.user.role === "tester") {
      // For testers, only show bugs they reported or are assigned to
      filter.$or = [
        { reporter: req.user._id },
        { assignedTo: req.user._id }
      ];
    }
    
    // Fetch statistics
    const totalBugs = await Bug.countDocuments(filter);
    
    const openBugs = await Bug.countDocuments({
      ...filter,
      status: "Open",
    });
    
    const inProgressBugs = await Bug.countDocuments({
      ...filter,
      status: "In Progress",
    });
    
    const testingBugs = await Bug.countDocuments({
      ...filter,
      status: "Testing",
    });
    
    const closedBugs = await Bug.countDocuments({
      ...filter,
      status: "Closed",
    });
    
    const reopenedBugs = await Bug.countDocuments({
      ...filter,
      status: "Reopened",
    });
    
    const criticalBugs = await Bug.countDocuments({
      ...filter,
      severity: "Critical",
      status: { $ne: "Closed" },
    });
    
    const overdueBugs = await Bug.countDocuments({
      ...filter,
      dueDate: { 
        $lt: new Date()
      },
      status: {
        $ne: "Closed" 
      },
    });

    // Status distribution
    const statusList = ["Open", "In Progress", "Testing", "Closed", "Reopened"];
    const statusDistributionRaw = await Bug.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const statusDistribution = statusList.reduce((acc, status) => {
      const formattedKey = status.replace(/\s+/g, ""); // Remove spaces for response keys
      acc[formattedKey] = statusDistributionRaw.find(
        (item) => item._id === status
      )?.count || 0; // Default to 0 if not found
      return acc;
    }, {});
    statusDistribution["All"] = totalBugs;

    // Priority distribution
    const priorityList = ["Low", "Medium", "High", "Critical"];
    const priorityDistributionRaw = await Bug.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 },
        },
      },
    ]);
    
    const priorityDistribution = priorityList.reduce((acc, priority) => {
      acc[priority] = priorityDistributionRaw.find(
        (item) => item._id === priority
      )?.count || 0; // Default to 0 if not found
      return acc; 
    }, {});

    // Severity distribution
    const severityList = ["Minor", "Major", "Critical", "Blocker"];
    const severityDistributionRaw = await Bug.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$severity",
          count: { $sum: 1 },
        },
      },
    ]);
    
    const severityDistribution = severityList.reduce((acc, severity) => {
      acc[severity] = severityDistributionRaw.find(
        (item) => item._id === severity
      )?.count || 0;
      return acc; 
    }, {});

    // Bug type distribution
    const typeList = ["Functional", "UI/UX", "Performance", "Security", "Compatibility", "Other"];
    const typeDistributionRaw = await Bug.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$bugType",
          count: { $sum: 1 },
        },
      },
    ]);
    
    const typeDistribution = typeList.reduce((acc, type) => {
      acc[type] = typeDistributionRaw.find(
        (item) => item._id === type
      )?.count || 0;
      return acc; 
    }, {});

    // Recent bugs
    const recentBugs = await Bug.find(filter)
      .sort({ createdAt: -1 })
      .limit(10)
      .select("title status priority severity bugType reporter assignedTo createdAt")
      .populate("reporter", "name")
      .populate("assignedTo", "name");
    
    // Most active bugs (most comments)
    const activeBugs = await Bug.aggregate([
      { $match: filter },
      {
        $project: {
          title: 1,
          status: 1,
          priority: 1,
          severity: 1,
          commentCount: { $size: "$comments" }
        }
      },
      { $sort: { commentCount: -1 } },
      { $limit: 5 }
    ]);

    res.status(200).json({
      statistics: {
        totalBugs,
        openBugs,
        inProgressBugs,
        testingBugs,
        closedBugs,
        reopenedBugs,
        criticalBugs,
        overdueBugs,
      },
      charts: {   
        statusDistribution,
        priorityDistribution,
        severityDistribution,
        typeDistribution,
      },
      recentBugs,
      activeBugs,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    User dashboard data
// @route   GET /api/bugs/user-dashboard-data
// @access  Private
const getUserDashboardData = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Create filter based on role
    let filter = {};
    
    if (req.user.role === "developer") {
      filter.assignedTo = userId;
    } else if (req.user.role === "tester") {
      filter.$or = [
        { reporter: userId },
        { assignedTo: userId }
      ];
    } else {
      // Admin sees all bugs by default
    }

    // Fetch statistics
    const totalBugs = await Bug.countDocuments(filter);
    
    const openBugs = await Bug.countDocuments({
      ...filter,
      status: "Open",
    });
    
    const inProgressBugs = await Bug.countDocuments({
      ...filter,
      status: "In Progress",
    });
    
    const testingBugs = await Bug.countDocuments({
      ...filter,
      status: "Testing",
    });
    
    const closedBugs = await Bug.countDocuments({
      ...filter,
      status: "Closed",
    });
    
    const reopenedBugs = await Bug.countDocuments({
      ...filter,
      status: "Reopened",
    });

    // Status distribution
    const statusList = ["Open", "In Progress", "Testing", "Closed", "Reopened"];
    const statusDistributionRaw = await Bug.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const statusDistribution = statusList.reduce((acc, status) => {
      const formattedKey = status.replace(/\s+/g, "");
      acc[formattedKey] = statusDistributionRaw.find(
        (item) => item._id === status
      )?.count || 0;
      return acc;
    }, {});
    statusDistribution["All"] = totalBugs;

    // Priority distribution
    const priorityList = ["Low", "Medium", "High", "Critical"];
    const priorityDistributionRaw = await Bug.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 },
        },
      },
    ]);
    
    const priorityDistribution = priorityList.reduce((acc, priority) => {
      acc[priority] = priorityDistributionRaw.find(
        (item) => item._id === priority
      )?.count || 0;
      return acc;
    }, {});
    
    // Recent bugs
    const recentBugs = await Bug.find(filter)
      .sort({ createdAt: -1 })
      .limit(10)
      .select("title status priority severity bugType reporter assignedTo createdAt")
      .populate("reporter", "name")
      .populate("assignedTo", "name");
    
    res.status(200).json({
      statistics: {
        totalBugs,
        openBugs,
        inProgressBugs,
        testingBugs,
        closedBugs,
        reopenedBugs,
      },
      charts: {
        statusDistribution,
        priorityDistribution,
      },
      recentBugs,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Assign bug
// @route   PUT /api/bugs/:id/assign
// @access  Private (Admin/Developer)
const assignBug = async (req, res) => {
  try {
    const { assignedTo } = req.body;
    
    if (!assignedTo || !Array.isArray(assignedTo)) {
      return res.status(400).json({
        message: "assignedTo must be an array of user IDs",
      });
    }
    
    const bug = await Bug.findById(req.params.id);
    
    if (!bug) {
      return res.status(404).json({
        message: "Bug not found",
      });
    }
    
    // Only admin or developers (who are already assigned) can assign bugs
    if (req.user.role === "tester" || 
        (req.user.role === "developer" && 
         !bug.assignedTo.some(id => id.toString() === req.user._id.toString()))) {
      return res.status(403).json({
        message: "Not authorized to assign this bug",
      });
    }
    
    bug.assignedTo = assignedTo;
    
    // If a bug is being assigned and it's 'Open', automatically change to 'In Progress'
    if (bug.status === "Open" && assignedTo.length > 0) {
      bug.status = "In Progress";
    }
    
    await bug.save();
    
    const updatedBug = await Bug.findById(req.params.id)
      .populate("reporter", "name email profileImageURL")
      .populate("assignedTo", "name email profileImageURL");
    
    res.json({
      message: "Bug assignment updated",
      bug: updatedBug,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Get bug attachments
// @route   GET /api/bugs/:id/attachments
// @access  Private
const getBugAttachments = async (req, res) => {
  try {
    const bug = await Bug.findById(req.params.id)
      .populate({
        path: "attachments",
        select: "filename originalFilename mimetype size uploadedBy createdAt",
        populate: {
          path: "uploadedBy",
          select: "name"
        }
      });
    
    if (!bug) {
      return res.status(404).json({
        message: "Bug not found",
      });
    }
    
    res.json({
      attachments: bug.attachments || [],
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    List bugs for a specific project
// @route   GET /api/bugs/project/:id/errors
// @access  Private (Tester, Admin)
const listBugsForProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    
    // Find bugs associated with the specified project
    const bugs = await Bug.find({ project: projectId })
      .populate("reporter", "name email profileImageURL")
      .populate("assignedTo", "name email profileImageURL")
      .sort({ createdAt: -1 });
    
    res.json({
      bugs,
      count: bugs.length
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Assign a bug to a developer
// @route   POST /api/bugs/project/:id/assign
// @access  Private (Admin only)
const assignBugToDeveloper = async (req, res) => {
  try {
    const { bugId, developerId } = req.body;
    
    if (!bugId || !developerId) {
      return res.status(400).json({
        message: "Bug ID and developer ID are required",
      });
    }
    
    const bug = await Bug.findById(bugId);
    
    if (!bug) {
      return res.status(404).json({
        message: "Bug not found",
      });
    }
    
    // Add developer to assignedTo array if not already there
    if (!bug.assignedTo.includes(developerId)) {
      bug.assignedTo.push(developerId);
    }
    
    // If a bug is being assigned and it's 'Open', automatically change to 'In Progress'
    if (bug.status === "Open") {
      bug.status = "In Progress";
    }
    
    await bug.save();
    
    const updatedBug = await Bug.findById(bugId)
      .populate("reporter", "name email profileImageURL")
      .populate("assignedTo", "name email profileImageURL");
    
    res.json({
      message: "Bug assigned to developer successfully",
      bug: updatedBug,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    List bugs assigned to developer for fixing
// @route   GET /api/bugs/bug-fixes
// @access  Private (Developer only)
const listBugFixes = async (req, res) => {
  try {
    // Find bugs assigned to current developer that are in progress
    const bugs = await Bug.find({ 
      assignedTo: req.user._id,
      status: { $in: ["In Progress", "Testing", "Reopened"] }
    })
      .populate("reporter", "name email profileImageURL")
      .populate("assignedTo", "name email profileImageURL")
      .sort({ priority: -1, createdAt: -1 });
    
    res.json({
      bugs,
      count: bugs.length
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

export {
  getBugs,
  getBugById,
  createBug,
  updateBug,
  deleteBug,
  updateBugStatus,
  updateBugChecklist,
  getDashboardData,
  getUserDashboardData,
  assignBug,
  getBugAttachments,
  listBugsForProject,
  assignBugToDeveloper,
  listBugFixes
}; 