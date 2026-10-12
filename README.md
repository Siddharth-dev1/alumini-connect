# ALUMNI CONNECT - Student & Alumni Networking Platform

**Alumni Connect** is a complete, production-grade MERN stack web application built for **KIT's College of Engineering (Autonomous), Kolhapur** based on the official Software Requirements Specification (SRS) document.

The platform bridges current students and verified alumni for 1-on-1 mentorship, career guidance, job & internship referrals, event registrations, and real-time interactive messaging.

---

## 🚀 Technology Stack

### Backend
- **Node.js** & **Express.js** RESTful APIs
- **MongoDB** & **Mongoose ODM**
- **JWT (JSON Web Tokens)** Authentication & Role Authorization Middleware
- **bcryptjs** Password Hashing
- **Socket.IO** for Real-Time 1-on-1 Messaging & Notifications
- **Multer** for Career Resource Document & File Uploads

### Frontend
- **React.js** (Vite)
- **React Router v6**
- **Axios** HTTP Client
- **Context API** (AuthContext, SocketContext, NotificationContext)
- **Lucide React** Icon Library
- Responsive Modern CSS Custom System (Desktop, Tablet, Mobile)

---

## 🔑 Demo Login Credentials

The database comes pre-populated with realistic seed accounts for immediate testing:

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Student** | `student@alumniconnect.com` | `Student@123` | Student Dashboard, Mentorship Requests, Alumni Search, Job Applications |
| **Alumni** | `alumni@alumniconnect.com` | `Alumni@123` | Alumni Dashboard, Mentorship Management, Post Jobs & Events |
| **Admin** | `admin@alumniconnect.com` | `Admin@123` | Full Governance, User Management, Alumni Verification, Event Request Approvals |

---

## 📁 Project Structure

```
Application/
├── backend/
│   ├── config/             # Database connection setup (db.js)
│   ├── controllers/        # Express request controllers
│   ├── middleware/         # JWT Auth, Role Authorization & Multer Uploads
│   ├── models/             # Mongoose Schemas (User, Profiles, ConnectionRequest, Mentorship, Jobs, Events, etc.)
│   ├── routes/             # REST API routes
│   ├── seed/               # Database seed script (seed.js)
│   ├── socket/             # Socket.IO event handler
│   ├── uploads/            # File upload destination
│   ├── .env                # Environment configuration
│   ├── package.json
│   └── server.js           # Server entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/     # Navbar, Sidebar, Modal, UI Helpers
│   │   ├── context/        # AuthContext, SocketContext, NotificationContext
│   │   ├── layouts/        # DashboardLayout with Role Protection
│   │   ├── pages/          # Landing, Login, Register, Dashboards, Directories, Workflows
│   │   ├── services/       # Axios API client
│   │   ├── App.jsx         # React Router configuration
│   │   ├── main.jsx
│   │   └── index.css       # Responsive styling
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## ⚙️ Installation & Setup Guide

### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally on `mongodb://127.0.0.1:27017/alumniconnect` or MongoDB Atlas)

---

### Step 1: Backend Setup & Seeding

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Seed the MongoDB Database with initial users, connection requests, jobs, events, and resources:
   ```bash
   npm run seed
   ```

4. Start the backend server:
   ```bash
   npm run dev
   ```
   *The server runs on `http://localhost:5000`.*

---

### Step 2: Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend application runs on `http://localhost:5173`.*

---

## 🛠️ Main Features & Modules

1. **User Authentication & Role Governance**:
   - Role-based registration & login (Student, Alumni, Admin).
   - Alumni verification workflow by University Administrator.

2. **Alumni & Student Directory**:
   - Advanced search & multi-filtering by Name, Graduation Year, Department, Company, Industry, Skills, and Location.

3. **Connection Requests (LinkedIn-Style)**:
   - Real-time connection request sending, acceptance, rejection, and synchronized status indicators.

4. **Mentorship Management**:
   - Structured 1-on-1 mentorship workflow with topic selection, message, preferred date/time slot, alumni scheduling, and meeting room links.

5. **Career & Opportunity Portal**:
   - Post full-time jobs, internships, and training programs.
   - Student job application system with resume URL and cover note.
   - Application status tracking (Applied, Under Review, Shortlisted, Selected, Rejected).

6. **Event Management & Event Requests**:
   - Alumni/Admin event creation (Webinars, Workshops, Alumni Meets, Industrial Visits).
   - Student event registration and participant rosters.
   - Student & Alumni Event Creation Request workflow with Admin approval.

7. **Real-time Messaging System**:
   - One-to-one messaging powered by Socket.IO with unread message badges and message history.

8. **Career Resource Hub**:
   - Shared library for ATS resume templates, interview prep primers, and study guides.

---

## 📄 License & Credits
Developed for **KIT's College of Engineering (Empowered Autonomous), Kolhapur** - Department of Computer Science and Business Systems.
