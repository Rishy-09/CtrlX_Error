const mongoose = require('mongoose');

const bugSchema = mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  severity: { type: String, required: true, enum: ['Low', 'Medium', 'High'] },
  status: { type: String, required: true, enum: ['Open', 'In Progress', 'Resolved', 'Closed'], default: 'Open' },
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Bug', bugSchema);
