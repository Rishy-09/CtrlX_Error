const express = require('express');
const router = express.Router();
const Bug = require('../models/Bug');
const authMiddleware = require('../middleware/authMiddleware'); // Middleware for protected routes

// Create a new bug report (Protected route)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, severity, assignee } = req.body;
    const reporter = req.user.id; // Extract user ID from token

    const bug = new Bug({ title, description, severity, status: 'Open', assignee, reporter });
    await bug.save();

    res.status(201).json({ message: 'Bug reported successfully', bug });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Fetch all bugs (Protected route)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const bugs = await Bug.find().populate('reporter', 'name').populate('assignee', 'name');
    res.status(200).json(bugs);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update bug status (Protected route)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const bug = await Bug.findById(req.params.id);
    if (!bug) return res.status(404).json({ message: 'Bug not found' });

    bug.status = status;
    await bug.save();

    res.status(200).json({ message: 'Bug status updated', bug });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
