# 🐞 CtrlX - Bug Tracking System

> A scalable and full-stack MERN-based bug tracking application to streamline software issue management, resolution, and reporting for development teams.

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/frontend-react-blue)](https://react.dev/)
[![Node](https://img.shields.io/badge/backend-node-green)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/database-mongodb-brightgreen)](https://www.mongodb.com/)
[![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-orange.svg)]()

---

## 🚀 Overview

CtrlX is a role-based bug tracking system designed for developers, testers, and project managers to report, assign, and resolve bugs collaboratively. The project supports real-time tracking, email notifications, PDF/CSV export, file uploads, and an interactive dashboard.

> 📍 Live Demo: _Coming soon_
>
> 🎨 [Figma UI Design](https://www.figma.com/design/wF8zt2Kh5jmG3qMGbCKIPv/Smriti?node-id=0-1&p=f&t=KvNotVyqUWyESyER-0)

---

## 🧠 Features

- 🔐 **Authentication & RBAC** (JWT-secured, role-based access)
- 🐛 **Bug Lifecycle Management**
- 📥 **File Attachments** (screenshots, logs)
- 📨 **Email Notifications** (via Nodemailer)
- 🔍 **Advanced Filtering** (priority, status, date, assignee)
- 📊 **Real-Time Dashboard**
- 📄 **Bug Report Export** (PDF & CSV)
- 🌐 **Responsive UI** with Tailwind CSS

---

## 🎯 Use Cases

- Developers can track and resolve bugs assigned to them.
- Testers can report bugs with evidence.
- Managers can monitor bug resolution and generate reports.

---

## 📌 Tech Stack

| Layer      | Technologies                                 |
| ---------- | -------------------------------------------- |
| Frontend   | React 18, Tailwind CSS, React Router, Vite   |
| Backend    | Node.js, Express.js, JWT, Nodemailer, Multer |
| Database   | MongoDB with Mongoose ORM                    |
| Testing    | Jest, Mocha, Postman                         |
| Deployment | Netlify / Vercel                             |
| Dev Tools  | Git, GitHub, Figma                           |

---

## 🔧 Project Structure

```bash
Directory structure:
└── rishy-09-ctrlx_error/
    ├── README.md
    ├── package.json
    ├── client/
    │   ├── README.md
    │   ├── eslint.config.js
    │   ├── index.html
    │   ├── package-lock.json
    │   ├── package.json
    │   ├── tailwind.config.js
    │   ├── vite.config.js
    │   ├── .gitignore
    │   ├── public/
    │   └── src/
    │       ├── App.jsx
    │       ├── index.css
    │       ├── main.jsx
    │       ├── assets/
    │       │   └── images/
    │       ├── components/
    │       │   ├── AvatarGroup.jsx
    │       │   ├── DeleteAlert.jsx
    │       │   ├── Modal.jsx
    │       │   ├── Progress.jsx
    │       │   ├── TaskListTable.jsx
    │       │   ├── TaskStatusTabs.jsx
    │       │   ├── UserAvatar.jsx
    │       │   ├── Cards/
    │       │   │   ├── InfoCard.jsx
    │       │   │   ├── TaskCard.jsx
    │       │   │   └── UserCard.jsx
    │       │   ├── Charts/
    │       │   │   ├── CustomBarChart.jsx
    │       │   │   ├── CustomLegend.jsx
    │       │   │   ├── CustomPieChart.jsx
    │       │   │   └── CustomToolTip.jsx
    │       │   ├── Comments/
    │       │   │   └── CommentSection.jsx
    │       │   ├── Inputs/
    │       │   │   ├── AddAttachmentsInput.jsx
    │       │   │   ├── Input.jsx
    │       │   │   ├── ProfilePhotoSelector.jsx
    │       │   │   ├── SelectDropdown.jsx
    │       │   │   ├── SelectUsers.jsx
    │       │   │   └── ToDoListInput.jsx
    │       │   ├── layouts/
    │       │   │   ├── AuthLayout.jsx
    │       │   │   ├── DashboardLayout.jsx
    │       │   │   ├── Footer.jsx
    │       │   │   ├── MainLayout.jsx
    │       │   │   ├── Navbar.jsx
    │       │   │   ├── Navigation.jsx
    │       │   │   ├── SideMenu.jsx
    │       │   │   └── ThemeToggle.jsx
    │       │   ├── Reminders/
    │       │   │   ├── NotificationBell.jsx
    │       │   │   └── ReminderForm.jsx
    │       │   └── TimeTracking/
    │       │       └── TimeTracker.jsx
    │       ├── context/
    │       │   ├── ChatContext.jsx
    │       │   └── userContext.jsx
    │       ├── hooks/
    │       │   └── useUserAuth.jsx
    │       ├── pages/
    │       │   ├── Admin/
    │       │   │   ├── AdminBugDashboard.jsx
    │       │   │   ├── CreateTask.jsx
    │       │   │   ├── Dashboard.jsx
    │       │   │   ├── ManageTasks.jsx
    │       │   │   └── ManageUsers.jsx
    │       │   ├── Auth/
    │       │   │   ├── ForgotPassword.jsx
    │       │   │   ├── Login.jsx
    │       │   │   ├── ResetPassword.jsx
    │       │   │   └── Signup.jsx
    │       │   ├── Bug/
    │       │   │   └── BugDetails.jsx
    │       │   ├── Bugs/
    │       │   │   └── BugDetails.jsx
    │       │   ├── Chat/
    │       │   │   ├── ChatPage.jsx
    │       │   │   └── components/
    │       │   │       ├── ChatInput.jsx
    │       │   │       ├── ChatMessages.jsx
    │       │   │       ├── ChatSettingsModal.jsx
    │       │   │       ├── ChatSidebar.jsx
    │       │   │       ├── CreateChatModal.jsx
    │       │   │       └── MessageItem.jsx
    │       │   ├── Company/
    │       │   │   ├── About.jsx
    │       │   │   └── Contact.jsx
    │       │   ├── Features/
    │       │   │   └── Features.jsx
    │       │   ├── Landing/
    │       │   │   └── LandingPage.jsx
    │       │   ├── NotFound/
    │       │   │   └── NotFound.jsx
    │       │   ├── Pricing/
    │       │   │   └── PricingPage.jsx
    │       │   ├── Terms/
    │       │   │   ├── DataStoragePolicy.jsx
    │       │   │   ├── PrivacyPolicy.jsx
    │       │   │   └── TermsOfService.jsx
    │       │   └── User/
    │       │       ├── DeveloperDashboard.jsx
    │       │       ├── MyTasks.jsx
    │       │       ├── TesterDashboard.jsx
    │       │       ├── UserDashboard.jsx
    │       │       ├── UserSettings.jsx
    │       │       └── ViewTaskDetails.jsx
    │       ├── routes/
    │       │   ├── index.jsx
    │       │   └── PrivateRoute.jsx
    │       └── utils/
    │           ├── apiPaths.js
    │           ├── axiosInstance.js
    │           ├── data.js
    │           ├── helper.js
    │           └── uploadImage.js
    └── server/
        ├── package-lock.json
        ├── package.json
        ├── server.js
        ├── config/
        │   └── db.js
        ├── controllers/
        │   ├── attachmentController.js
        │   ├── authController.js
        │   ├── bugController.js
        │   ├── chatController.js
        │   ├── commentController.js
        │   ├── reminderController.js
        │   ├── reportController.js
        │   ├── taskController.js
        │   └── userController.js
        ├── middlewares/
        │   ├── authMiddleware.js
        │   └── uploadMiddleware.js
        ├── models/
        │   ├── Attachment.js
        │   ├── Bug.js
        │   ├── Chat.js
        │   ├── Comment.js
        │   ├── Message.js
        │   ├── Reminder.js
        │   ├── Task.js
        │   └── User.js
        ├── routes/
        │   ├── attachmentRoutes.js
        │   ├── authRoutes.js
        │   ├── bugRoutes.js
        │   ├── chatRoutes.js
        │   ├── commentRoutes.js
        │   ├── reminderRoutes.js
        │   ├── reportRoutes.js
        │   ├── taskRoutes.js
        │   └── userRoutes.js
        └── uploads/
            ├── attachments-1745157410983-744837053.txt
            ├── chats/
            │   ├── attachments-1745168644765-714386817.txt
            │   ├── attachments-1745168670823-831745076.txt
            │   └── attachments-1745171040229-512460243.txt
            └── profiles/

```

---

## ⚙️ API Endpoints

| Method | Endpoint                  | Description      | Auth   |
| ------ | ------------------------- | ---------------- | ------ |
| POST   | `/api/auth/register`      | Register user    | Public |
| POST   | `/api/auth/login`         | Login + Token    | Public |
| GET    | `/api/users`              | Fetch all users  | Admin  |
| GET    | `/api/users/:id`          | Fetch user by ID | ✅     |
| POST   | `/api/bugs`               | Report a bug     | ✅     |
| GET    | `/api/bugs`               | List all bugs    | ✅     |
| GET    | `/api/bugs/:id`           | View single bug  | ✅     |
| PUT    | `/api/bugs/:id`           | Update bug       | ✅     |
| DELETE | `/api/bugs/:id`           | Delete bug       | Admin  |
| POST   | `/api/comments`           | Add comment      | ✅     |
| GET    | `/api/comments/:bugId`    | View comments    | ✅     |
| POST   | `/api/attachments`        | Upload file      | ✅     |
| GET    | `/api/attachments/:bugId` | View attachments | ✅     |

---

## 📋 User Guide

### 👤 Roles & Access

- **Admin**: Manage users, assign bugs, delete reports.
- **Developer**: View & resolve assigned bugs.
- **Tester**: Report bugs, add evidence.
- **Manager**: Track progress, export reports.

### ✅ Typical Flow

1. Register / Login
2. Report or view bugs
3. Assign bugs to devs
4. Upload logs/screenshots
5. Change bug status (Open → In Progress → Resolved)
6. Get updates via email
7. Export data in PDF/CSV

---

## 🧪 Testing Strategy

- **Backend**: Unit testing with Jest & Mocha
- **API**: Integration testing via Postman
- **Frontend**: Manual testing (Unit testing in progress)

---

## 📆 Timeline

| Milestone             | Status     | Deadline     |
| --------------------- | ---------- | ------------ |
| Backend API           | ✅ Done    | Mar 15, 2025 |
| Frontend Setup        | ✅ Done    | Mar 20, 2025 |
| API Integration       | 🔄 Ongoing | Mar 31, 2025 |
| Feature Completion    | 🟡 Pending | Apr 13, 2025 |
| Deployment & Final QA | 🟡 Pending | Apr 16, 2025 |

---

## 🧩 Future Enhancements

- 🤖 **AI Prioritization** & Smart Auto-Assignment
- 📱 **Mobile Responsive Design**
- 🧠 **Performance Optimization** (MongoDB indexing, caching)
- 🔄 **Real-time Updates** via WebSockets

---

## 👨‍💻 Team & Contributions

| Member            | Role                      | Contributions                                        |
| ----------------- | ------------------------- | ---------------------------------------------------- |
| **Naman Chanana** | Backend & Full-Stack Lead | Auth, Email, DB Design, API Testing                  |
| **Soumya Jain**   | Frontend Developer        | UI Design, React Pages, Figma Design                 |
| **Smriti Walia**  | QA & Research             | Bug Testing, UI Layout, Documentation                |
| **Amulya Jain**   | Integration & DevOps      | Frontend-Backend Link, Fixes, Middleware, Versioning |

---

## 📁 Repository & Resources

- 🔗 GitHub: [CtrlX_Error](https://github.com/Rishy-09/CtrlX_Error)
- 🎨 Figma Design: [View UI](https://www.figma.com/design/wF8zt2Kh5jmG3qMGbCKIPv/Smriti?node-id=0-1&p=f&t=KvNotVyqUWyESyER-0)

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).

---

## 🙌 Acknowledgments

Special thanks to **Dr. Shantanu Agnihotri Sir** for guiding us throughout the software engineering course.

---
