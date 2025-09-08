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

> 📍 Live Demo: [Ctrl_X-Error](https://ctrl-x-error.vercel.app/)
>
> 🎨 Figma Design: [Figma UI Design](https://www.figma.com/design/wF8zt2Kh5jmG3qMGbCKIPv/Smriti?node-id=0-1&p=f&t=KvNotVyqUWyESyER-0)

---

## Setup Instructions

### Setting up the Backend

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Install dependencies:
  
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:

   ```bash
   PORT=8000
   NODE_ENV=development
   JWT_SECRET=your_jwt_secret_key_change_this_in_production
   MONGO_URI=mongodb://localhost:27017/bugtracker
   CLIENT_URL=http://localhost:5173
   
   # Email configuration (Configure these to enable email sending)
   EMAIL_SERVICE=gmail
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password
   EMAIL_FROM=no-reply@bugtracker.com
   
   # Admin configuration
   ADMIN_INVITE_TOKEN=secret_admin_token_change_this
   ```

4. Start the backend server:

   ```bash
   npm run dev
   ```

### Setting up the Frontend

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the frontend development server:

   ```bash
   npm run dev
   ```

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
| Testing    |  Postman                         |
| Deployment |  Vercel                             |
| Dev Tools  | Git, GitHub, Figma                           |

---

## 🔧 Project Structure

```bash
Directory structure:
rishy-09-ctrlx_error/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── bugController.js
│   │   ├── chatController.js
│   │   ├── reportController.js
│   │   └── userController.js
│   ├── middlewares/
│   │   ├── auth.js
│   │   ├── authmiddleware.js
│   │   └── uploadMiddleware.js
│   ├── models/
│   │   ├── Bug.js
│   │   ├── Chat.js
│   │   ├── Message.js
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── bugRoutes.js
│   │   ├── chatRoutes.js
│   │   ├── reportRoutes.js
│   │   └── userRoutes.js
│   ├── services/
│   │   └── aiService.js
│   ├── uploads/
│   │   └── 1743857317797-profile.jpg
│   ├── package-lock.json
│   ├── package.json
│   └── server.js
│
├── docs/
│   ├── FinalReport.pdf
│   ├── LiveWebsiteLink_Deployment_&_Integrations.pdf
│   ├── PreFinalReport.pdf
│   ├── Presentation.pdf
│   ├── ProjectRiskAnalysisSurvey.xlsx
│   ├── RisksAnalysisReport.pdf
│   ├── SRS.pdf
│   └── StudentFeedbackQuestionnaire_AI_in_Software_Engineering_Projectsform_Responses.xlsx
│
├── frontend/
│   ├── public/
│   │   ├── 4882066.jpg
│   │   ├── logo.png
│   │   └── vite.svg
│   ├── src/
│   │   ├── assets/
│   │   │   ├── images/
│   │   │       ├── Amulya.jpeg
│   │   │       ├── auth-bg.jpeg
│   │   │       ├── bug_tracking.jpg
│   │   │       ├── Naman.png
│   │   │       ├── Smriti.jpeg
│   │   │       └── Soumya.jpeg
│   │   ├── components/
│   │   │   ├── Cards/
│   │   │   │   ├── BugCard.jsx
│   │   │   │   ├── InfoCard.jsx
│   │   │   │   └── UserCard.jsx
│   │   │   ├── Charts/
│   │   │   │   ├── CustomBarChart.jsx
│   │   │   │   ├── CustomLegend.jsx
│   │   │   │   ├── CustomPieChart.jsx
│   │   │   │   └── CustomToolTip.jsx
│   │   │   ├── chat/
│   │   │   │   ├── ChatInput.jsx
│   │   │   │   ├── ChatMessages_fixed.jsx
│   │   │   │   ├── ChatMessages.jsx
│   │   │   │   ├── ChatSettingsModal.jsx
│   │   │   │   ├── ChatSidebar.jsx
│   │   │   │   └── CreateChatModal.jsx
│   │   │   ├── Inputs/
│   │   │   │   ├── AddAttachmentsInput.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── ProfilePhotoSelector.jsx
│   │   │   │   ├── SelectDropdown.jsx
│   │   │   │   ├── SelectUsers.jsx
│   │   │   │   └── ToDoListInput.jsx
│   │   │   ├── layouts/
│   │   │   │   ├── AuthLayout.jsx
│   │   │   │   ├── DashboardLayout.jsx
│   │   │   │   ├── Navbar.jsx
│   │   │   │   └── SideMenu.jsx
│   │   │   ├── AvatarGroup.jsx
│   │   │   ├── BugListTable.jsx
│   │   │   ├── BugStatusTabs.jsx
│   │   │   ├── DeleteAlert.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── Progress.jsx
│   │   ├── context/
│   │   │   ├── ChatContext.jsx
│   │   │   └── userContext.jsx
│   │   ├── hooks/
│   │   │   └── useUserAuth.jsx
│   │   ├── pages/
│   │   │   ├── Admin/
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── CreateBug.jsx
│   │   │   │   ├── ManageBugs.jsx
│   │   │   │   ├── ManageUsers.jsx
│   │   │   │   └── ViewBugAdmin.jsx
│   │   │   ├── Auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   └── Signup.jsx
│   │   │   ├── Developer/
│   │   │   │   ├── AssignedBugs.jsx
│   │   │   │   ├── DeveloperDashboard.jsx
│   │   │   │   ├── UpdateBugStatus.jsx
│   │   │   │   └── ViewAssignedBug.jsx
│   │   │   ├── Tester/
│   │   │   │   ├── AllBugs.jsx
│   │   │   │   ├── CreateBug.jsx
│   │   │   │   ├── MyBugs.jsx
│   │   │   │   ├── TesterDashboard.jsx
│   │   │   │   └── ViewBugDetails.jsx
│   │   │   ├── ChatPage.jsx
│   │   │   └── LandingPage.jsx
│   │   ├── routes/
│   │   │   └── PrivateRoute.jsx
│   │   ├── utils/
│   │   │   ├── apiPaths.js
│   │   │   ├── axiosInstance.js
│   │   │   ├── data.js
│   │   │   ├── helper.js
│   │   │   └── uploadImage.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── README.md
│   ├── vercel.json
│   └── vite.config.js
│
├── .gitignore
└── README.md

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
| API Integration       | ✅ Done | Mar 31, 2025 |
| Feature Completion    | ✅ Done | Apr 13, 2025 |
| Deployment & Final QA | ✅ Done | Apr 16, 2025 |

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
