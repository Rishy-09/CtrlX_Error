import Task from "../models/Task.js";

// @desc    Get all tasks (Admin: all, User: only assigned tasks)
// @route   GET /api/tasks/
// @access  Private
const getTasks = async (req, res) => {
  try {
    const { status } = req.query;

    let filter = {};

    if (status) {
      filter.status = status;
    }

    let tasks;

    if (req.user.role === "admin") {
      tasks = await Task.find(filter).populate(
        "assignedTo",
        "name email profileImageUrl"
      );
    } else {
      tasks = await Task.find({
        ...filter,
        assignedTo: req.user._id,
      }).populate("assignedTo", "name email profileImageUrl");
    }

    // Add completed todoChecklist count to each task
    tasks = await Promise.all(
      tasks.map(async (task) => {
        const completedCount = task.todoChecklist.filter(
          (item) => item.completed
        ).length;
        return {
          ...task._doc,
          completedCount: completedCount,
        };
      })
    );

    // Status summary counts
    const allTasks = await Task.countDocuments(
      req.user.role === "admin" ? {} : { assignedTo: req.user._id }
    );

    const pendingTasks = await Task.countDocuments({
      ...filter,
      status: "Pending",
      ...(req.user.role !== "admin" && { assignedTo: req.user._id }),
    });

    const inProgressTasks = await Task.countDocuments({
      ...filter,
      status: "In Progress",
      ...(req.user.role !== "admin" && { assignedTo: req.user._id }),
    });

    const completedTasks = await Task.countDocuments({
      ...filter,
      status: "Completed",
      ...(req.user.role !== "admin" && { assignedTo: req.user._id }),
    });

    res.json({
      tasks,
      statusSummary: {
        all: allTasks,
        pendingTasks,
        inProgressTasks,
        completedTasks,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Get task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate(
      "assignedTo",
      "name email profileImageUrl"
    );

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }
    res.json({
      task,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Create a new task (Admin only)
// @route   POST /api/tasks/
// @access  Private (Admin)
const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      priority,
      dueDate,
      assignedTo,
      attachments,
      todoChecklist,
    } = req.body;

    if (!Array.isArray(assignedTo)) {
      return res.status(400).json({
        message: "assignedTo must be an array of user IDs",
      });
    }

    const task = await Task.create({
      title,
      description,
      priority,
      dueDate,
      assignedTo,
      createdBy: req.user._id,
      todoChecklist,
      attachments,
    });

    res.status(201).json({
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Update task details
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    task.title = req.body.title || task.title;
    task.description = req.body.description || task.description;
    task.priority = req.body.priority || task.priority;
    task.dueDate = req.body.dueDate || task.dueDate;
    task.todoChecklist = req.body.todoChecklist || task.todoChecklist;
    task.attachments = req.body.attachments || task.attachments;

    if (req.body.assignedTo) {
      if (!Array.isArray(req.body.assignedTo)) {
        return res.status(400).json({
          message: "assignedTo must be an array of user IDs",
        });
      }
      task.assignedTo = req.body.assignedTo;
    }

    const updatedTask = await task.save();
    res.json({
      message: "Task updated successfully",
      updatedTask,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Delete a task (Admin only)
// @route   DELETE /api/tasks/:id
// @access  Private (Admin)
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }
    await task.deleteOne();
    res.json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Update task status
// @route   PUT /api/tasks/:id/status
// @access  Private
const updateTaskStatus = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const isAssigned = task.assignedTo.some(
      (userId) => userId.toString() === req.user._id.toString()
    );

    if (!isAssigned && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    task.status = req.body.status || task.status;

    if (task.status === "Completed") {
      task.todoChecklist.forEach((item) => {
        item.completed = true;
      });
      task.progress = 100;
    }

    await task.save();
    res.json({
      message: "Task status updated",
      task,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Update task checklist
// @route   PUT /api/tasks/:id/todo
// @access  Private
const updateTaskChecklist = async (req, res) => {
  try {
    const { todoChecklist } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    if (!task.assignedTo.includes(req.user._id) && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Not authorized to update checklist",
      });
    }

    task.todoChecklist = todoChecklist; // Replace with updated checklist

    // Auto-update progress based on checklist completion
    const completedCount = todoChecklist.filter(
      (item) => item.completed
    ).length;
    const totalItems = task.todoChecklist.length;
    task.progress =
      totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

    // Auto-mark task as completed if all items are checked
    if (task.progress === 100) {
      task.status = "Completed";
    } else if (task.progress > 0) {
      task.status = "In Progress";
    } else {
      task.status = "Pending";
    }

    await task.save();

    const updatedTask = await Task.findById(req.params.id).populate(
      "assignedTo",
      "name email profileImageUrl"
    );

    res.json({
      message: "Task checklist updated",
      task: updatedTask,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Dashboard data (Admin only)
// @route   GET /api/tasks/dashboard-data
// @access  Private
const getDashboardData = async (req, res) => {
  try {
    // Fetch statistics
    const totalTasks = await Task.countDocuments();
    const pendingTasks = await Task.countDocuments(
        {
            status: "Pending",
        }
    );
    const completedTasks = await Task.countDocuments(
        {
            status: "Completed",
        }
    );
    const overdueTasks = await Task.countDocuments(
        {
            dueDate: { 
                $lt: new Date()
            },
            status: {
                $ne: "Completed" 
            },
        }
    );

    // Ensure all possible statuses are included
    const taskStatuses = [
        "Pending",
        "In Progress",
        "Completed",
    ];

    const taskDistributionRaw = await Task.aggregate(
        [
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                },
            },
        ]
    );

    const taskDistribution = taskStatuses.reduce((acc, status) => {
        const formattedKey = status.replace(/\s+/g, ""); // Remove spaces for response keys
        acc[formattedKey] = taskDistributionRaw.find(
            (item) => item._id === status
        )?.count || 0; // Default to 0 if not found
        return acc;
    }, {});
    taskDistribution["All"] = totalTasks; // Add total tasks count to Task Distribution

    // Ensure all priorities are included
    const taskPriorities = [
        "Low",
        "Medium",
        "High",
    ];
    const taskPriorityLevelsRaw = await Task.aggregate(
        [
            {
                $group: {
                    _id: "$priority",
                    count: { $sum: 1 },
                },
            },
        ]
    );
    const taskPriorityLevels = taskPriorities.reduce((acc, priority) => {
        acc[priority] = taskPriorityLevelsRaw.find(
            (item) => item._id === priority
        )?.count || 0; // Default to 0 if not found
        return acc; 
    }, {});

    // Fetch recent 10 tasks
    const recentTasks = await Task.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select("title status priority dueDate createdAt")
    
    res.status(200).json(
        {
            statistics: {
                totalTasks,
                pendingTasks,
                completedTasks,
                overdueTasks,
            },
            charts: {   
                taskDistribution,
                taskPriorityLevels,
            },
            recentTasks,
        }
    );
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Dashboard data (User-specific)
// @route   GET /api/tasks/user-dashboard-data
// @access  Private
const getUserDashboardData = async (req, res) => {
  try {
    const userId = req.user._id; // Only fetch data for the logged-in user

    // Fetch statistics for user-specific tasks
    const totalTasks = await Task.countDocuments(
        {
            assignedTo: userId,
        }
    );
    const pendingTasks = await Task.countDocuments(
        {
            assignedTo: userId,
            status: "Pending",
        }
    );
    const completedTasks = await Task.countDocuments(
        {
            assignedTo: userId,
            status: "Completed",
        }
    );
    const overdueTasks = await Task.countDocuments(
        {
            assignedTo: userId,
            status: { 
                $ne: "Completed" 
            },
            dueDate: { 
                $lt: new Date() 
            },
        }
    );

    // Task Distribution by Status
    const taskStatuses = [
        "Pending",
        "In Progress",
        "Completed",
    ];
    const taskDistributionRaw = await Task.aggregate(
        [
            {
                $match: {
                    assignedTo: userId,
                },
            },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                },
            },
        ]
    );

    const taskDistribution = taskStatuses.reduce((acc, status) => {
        const formattedKey = status.replace(/\s+/g, "");
        acc[formattedKey] = taskDistributionRaw.find(
            (item) => item._id === status
        )?.count || 0; // Default to 0 if not found
        return acc;
    }, {});
    taskDistribution["All"] = totalTasks;

    // Task Distribution by Priority
    const taskPriorities = [
        "Low",
        "Medium",
        "High",
    ];
    const taskPriorityLevelsRaw = await Task.aggregate(
        [
            {
                $match: {
                    assignedTo: userId,
                },
            },
            {
                $group: {
                    _id: "$priority",
                    count: { $sum: 1 },
                },
            },
        ]
    );
    const taskPriorityLevels = taskPriorities.reduce((acc, priority) => {
        acc[priority] = taskPriorityLevelsRaw.find(
            (item) => item._id === priority
        )?.count || 0; 
        return acc;
    }, {});

    // Fetch recent 10 tasks for the user
    const recentTasks = await Task.find(
        {
            assignedTo: userId,
        }
    )
        .sort({ createdAt: -1 })
        .limit(10)
        .select("title status priority dueDate createdAt")  
    
    res.status(200).json(
        {
            statistics: {
                totalTasks,
                pendingTasks,
                completedTasks,
                overdueTasks,
            },
            charts: {
                taskDistribution,
                taskPriorityLevels,
            },
            recentTasks,
        }
    );
  } 
  catch (error) {
    res.status(500).json({
        message: "Server Error",
        error: error.message,
    });
  }
};

// @desc    Add comment to a task
// @route   POST /api/tasks/:id/comments
// @access  Private
const addTaskComment = async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({
        message: "Comment text is required"
      });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    // Create the comment object
    const comment = {
      text,
      user: req.user._id,
      createdAt: new Date()
    };

    // Add to comments array
    task.comments.unshift(comment);
    await task.save();

    // Return the populated task with comments including user details
    const updatedTask = await Task.findById(req.params.id)
      .populate("comments.user", "name email profileImageURL")
      .populate("assignedTo", "name email profileImageURL");

    res.status(201).json({
      message: "Comment added successfully",
      task: updatedTask
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message
    });
  }
};

// @desc    Get task comments
// @route   GET /api/tasks/:id/comments
// @access  Private
const getTaskComments = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("comments.user", "name email profileImageURL");

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    res.json({
      comments: task.comments
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message
    });
  }
};

// @desc    Start time tracking for a task
// @route   POST /api/tasks/:id/time/start
// @access  Private
const startTimeTracking = async (req, res) => {
  try {
    const { description } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    // Check if user is assigned to the task or is admin
    const isAssigned = task.assignedTo.some(
      userId => userId.toString() === req.user._id.toString()
    );
    
    if (!isAssigned && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Not authorized to track time for this task"
      });
    }

    // Check if user already has an active time entry
    const hasActiveEntry = task.timeEntries.some(
      entry => entry.user.toString() === req.user._id.toString() && !entry.endTime
    );

    if (hasActiveEntry) {
      return res.status(400).json({
        message: "You already have an active time entry for this task"
      });
    }

    // Create a new time entry
    const timeEntry = {
      startTime: new Date(),
      user: req.user._id,
      description: description || ""
    };

    task.timeEntries.push(timeEntry);
    await task.save();

    res.status(201).json({
      message: "Time tracking started",
      timeEntry: task.timeEntries[task.timeEntries.length - 1]
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message
    });
  }
};

// @desc    Stop time tracking for a task
// @route   PUT /api/tasks/:id/time/stop
// @access  Private
const stopTimeTracking = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    // Find active time entry for the user
    const activeEntryIndex = task.timeEntries.findIndex(
      entry => entry.user.toString() === req.user._id.toString() && !entry.endTime
    );

    if (activeEntryIndex === -1) {
      return res.status(400).json({
        message: "No active time entry found"
      });
    }

    // Update the time entry
    const endTime = new Date();
    const startTime = new Date(task.timeEntries[activeEntryIndex].startTime);
    
    // Calculate duration in minutes
    const durationMs = endTime - startTime;
    const durationMinutes = Math.round(durationMs / (1000 * 60));

    task.timeEntries[activeEntryIndex].endTime = endTime;
    task.timeEntries[activeEntryIndex].duration = durationMinutes;

    // Update total time spent
    task.totalTimeSpent = (task.totalTimeSpent || 0) + durationMinutes;

    await task.save();

    res.json({
      message: "Time tracking stopped",
      timeEntry: task.timeEntries[activeEntryIndex],
      totalTimeSpent: task.totalTimeSpent
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message
    });
  }
};

// @desc    Get time entries for a task
// @route   GET /api/tasks/:id/time
// @access  Private
const getTimeEntries = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('timeEntries.user', 'name email profileImageURL');

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    // Check if user is assigned to the task or is admin
    const isAssigned = task.assignedTo.some(
      userId => userId.toString() === req.user._id.toString()
    );
    
    if (!isAssigned && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Not authorized to view time entries for this task"
      });
    }

    res.json({
      timeEntries: task.timeEntries,
      totalTimeSpent: task.totalTimeSpent
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message
    });
  }
};

