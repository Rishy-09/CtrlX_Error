import Bug from "../models/Bug.js";
import asyncHandler from "express-async-handler";
// @desc    Get all bugs (Admin: all, User: only assigned bugs)
// @route   GET /api/bugs/
// @access  Private
const getBugs = async (req, res) => {
  try {
    let filter = {};

    // If userId is provided in params, filter by that user
    if (req.params.userId) {
      filter = { createdBy: req.params.userId };
    } else {
      // Otherwise use role-based filtering
      filter =
        req.user.role === "admin"
          ? {}
          : req.user.role === "tester"
          ? { createdBy: req.user._id }
          : { assignedTo: req.user._id };
    }

    const bugs = await Bug.find(filter).populate(
      "assignedTo",
      "name email profileImageURL"
    );

    // Status summary counts
    const allBugs = await Bug.countDocuments(filter);

    const openBugs = await Bug.countDocuments({ ...filter, status: "Open" });
    const inProgressBugs = await Bug.countDocuments({
      ...filter,
      status: "In Progress",
    });
    const closedBugs = await Bug.countDocuments({
      ...filter,
      status: "Closed",
    });

    res.status(200).json({
      bugs,
      statusSummary: {
        all: allBugs,
        open: openBugs,
        inProgress: inProgressBugs,
        closed: closedBugs,
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
      .populate("assignedTo", "name email profileImageURL")
      .populate("createdBy", "name email");

    if (!bug) {
      return res.status(404).json({
        message: "Bug not found",
      });
    }

    // Check if user is authorized to view the bug
    const isAuthorized =
      req.user.role === "admin" ||
      (req.user.role === "tester" &&
        bug.createdBy._id.toString() === req.user._id.toString()) ||
      (req.user.role === "developer" &&
        bug.assignedTo.some(
          (dev) => dev._id.toString() === req.user._id.toString()
        ));

    if (!isAuthorized) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.status(200).json(bug);
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Create a new bug (Admin only)
// @route   POST /api/bugs/
// @access  Private (Tester)
const createBug = async (req, res) => {
  try {
    let {
      title,
      description,
      severity,
      module,
      assignedTo,
      checklist,
      priority,
      dueDate,
      attachments,
    } = req.body;

    // Validate user role
    if (req.user.role !== "tester") {
      return res.status(403).json({
        message: "Only testers can create bugs",
        error: "Unauthorized role",
      });
    }

    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({
        message: "Title and description are required",
        error: "Missing required fields",
      });
    }

    // Validate priority and severity
    if (!["Low", "Medium", "High"].includes(priority)) {
      return res.status(400).json({
        message: "Invalid priority value",
        error: "Invalid priority",
      });
    }

    if (!["Minor", "Major", "Critical"].includes(severity)) {
      return res.status(400).json({
        message: "Invalid severity value",
        error: "Invalid severity",
      });
    }

    // Validate assignedTo
    if (!Array.isArray(assignedTo) || assignedTo.length === 0) {
      return res.status(400).json({
        message: "At least one developer must be assigned",
        error: "Invalid assignedTo",
      });
    }

    // Format checklist items
    const formattedChecklist = Array.isArray(checklist)
      ? checklist.map((item) => ({
          text: typeof item === "string" ? item.trim() : item.text?.trim(),
          completed: false,
          completedBy: null,
          completedAt: null,
        }))
      : [];

    // Format attachments
    const formattedAttachments = Array.isArray(attachments)
      ? attachments
          .filter((attachment) => attachment && typeof attachment === "string")
          .map((a) => a.trim())
      : [];

    // Create bug with formatted data
    const bug = await Bug.create({
      title: title.trim(),
      description: description.trim(),
      severity,
      module: module?.trim() || "",
      createdBy: req.user._id,
      assignedTo,
      checklist: formattedChecklist,
      priority,
      dueDate: dueDate ? new Date(dueDate) : null,
      attachments: formattedAttachments,
      status: "Open",
    });

    res.status(201).json({
      message: "Bug created successfully",
      bug,
    });
  } catch (error) {
    console.error("Error creating bug:", error);

    // Handle specific MongoDB errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map((err) => ({
        field: err.path,
        message: err.message,
      }));

      return res.status(400).json({
        message: "Validation Error",
        error: "Validation failed",
        details: validationErrors,
      });
    }

    res.status(500).json({
      message: "Server Error",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
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
      return res.status(404).json({ message: "Bug not found" });
    }

    // Check if user is authorized to update the bug
    const isAuthorized =
      req.user.role === "admin" ||
      (req.user.role === "tester" &&
        bug.createdBy.toString() === req.user._id.toString()) ||
      (req.user.role === "developer" && bug.assignedTo.includes(req.user._id));

    if (!isAuthorized) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this bug" });
    }

    // Set lastUpdatedBy
    req.body.lastUpdatedBy = req.user._id;

    // Update the bug
    const updatedBug = await Bug.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("assignedTo", "name email profileImageURL")
      .populate("createdBy", "name email profileImageURL");

    res.status(200).json({
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

// @desc    Delete a bug
// @route   DELETE /api/bugs/:id
// @access  Private
const deleteBug = async (req, res) => {
  try {
    const bug = await Bug.findById(req.params.id);
    if (!bug) {
      return res.status(404).json({ message: "Bug not found" });
    }

    // Check if user is authorized to delete the bug
    const isAuthorized =
      req.user.role === "admin" ||
      (req.user.role === "tester" &&
        bug.createdBy.toString() === req.user._id.toString());

    if (!isAuthorized) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this bug" });
    }

    await bug.deleteOne();
    res.status(200).json({ message: "Bug deleted successfully" });
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

// Transition	Who Can Do It
// "Open" → "In Progress"	Developer (assigned)
// "In Progress" → "Closed"	Developer (if checklist complete)
// "Closed" → any other	Admin only
const updateBugStatus = async (req, res) => {
  try {
    const bug = await Bug.findById(req.params.id);
    if (!bug) return res.status(404).json({ message: "Bug not found" });

    const isAdmin = req.user.role === "admin";
    const isDeveloper =
      req.user.role === "developer" &&
      bug.assignedTo?.some(
        (userId) => userId.toString() === req.user._id.toString()
      );

    if (!isAdmin && !isDeveloper) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const newStatus = req.body.status;
    if (!newStatus)
      return res.status(400).json({ message: "Status is required" });

    // Only developers can move to "In Progress"
    if (newStatus === "In Progress" && !isDeveloper) {
      return res.status(403).json({
        message: "Only assigned developers can move bug to In Progress.",
      });
    }

    // Only admins can reopen a Closed bug
    if (bug.status === "Closed" && newStatus !== "Closed" && !isAdmin) {
      return res
        .status(403)
        .json({ message: "Only admin can reopen a closed bug." });
    }

    // Prevent closing unless checklist is complete
    if (newStatus === "Closed") {
      const allItemsCompleted = (bug.checklist || []).every(
        (item) => item.completed
      );
      if (!allItemsCompleted) {
        return res.status(400).json({
          message: "Cannot close bug unless all checklist items are completed.",
        });
      }
    }

    bug.status = newStatus;
    await bug.save();

    res.json({
      message: "Bug status updated",
      bug,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Update bug checklist
// @route   PUT /api/bugs/:id/checklist
// @access  Private
const updateBugChecklist = async (req, res) => {
  try {
    const bug = await Bug.findById(req.params.id);

    if (!bug) {
      return res.status(404).json({
        message: "Bug not found",
      });
    }

    const isAssigned =
      Array.isArray(bug.assignedTo) &&
      bug.assignedTo.some(
        (userId) => userId.toString() === req.user._id.toString()
      );

    if (!isAssigned) {
      res.status(403);
      throw new Error("You are not assigned to this bug");
    }

    const isAdmin = req.user.role === "admin";
    const isDeveloper = req.user.role === "developer" && isAssigned;

    if (!isAdmin && !isDeveloper)
      return res.status(403).json({ message: "Not authorized" });

    const { checklist } = req.body;
    bug.checklist = checklist; // Replace with updated checklist

    // Auto-update progress based on checklist completion
    const completedCount = checklist.filter((item) => item.done).length;

    // Auto-close only if all checklist items are completed, and bug isn't already in a final state
    const allCompleted = checklist.every((item) => item.done);
    const finalStates = ["Closed", "Rejected"];

    if (!finalStates.includes(bug.status)) {
      if (allCompleted) {
        bug.status = "Closed";
        bug.closedByChecklist = true;
      } else if (completedCount > 0) {
        bug.status = "In Progress";
      } else {
        bug.status = "Open";
      }
    }

    await bug.save();

    const updatedBug = await Bug.findById(req.params.id).populate(
      "assignedTo",
      "name email profileImageUrl"
    );

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

// @desc    Get admin dashboard data
// @route   GET /api/bugs/admin-dashboard
// @access  Private (Admin)
const getAdminDashboardData = async (req, res) => {
  try {
    // Get all bugs count
    const totalBugs = await Bug.countDocuments({});
    const openBugs = await Bug.countDocuments({ status: "Open" });
    const inProgressBugs = await Bug.countDocuments({ status: "In Progress" });
    const closedBugs = await Bug.countDocuments({ status: "Closed" });

    // Bug Distribution by Status
    const bugStatuses = ["Open", "In Progress", "Closed"];
    const bugDistributionRaw = await Bug.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const bugDistribution = bugStatuses.reduce((acc, status) => {
      const formattedKey = status.replace(/\s+/g, "");
      acc[formattedKey] =
        bugDistributionRaw.find((item) => item._id === status)?.count || 0;
      return acc;
    }, {});
    bugDistribution["All"] = totalBugs;

    // Bug Distribution by Severity
    const bugSeverities = ["Low", "Medium", "High"];
    const bugSeverityLevelsRaw = await Bug.aggregate([
      {
        $group: {
          _id: "$severity",
          count: { $sum: 1 },
        },
      },
    ]);

    const bugSeverityLevels = bugSeverities.reduce((acc, severity) => {
      acc[severity] =
        bugSeverityLevelsRaw.find((item) => item._id === severity)?.count || 0;
      return acc;
    }, {});

    // Get recent 10 bugs
    const recentBugs = await Bug.find({})
      .populate("assignedTo", "name email profileImageURL")
      .populate("createdBy", "name email profileImageURL")
      .sort({ createdAt: -1 })
      .limit(10)
      .select(
        "title status priority severity module assignedTo createdBy createdAt"
      );

    res.status(200).json({
      statistics: {
        totalBugs,
        openBugs,
        inProgressBugs,
        closedBugs,
      },
      charts: {
        bugDistribution,
        bugSeverityLevels,
      },
      recentBugs,
    });
  } catch (error) {
    console.error("Error in getAdminDashboardData:", error);
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Get tester dashboard data
// @route   GET /api/bugs/tester-dashboard
// @access  Private (Tester)
const getTesterDashboardData = async (req, res) => {
  try {
    const filter = { createdBy: req.user._id };

    // Get user's bugs count
    const totalBugs = await Bug.countDocuments(filter);
    const openBugs = await Bug.countDocuments({ ...filter, status: "Open" });
    const inProgressBugs = await Bug.countDocuments({
      ...filter,
      status: "In Progress",
    });
    const closedBugs = await Bug.countDocuments({
      ...filter,
      status: "Closed",
    });

    // Bug Distribution by Status
    const bugStatuses = ["Open", "In Progress", "Closed"];
    const bugDistributionRaw = await Bug.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const bugDistribution = bugStatuses.reduce((acc, status) => {
      const formattedKey = status.replace(/\s+/g, "");
      acc[formattedKey] =
        bugDistributionRaw.find((item) => item._id === status)?.count || 0;
      return acc;
    }, {});

    res.status(200).json({
      stats: {
        totalBugs,
        openBugs,
        inProgressBugs,
        closedBugs,
      },
      charts: {
        bugDistribution,
      },
    });
  } catch (error) {
    console.error("Error in getTesterDashboardData:", error);
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Get developer dashboard data
// @route   GET /api/bugs/developer-dashboard
// @access  Private (Developer)
const getDeveloperDashboardData = async (req, res) => {
  try {
    const filter = { assignedTo: req.user._id };

    // Get assigned bugs count
    const totalBugs = await Bug.countDocuments(filter);
    const openBugs = await Bug.countDocuments({ ...filter, status: "Open" });
    const inProgressBugs = await Bug.countDocuments({
      ...filter,
      status: "In Progress",
    });
    const closedBugs = await Bug.countDocuments({
      ...filter,
      status: "Closed",
    });

    // Bug Distribution by Status
    const bugStatuses = ["Open", "In Progress", "Closed"];
    const bugDistributionRaw = await Bug.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const bugDistribution = bugStatuses.reduce((acc, status) => {
      const formattedKey = status.replace(/\s+/g, "");
      acc[formattedKey] =
        bugDistributionRaw.find((item) => item._id === status)?.count || 0;
      return acc;
    }, {});

    // Bug Distribution by Priority
    const bugPriorities = ["Low", "Medium", "High"];
    const bugPriorityLevelsRaw = await Bug.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 },
        },
      },
    ]);

    const bugPriorityLevels = bugPriorities.reduce((acc, priority) => {
      acc[priority] =
        bugPriorityLevelsRaw.find((item) => item._id === priority)?.count || 0;
      return acc;
    }, {});

    // Get recent assigned bugs
    const recentBugs = await Bug.find(filter)
      .populate("createdBy", "name email profileImageURL")
      .populate("assignedTo", "name email profileImageURL")
      .sort({ updatedAt: -1 })
      .limit(10)
      .select(
        "title status priority severity module createdBy assignedTo createdAt updatedAt"
      );

    res.status(200).json({
      statistics: {
        totalBugs,
        openBugs,
        inProgressBugs,
        closedBugs,
      },
      charts: {
        bugDistribution,
        bugPriorityLevels,
      },
      recentBugs,
    });
  } catch (error) {
    console.error("Error in getDeveloperDashboardData:", error);
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Dashboard data (User-specific)
// @route   GET /api/bugs/user-dashboard-data
// @access  Private
const getUserDashboardData = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === "tester") {
      filter = { createdBy: req.user._id };
    } else if (req.user.role === "developer") {
      filter = { assignedTo: req.user._id };
    }
    const totalBugs = await Bug.countDocuments(filter);
    const openBugs = await Bug.countDocuments({ ...filter, status: "Open" });
    const closedBugs = await Bug.countDocuments({
      ...filter,
      status: "Closed",
    });
    // res.status(200).json({ totalBugs, openBugs, closedBugs });

    // Bug Distribution by Status
    const bugStatuses = ["Open", "In Progress", "Closed"];

    const bugDistributionRaw = await Bug.aggregate([
      {
        $match: filter,
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const bugDistribution = bugStatuses.reduce((acc, status) => {
      const formattedKey = status.replace(/\s+/g, "");
      acc[formattedKey] =
        bugDistributionRaw.find((item) => item._id === status)?.count || 0; // Default to 0 if not found
      return acc;
    }, {});
    bugDistribution["All"] = totalBugs;

    // Bug Distribution by Priority
    const bugPriorities = ["Low", "Medium", "High"];
    const bugPriorityLevelsRaw = await Bug.aggregate([
      {
        $match: filter,
      },
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 },
        },
      },
    ]);
    const bugPriorityLevels = bugPriorities.reduce((acc, priority) => {
      acc[priority] =
        bugPriorityLevelsRaw.find((item) => item._id === priority)?.count || 0;
      return acc;
    }, {});

    // Fetch recent 10 bugs for the user
    const recentBugs = await Bug.find(filter)
      .sort({ createdAt: -1 })
      .limit(10)
      .select("title status priority dueDate createdAt");

    res.status(200).json({
      statistics: {
        totalBugs,
        openBugs,
        closedBugs,
      },
      charts: {
        bugDistribution,
        bugPriorityLevels,
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

// @desc    Get all bugs that the user has permission to view
// @route   GET /api/bugs/all-viewable
// @access  Private
const getAllViewableBugs = async (req, res) => {
  try {
    let filter = {};

    // Role-based filtering
    if (req.user.role === "admin") {
      // Admins can see all bugs
      filter = {};
    } else if (req.user.role === "tester") {
      // Testers can see bugs they created
      filter = { createdBy: req.user._id };
    } else if (req.user.role === "developer") {
      // Developers can see bugs assigned to them
      filter = { assignedTo: req.user._id };
    }

    const bugs = await Bug.find(filter)
      .populate("assignedTo", "name email profileImageURL")
      .populate("createdBy", "name email profileImageURL")
      .sort({ updatedAt: -1 }); // Sort by last updated time

    // Status summary counts
    const allBugs = await Bug.countDocuments(filter);
    const openBugs = await Bug.countDocuments({ ...filter, status: "Open" });
    const inProgressBugs = await Bug.countDocuments({
      ...filter,
      status: "In Progress",
    });
    const closedBugs = await Bug.countDocuments({
      ...filter,
      status: "Closed",
    });

    res.status(200).json({
      bugs,
      statusSummary: {
        all: allBugs,
        open: openBugs,
        inProgress: inProgressBugs,
        closed: closedBugs,
      },
    });
  } catch (error) {
    console.error("Error in getAllViewableBugs:", error);
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Get bugs assigned to the developer
// @route   GET /api/bugs/assigned
// @access  Private (Developer)
const getAssignedBugs = async (req, res) => {
  try {
    // Find bugs where the developer is in the assignedTo array
    const bugs = await Bug.find({
      assignedTo: req.user._id,
      isDeleted: { $ne: true }, // Only get non-deleted bugs
    })
      .populate("createdBy", "name email profileImageURL")
      .populate("assignedTo", "name email profileImageURL")
      .sort({ createdAt: -1 });

    res.status(200).json(bugs);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching assigned bugs",
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
  getAdminDashboardData,
  getUserDashboardData,
  getTesterDashboardData,
  getDeveloperDashboardData,
  getAllViewableBugs,
  getAssignedBugs,
};
