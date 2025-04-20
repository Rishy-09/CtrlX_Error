import Reminder from "../models/Reminder.js";
import Task from "../models/Task.js";

// @desc    Create a new reminder
// @route   POST /api/reminders
// @access  Private
const createReminder = async (req, res) => {
  try {
    const { taskId, reminderDate, message } = req.body;

    // Validate the task exists and user has access
    const task = await Task.findById(taskId);
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
        message: "Not authorized to set reminders for this task"
      });
    }

    // Create the reminder
    const reminder = await Reminder.create({
      task: taskId,
      user: req.user._id,
      reminderDate: new Date(reminderDate),
      message: message || "Reminder for your task!"
    });

    res.status(201).json({
      message: "Reminder created successfully",
      reminder
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message
    });
  }
};

// @desc    Get user's reminders
// @route   GET /api/reminders
// @access  Private
const getUserReminders = async (req, res) => {
  try {
    const { isRead, active } = req.query;
    
    const filter = {
      user: req.user._id
    };

    if (isRead !== undefined) {
      filter.isRead = isRead === 'true';
    }

    if (active !== undefined) {
      filter.isActive = active === 'true';
    }

    // Get reminders sorted by date (most recent first)
    const reminders = await Reminder.find(filter)
      .populate('task', 'title description status priority')
      .sort({ reminderDate: -1 });

    res.json({
      reminders
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message
    });
  }
};

// @desc    Mark reminder as read
// @route   PUT /api/reminders/:id/read
// @access  Private
const markReminderAsRead = async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);
    
    if (!reminder) {
      return res.status(404).json({
        message: "Reminder not found"
      });
    }

    // Ensure user owns this reminder
    if (reminder.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Not authorized to update this reminder"
      });
    }

    reminder.isRead = true;
    await reminder.save();

    res.json({
      message: "Reminder marked as read",
      reminder
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message
    });
  }
};

// @desc    Delete a reminder
// @route   DELETE /api/reminders/:id
// @access  Private
const deleteReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);
    
    if (!reminder) {
      return res.status(404).json({
        message: "Reminder not found"
      });
    }

    // Ensure user owns this reminder
    if (reminder.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Not authorized to delete this reminder"
      });
    }

    await reminder.deleteOne();

    res.json({
      message: "Reminder deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message
    });
  }
};

export {
  createReminder,
  getUserReminders,
  markReminderAsRead,
  deleteReminder
};