// @desc    Add a task dependency
// @route   POST /api/tasks/:id/dependencies
// @access  Private (Admin)
const addTaskDependency = async (req, res) => {
  try {
    const { dependencyId } = req.body;
    
    if (!dependencyId) {
      return res.status(400).json({
        message: "Dependency task ID is required"
      });
    }

    // Validate current task exists
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    // Validate dependency task exists
    const dependencyTask = await Task.findById(dependencyId);
    if (!dependencyTask) {
      return res.status(404).json({
        message: "Dependency task not found"
      });
    }

    // Check if dependency already exists
    if (task.dependencies.includes(dependencyId)) {
      return res.status(400).json({
        message: "Dependency already exists"
      });
    }

    // Check if adding this dependency would create a circular dependency
    if (dependencyTask.dependencies.includes(task._id) || dependencyTask._id.equals(task._id)) {
      return res.status(400).json({
        message: "Circular dependency detected"
      });
    }

    // Add dependency to current task
    task.dependencies.push(dependencyId);
    
    // Add blocked-by reference to dependency task
    dependencyTask.blockedBy.push(task._id);
    
    await task.save();
    await dependencyTask.save();

    // Return populated task with dependencies
    const updatedTask = await Task.findById(req.params.id)
      .populate('dependencies', 'title status priority')
      .populate('blockedBy', 'title status priority');

    res.json({
      message: "Dependency added successfully",
      task: updatedTask
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message
    });
  }
};

