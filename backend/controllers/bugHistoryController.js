import BugHistory from "../models/BugHistory.js";

// Get History for a Specific Bug
export const getBugHistory = async (req, res) => {
  try {
    const history = await BugHistory.find({ bug: req.params.bugId })
      .populate("user", "name email")  // populate user details if needed
      .sort({ timestamp: 1 });          // sort by timestamp ascending
    res.status(200).json(history);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving bug history", error: err.message });
  }
};
