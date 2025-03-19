import Bug from "../models/Bug.js";
import { sendEmail} from "../utils/emailService.js"
import User from "../models/User.js"  // to fetch email from
import BugHistory from "../models/BugHistory.js";

// Report a New Bug
export const reportBug = async (req, res) => {
  try {
    const { title, description, severity, priority, assignees } = req.body;
    const reporter = req.user.id;
    const attachments = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    const bug = new Bug({ title, description, severity, priority, assignees, reporter, attachments });
    await bug.save();

    res.status(201).json({ message: "Bug reported successfully", bug });

    // get the email of assigned users
    const assignedUsers = await User.find({_id: {$in: assignees}}, "email")
    const recipientEmails = assignedUsers.map(user => user.email)

    // send email to assignees
    if(recipientEmails.length > 0){
      await sendEmail(
        recipientEmails,
        "🚨 New Bug Assigned: " + bug.title,

        `<p>Hello,</p>
      
      <p>A new bug has been assigned to you in the Bug Tracking System.</p>
      
      <p>🆔 <strong>Bug Title:</strong> ${bug.title}</p>
      <p>📝 <strong>Description:</strong> ${bug.description}</p>
      <p>⚠️ <strong>Severity:</strong> ${bug.severity}</p>
      <p>🎯 <strong>Priority:</strong> ${bug.priority}</p>
      <p>👤 <strong>Reported By:</strong> ${req.user.name}</p>
      <p>📅 <strong>Reported On:</strong> ${new Date().toLocaleString()}</p>
      
      <p>🔗 Please check the bug details and take necessary action.</p>
      
      <p>Best regards,<br> 
      Bug Tracker System</p>`
      );      
    }

    // Emit WebSocket event for real-time updates
    const io = req.app.get("io");
    io.emit("newBug", bug);
  } 
  catch (err) {
    console.error("❌ Error:", err); // log full error in backend
    res.status(500).json({ message: "Internal Server Error" }); // Generic message for user
  }
};

// Get All Bugs
export const getAllBugs = async (req, res) => {
  try {

    const {page = 1, limit = 10, status, severity, priority, assignees} = req.query

    // filtering Query
    let query = {}
    if(status) query.status = status
    if(severity) query.severity = severity
    if(priority) query.priority = priority
    if(assignees) query.assignees = assignees

    // now fetching bugs with pagination and filtering
    const bugs = await Bug.find(query)
    .populate("reporter", "name")
    .populate("assignees", "name")
    .sort({createdAt: -1})  // sort by newest first
    .skip((page - 1)* limit)
    .limit(parseInt(limit))

    // now get the total count for frontend pagination
    const totalBugs = await Bug.countDocuments(query);

    res.status(200).json({
      totalPages: Math.ceil(totalBugs/ limit),
      currentPage: parseInt(page),
      totalBugs,
      bugs,
    });
  }
  catch (err) {
    console.error("❌ Error:", err); // log full error in backend
    res.status(500).json({ message: "Internal Server Error" }); // Generic message for user
  }
};

// Get a Single Bug by ID
export const getBugById = async (req, res) => {
  try {
    const bug = await Bug.findById(req.params.id).populate("reporter", "name").populate("assignees", "name");
    if (!bug) return res.status(404).json({ message: "Bug not found" }); // Handle missing bug properly

    res.status(200).json(bug);
  } 
  catch (err) {
    console.error("❌ Error:", err); // log full error in backend
    res.status(500).json({ message: "Internal Server Error" }); // Generic message for user
  }

};

// Update a Bug
export const updateBug = async (req, res) => {
  try {
    const { status, severity, priority, assignees } = req.body;
    const bug = await Bug.findById(req.params.id).populate("reporter", "email").populate("assignees", "email");
    if (!bug) return res.status(404).json({ message: "Bug not found" });

    // Check if the logged-in user is the reporter of the bug
    if(bug.reporter._id.toString() != req.user.id){
      return res.status(403).json({message: "Unauthorized: Only the reporter can update this bug"})
    }
    // storing the previous values for email notification
    const oldStatus = bug.status
    const oldSeverity = bug.severity
    const oldPriority = bug.priority


    // updating the bug fields
    bug.status = status || bug.status;
    bug.severity = severity || bug.severity;
    bug.priority = priority || bug.priority;
    bug.assignees = assignees || bug.assignees;

    await bug.save();

    // create history records for each field that has changed
    if (status && status !== oldStatus) {
      await BugHistory.create({
        bug: bug._id,
        action: `Status changed from ${oldStatus} to ${status}`,
        user: req.user.id
      });
    }
    if (severity && severity !== oldSeverity) {
      await BugHistory.create({
        bug: bug._id,
        action: `Severity changed from ${oldSeverity} to ${severity}`,
        user: req.user.id
      });
    }
    if (priority && priority !== oldPriority) {
      await BugHistory.create({
        bug: bug._id,
        action: `Priority changed from ${oldPriority} to ${priority}`,
        user: req.user.id
      });
    }

    res.status(200).json({ message: "Bug updated successfully", bug });

    // now sending email to reporter and assignees
    const recipients = [bug.reporter.email, ...bug.assignees.map(user => user.email)];

    if (recipients.length > 0) {
      let updateMessage = `<p>Hello,<br>

    The following bug has been updated in the Bug Tracking System:</p>

    <p>🆔 <strong>Bug Title:</strong> ${bug.title}</p>
    <p>📅 <strong>Updated On:</strong> ${new Date().toLocaleString()}</p>

    `;

      if (status && status !== oldStatus) updateMessage += `<p>🔄 <strong>Status Changed:</strong> ${oldStatus} → ${status}\n</p>`;
      if (severity && severity !== oldSeverity) updateMessage += `<p>⚠️ <strong>Severity Changed:</strong> ${oldSeverity} → ${severity}\n</p>`;
      if (priority && priority !== oldPriority) updateMessage += `<p>🎯 <strong>Priority Changed:</strong> ${oldPriority} → ${priority}\n</p>`;

      updateMessage += `<p>\n🔗 Please review the updates and take necessary action.</p>

    <p>Best regards,<br> 
    Bug Tracker System</p>`;

      await sendEmail(recipients, `🛠️ Bug Update: ${bug.title}`, updateMessage);
    }

    // Emit WebSocket event for real-time updates
    const io = req.app.get("io");
    io.emit("bugUpdated", bug);
  } 
  catch (err) {
    console.error("❌ Error:", err); // log full error in backend
    res.status(500).json({ message: "Internal Server Error" }); // Generic message for user
  }

};

// Delete a Bug
export const deleteBug = async (req, res) => {
  try {
    const bug = await Bug.findByIdAndDelete(req.params.id);
    if (!bug) return res.status(404).json({ message: "Bug not found" });

    res.status(200).json({ message: "Bug deleted successfully" });

    // Emit WebSocket event for real-time updates
    const io = req.app.get("io");
    io.emit("bugDeleted", { id: req.params.id });
  } 
  catch (err) {
    console.error("❌ Error:", err); // log full error in backend
    res.status(500).json({ message: "Internal Server Error" }); // Generic message for user
  }

};

// io.emit(...) → Sends a WebSocket event to all connected users.
// "bugDeleted" → The name of the event (frontend listens for this).
// { id: req.params.id } → The bug ID being sent in the event payload.