import Bug from '../models/Bug.js';
import User from '../models/User.js';

// @desc Get all users (Admin only)
// @route GET /api/users/
// @access Private (Admin)
const getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password'); // Get all users (any role) // Exclude password from the user object

        const usersWithBugStats = await Promise.all(
            users.map(async (user) => {
                let assignedBugs = 0;
                let createdBugs = 0;
                let openBugs = 0;
                let inProgressBugs = 0;
                let closedBugs = 0;

                if (user.role === 'developer') {
                    assignedBugs = await Bug.countDocuments({ assignedTo: user._id });
                    openBugs = await Bug.countDocuments({ assignedTo: user._id, status: 'Open' });
                    inProgressBugs = await Bug.countDocuments({ assignedTo: user._id, status: 'In Progress' });
                    closedBugs = await Bug.countDocuments({ assignedTo: user._id, status: 'Closed' });
                }

                if (user.role === 'tester') {
                    createdBugs = await Bug.countDocuments({ createdBy: user._id });
                }

                return {
                    ...user._doc, // Include all existing user data
                    assignedBugs,
                    createdBugs,
                    openBugs,
                    inProgressBugs,
                    closedBugs,
                };
            })
        );

        res.json(usersWithBugStats);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc Get a single user by ID
// @route GET /api/users/:id
// @access Private
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc Get all developers
// @route GET /api/users/developers
// @access Private (Admin, Tester)
const getDevelopers = async (req, res) => {
    try {
        const developers = await User.find({ role: 'developer' }).select('-password');
        res.json(developers);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export {
    getUsers,
    getUserById,
    getDevelopers
};
