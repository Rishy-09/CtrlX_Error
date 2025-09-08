import {
    LuLayoutDashboard,
    LuBug,
    LuClipboardCheck,
    LuSquarePlus,
    LuUser,
    LuLogOut,
    LuMessageSquare
} from "react-icons/lu";

// Admin's side menu
export const SIDE_MENU_ADMIN_DATA = [
    {
        id: "01",
        label: "Dashboard",
        icon: LuLayoutDashboard,
        path: "/admin/dashboard",
    },
    {
        id: "02",
        label: "Manage Bugs",
        icon: LuBug,
        path: "/admin/bugs", // Adjusted to 'bugs' from 'tasks'
    },
    {
        id: "03",
        label: "Team Members",
        icon: LuUser,
        path: "/admin/users",
    },
    {
        id: "04",
        label: "Chat",
        icon: LuMessageSquare,
        path: "/admin/chats",
    },
    {
        id: "05",
        label: "Logout",
        icon: LuLogOut,
        path: "logout",
    }
];

// Tester's side menu
export const SIDE_MENU_TESTER_DATA = [
    {
        id: "01",
        label: "Dashboard",
        icon: LuLayoutDashboard,
        path: "/tester/dashboard",
    },
    {
        id: "02",
        label: "My Reported Bugs",
        icon: LuClipboardCheck,
        path: "/tester/my-bugs", // Updated with correct path to my-bugs
    },
    {
        id: "03",
        label: "All Bugs",
        icon: LuBug,
        path: "/tester/all-bugs",
    },
    {
        id: "04",
        label: "Report Bug",
        icon: LuSquarePlus,
        path: "/tester/report-bug", // Adjusted for 'create bug'
    },
    {
        id: "05",
        label: "Chat",
        icon: LuMessageSquare,
        path: "/tester/chats",
    },
    {
        id: "06",
        label: "Logout",
        icon: LuLogOut,
        path: "logout",
    }
];

// Developer's side menu
export const SIDE_MENU_DEVELOPER_DATA = [
    {
        id: "01",
        label: "Dashboard",
        icon: LuLayoutDashboard,
        path: "/developer/dashboard",
    },
    {
        id: "02",
        label: "Assigned Bugs",
        icon: LuClipboardCheck,
        path: "/developer/assigned-bugs", // Updated to correct path
    },
    {
        id: "03",
        label: "Update Bug Status",
        icon: LuBug,
        path: "/developer/update-bugs", // Updated to link to the ManageBugs page
    },
    {
        id: "04",
        label: "Chat",
        icon: LuMessageSquare,
        path: "/developer/chats",
    },
    {
        id: "05",
        label: "Logout",
        icon: LuLogOut,
        path: "logout",
    }
];

// Priority levels for bugs
export const PRIORITY_DATA = [
    {
        label: "Low",
        value: "Low",
    },
    {
        label: "Medium",
        value: "Medium",
    },
    {
        label: "High",
        value: "High",
    }
];

// Status options for bugs
export const STATUS_DATA = [
    {
        label: "Open",
        value: "Open",
    },
    {
        label: "In Progress",
        value: "In Progress",
    },
    {
        label: "Closed",
        value: "Closed",
    }
];
