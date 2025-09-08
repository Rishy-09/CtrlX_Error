import Bug from '../models/Bug.js';
import User from '../models/User.js';
import exceljs from 'exceljs';

// @desc Export all bugs as an Excel file
// @route GET /api/reports/export/bugs
// @access Private (Admin)
const exportBugsReport = async (req, res) => {
    try {
        const bugs = await Bug.find().populate('assignedTo', 'name email').sort({ createdAt: -1 });
        const workbook = new exceljs.Workbook();
        const worksheet = workbook.addWorksheet('Bugs Report');

        // Define columns
        worksheet.columns = [
            { header: 'Bug ID', key: '_id', width: 30 },
            { header: 'Title', key: 'title', width: 30 },
            { header: 'Description', key: 'description', width: 50 },
            { header: 'Priority', key: 'priority', width: 15 },
            { header: 'Severity', key: 'severity', width: 15 },
            { header: 'Status', key: 'status', width: 20 },
            { header: 'Created At', key: 'createdAt', width: 20 },
            { header: 'Due Date', key: 'dueDate', width: 20 },
            { header: 'Assigned To', key: 'assignedTo', width: 30 },
        ];

        // Add rows
        bugs.forEach(bug => {
            const assignedToNames = (bug.assignedTo && bug.assignedTo.length)
                ? bug.assignedTo.map(user => user.name).join(', ')
                : 'Unassigned';

            worksheet.addRow({
                _id: bug._id.toString(),
                title: bug.title,
                description: bug.description || 'N/A',
                priority: bug.priority,
                severity: bug.severity,
                status: bug.status,
                createdAt: bug.createdAt.toISOString().split('T')[0],
                dueDate: bug.dueDate ? bug.dueDate.toISOString().split('T')[0] : 'N/A',
                assignedTo: assignedToNames,
            });
        });

        // Response headers
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="bugs_report_${Date.now()}.xlsx"`
        );

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        res.status(500).json({
            message: "Error exporting bugs",
            error: error.message
        });
    }
};

// @desc Export user-bug report as an Excel file
// @route GET /api/reports/export/bugs
// @access Private (Admin)
const exportUsersReport = async (req, res) => {
    try {
        const users = await User.find().select("name email role _id").lean() // Select only necessary fields
        const userBugs = await Bug.find().populate(
            'assignedTo createdBy', 
            'name email _id'
        );
        const userBugMap = {};
        // Add rows to the worksheet
        users.forEach((user) => {
            userBugMap[user._id] = {
                name: user.name,
                email: user.email,
                role: user.role,
                createdBugs: 0,
                assignedBugs: 0,
                openBugs: 0,
                inProgressBugs: 0,
                closedBugs: 0,
            };
        });

        // Loop through all bugs
        userBugs.forEach(bug => {
            // Created by (tester)
            if (bug.createdBy && userBugMap[bug.createdBy._id]) {
                userBugMap[bug.createdBy._id].createdBugs += 1;
            }

            // Assigned to (developers - can be multiple)
            if (Array.isArray(bug.assignedTo)) {
                bug.assignedTo.forEach(dev => {
                    if (userBugMap[dev._id]) {
                        userBugMap[dev._id].assignedBugs += 1;

                        if (bug.status === 'Open') {
                            userBugMap[dev._id].openBugs += 1;
                        } else if (bug.status === 'In Progress') {
                            userBugMap[dev._id].inProgressBugs += 1;
                        } else if (bug.status === 'Closed') {
                            userBugMap[dev._id].closedBugs += 1;
                        }
                    }
                });
            }
        });

        const workbook = new exceljs.Workbook();
        const worksheet = workbook.addWorksheet('User Bug Report');
        
        worksheet.columns = [
            { header: 'User Name', key: 'name', width: 30 },
            { header: 'Email', key: 'email', width: 40 },
            { header: 'Role', key: 'role', width: 20 },
            { header: 'Created Bugs', key: 'createdBugs', width: 20 },
            { header: 'Assigned Bugs', key: 'assignedBugs', width: 20 },
            { header: 'Open Bugs', key: 'openBugs', width: 20 },
            { header: 'In Progress Bugs', key: 'inProgressBugs', width: 20 },
            { header: 'Resolved Bugs', key: 'closedBugs', width: 20 },
        ];

        Object.values(userBugMap).forEach((user) =>{
            worksheet.addRow(user);
        });

        // Set response headers for Excel file download
        res.setHeader(
            'Content-Type', 
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition', 
            `attachment; filename="users_report_${Date.now()}.xlsx"` // filename=users_report_${Date.now()}.xlsx
        ); 

        return workbook.xlsx.write(res).then(() => 
            {
                res.end();
            }
        );
    } catch (error) {
        res.status(500).json(
            { 
                message: "Error exporting bugs", 
                error: error.message 
            }
        );
    }
};

export { 
    exportBugsReport, 
    exportUsersReport
};