// @desc    Remove a task dependency
// @route   DELETE /api/tasks/:id/dependencies/:dependencyId
// @access  Private (Admin)
const removeTaskDependency = async (req, res) => {
  try {
    const { dependencyId } = req.params;
    
    // Validate current task exists
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    // Validate dependency task exists
    const dependencyTask = await Task.findById(dependencyId);
    if (!dependencyTask) {
      return res.status(404).json({
        message: "Dependency task not found"
      });
    }

    // Check if dependency exists
    if (!task.dependencies.includes(dependencyId)) {
      return res.status(400).json({
        message: "Dependency does not exist"
      });
    }

    // Remove dependency from current task
    task.dependencies = task.dependencies.filter(
      dep => dep.toString() !== dependencyId
    );
    
    // Remove blocked-by reference from dependency task
    dependencyTask.blockedBy = dependencyTask.blockedBy.filter(
      blocked => blocked.toString() !== task._id.toString()
    );
    
    await task.save();
    await dependencyTask.save();

    // Return populated task with dependencies
    const updatedTask = await Task.findById(req.params.id)
      .populate('dependencies', 'title status priority')
      .populate('blockedBy', 'title status priority');

    res.json({
      message: "Dependency removed successfully",
      task: updatedTask
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message
    });
  }
};

// @desc    Get task dependencies
// @route   GET /api/tasks/:id/dependencies
// @access  Private
const getTaskDependencies = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('dependencies', 'title description status priority dueDate')
      .populate('blockedBy', 'title description status priority dueDate');

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    res.json({
      dependencies: task.dependencies,
      blockedBy: task.blockedBy
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message
    });
  }
};

export {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  updateTaskChecklist,
  getDashboardData,
  getUserDashboardData,
  addTaskComment,
  getTaskComments,
  startTimeTracking,
  stopTimeTracking,
  getTimeEntries,
  addTaskDependency,
  removeTaskDependency,
  getTaskDependencies
};
