# 🎓 PVPSIT Digital Notice Board (MERN Stack)

The official **Digital Notice Board Application** for **Prasad V. Potluri Siddhartha Institute of Technology (PVPSIT College)**.

Built with the **MERN stack** (MongoDB, Express.js, React.js, Node.js), this application provides a centralized, real-time portal where college administrators can publish both **College-wide** and **Department-specific** official announcements with **Notice Expiry Automation**, and students can view, search, and filter circulars relevant to their branch.

---

## 📌 Table of Contents

- [Project Overview](#-project-overview)
- [Key Features](#-key-features)
  - [Student Features](#student-features)
  - [Admin Features](#admin-features)
  - [Notice Expiry & Lifecycle Automation](#notice-expiry--lifecycle-automation)
  - [Notice Visibility & Scope Logic](#notice-visibility--scope-logic)
- [Departments Supported](#-departments-supported)
- [Notice Categories](#-notice-categories)
- [Technology Stack](#-technology-stack)
- [System Architecture & Folder Structure](#-system-architecture--folder-structure)
- [Database Schema (MongoDB)](#-database-schema-mongodb)
- [REST API Endpoints](#-rest-api-endpoints)
- [Environment Variables](#-environment-variables)
- [Installation & Getting Started](#-installation--getting-started)
  - [1. Backend Setup & Seeding](#1-backend-setup--seeding)
  - [2. Frontend Setup](#2-frontend-setup)
- [Demo Credentials](#-demo-credentials)
- [React Routes](#-react-routes)
- [Testing & Validation](#-testing--validation)
- [License](#-license)

---

## 🏛 Project Overview

In **PVPSIT College**, official communication needs to reach either the entire student body (e.g., examination schedules, holidays, placement drives) or specific branches (e.g., CSE Technical Fest, ECE VLSI lab, Mechanical Industrial Visit).

The **PVPSIT Digital Notice Board** solves this by:
1. Enabling administrators to tag notices as **College-wide** or **Department-specific**.
2. Automatically filtering department notices so students only see announcements relevant to their branch.
3. Automatically excluding **expired notices** from public and student dashboards while preserving admin oversight and auditing.
4. Providing single unified authentication with JWT for students and administrators.
5. Ensuring fast, responsive, and permanent data storage in MongoDB.

---

## ✨ Key Features

### 🎓 Student Features
* **Student Account Registration (`/register`):** Students register with Name, Email, Password, Department, and Roll Number / Student ID.
* **Unified Login (`/login`):** Direct sign-in with instant demo auto-fill buttons for quick testing.
* **Personalized Dashboard (`/notices`):** Displays **"Welcome, [Student Name]"** along with Department & Roll Number.
* **Scope Filtering:**
  * `All Notices`: Displays College-wide notices + notices for the student's department.
  * `College-wide`: Shows institutional circulars visible to all students.
  * `My Department`: Filters only circulars designated for the student's department.
* **Automatic Expiry Isolation:** Students only see currently active notices. Expired announcements are automatically removed.
* **Category Filtering:** Filter by `Examinations`, `Academics`, `Circulars`, `Placements`, `Events`, `Workshops & FDPs`, `Scholarships`, `Fees`, `Student Activities`, `Urgent`, `General`.
* **Instant Keyword Search:** Real-time search across titles, descriptions, authors, and departments.
* **Detailed Circular Page (`/notice/:id`):** Full announcement text, publishing authority, publish date, expiry schedule, print preview, and shareable URL.
* **Student Profile (`/profile`):** View registered branch, roll number, and account details.

### 🛡️ Admin Features
* **Admin Dashboard (`/admin`):**
  * Overview Metric Cards: **Total Notices**, **Active Notices**, **Expired Notices**, **Important Notices**.
  * Complete notice management table: `Title | Type | Department | Category | Published | Expiry Date | Status | Actions (View, Edit, Delete)`.
  * Status filter: Toggle between `All Statuses`, `Active Only`, and `Expired Only`.
* **Notice Expiry Management (`/admin/notices/create` & `/admin/notices/edit/:id`):**
  * Select optional Expiry Date with automated validation (cannot be earlier than creation date).
  * Notices without an expiry date remain active indefinitely until manually modified or removed.
* **Create Notice (`/admin/notices/create`):**
  * Select Notice Scope: **College-wide** or **Department**.
  * Target department selection (`CSE`, `ECE`, `IT`, etc.).
  * High Priority / Urgent toggle (`IMPORTANT` badge & ticker alert).
* **Edit & Delete Notices (`/admin/notices/edit/:id`):** Full editing capabilities and soft/hard delete with confirmation modals.
* **Secure Authorization:** Token-based security ensures unauthorized students cannot create, modify, or delete notices.

### ⏳ Notice Expiry & Lifecycle Automation
* **Validation:** The backend enforces `expiresAt >= createdAt`. Expired timestamps in the past are rejected with `400 Bad Request`.
* **Backend Expiry Exclusion:** `GET /api/notices` and `GET /api/notices/:id` automatically filter out expired notices for students and guests.
* **Admin Visibility:** Administrators retain access to all historical notices with dedicated `StatusBadge` indicators (`Active` / `Expired`).

### 🎯 Notice Visibility & Scope Logic
| Notice Type | Active Notice Visibility | Expired Notice Visibility |
| :--- | :--- | :--- |
| **College-wide** | Visible to **All students**, faculty, and visitors | Hidden from students; visible to **Admins only** |
| **Department: CSE** | Visible **only to CSE students** and Admins | Hidden from students; visible to **Admins only** |
| **Department: ECE** | Visible **only to ECE students** and Admins | Hidden from students; visible to **Admins only** |
| **Department: IT/Mech/Civil** | Visible **only to respective department students** | Hidden from students; visible to **Admins only** |

---

## 🏢 Departments Supported

* **CSE** – Computer Science & Engineering
* **CSE (AI & ML)** – Artificial Intelligence & Machine Learning
* **CSE (Data Science)** – Data Science
* **ECE** – Electronics & Communication Engineering
* **EEE** – Electrical & Electronics Engineering
* **Mechanical** – Mechanical Engineering
* **Civil** – Civil Engineering
* **IT** – Information Technology

---

## 🏷️ Notice Categories

* `General`
* `Academics`
* `Examinations`
* `Circulars`
* `Placements`
* `Events`
* `Workshops & FDPs`
* `Scholarships`
* `Fees`
* `Student Activities`
* `Urgent`

---

## 🛠 Technology Stack

### Frontend
- **React.js 18+ (Vite)**
- **React Router DOM v6** (with role-protected route guards)
- **Vanilla CSS3** (PVPSIT-tailored responsive design system)
- **Axios** (With JWT Bearer request interceptors)
- **Lucide React** (Modern SVG iconography)

### Backend
- **Node.js & Express.js**
- **MongoDB & Mongoose**
- **JSON Web Tokens (JWT)** (Secure stateless authentication)
- **Bcrypt.js** (Salted password hashing)
- **CORS & Dotenv**

---

## 📂 System Architecture & Folder Structure

```text
PVPSIT-Notice-Board/
│
├── frontend/                   # React Frontend (Vite)
│   ├── src/
│   │   ├── components/         # Navbar, Footer, NoticeCard, NoticeBadge, StatCard, AdminSidebar, Modal, ProtectedRoute
│   │   ├── pages/              # HomePage (/notices), NoticeDetailPage (/notice/:id), AdminLoginPage (/login),
│   │   │                       # RegisterPage (/register), ProfilePage (/profile), AdminDashboardPage (/admin),
│   │   │                       # AddNoticePage (/admin/notices/create), EditNoticePage (/admin/notices/edit/:id)
│   │   ├── services/api.js     # Axios API service & interceptors
│   │   ├── context/AuthContext.jsx # Global User & JWT auth provider
│   │   ├── App.jsx             # React Routes & route guards
│   │   ├── index.css           # PVPSIT Design System & tokens
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── backend/                    # Express REST API Backend
│   ├── config/
│   │   ├── db.js               # MongoDB Mongoose connection
│   │   └── collegeConfig.js    # Departments & Categories constants
│   ├── models/                 # User.js (Students & Admins) & Notice.js
│   ├── controllers/            # authController.js & noticeController.js
│   ├── middleware/             # authMiddleware.js & errorMiddleware.js
│   ├── routes/                 # authRoutes.js & noticeRoutes.js
│   ├── seed/seedData.js        # Seed script for realistic PVPSIT notices & demo users
│   ├── test_audit.js           # Comprehensive 34-test REST API audit suite
│   ├── test_persistence.js    # Cold reboot persistence validation
│   ├── .env                    # Environment configuration
│   ├── package.json
│   └── server.js               # Express application entry
│
├── .env.example
├── README.md
└── package.json
```

---

## 🗄 Database Schema (MongoDB)

### 1. `User` Model (`backend/models/User.js`)
| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `name` | String | Required, Trim, Max: 80 | Full name of the user |
| `email` | String | Required, Unique, Lowercase, Regex valid | Official email address |
| `password` | String | Required, Min: 6, Bcrypt hashed, `select: false` | Encrypted password |
| `role` | String | Enum: `['student', 'admin']`, Default: `'student'` | Access level |
| `department` | String | Enum: `['All', ...DEPARTMENTS]`, Default: `'CSE'` | Student branch |
| `studentId` | String | Trim, Default: `''` | Student Roll Number (e.g., `21VR1A0542`) |
| `createdAt` / `updatedAt` | Date | Auto-generated by Mongoose | Timestamps |

### 2. `Notice` Model (`backend/models/Notice.js`)
| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `title` | String | Required, Trim, 3–180 chars | Descriptive title of circular |
| `description` | String | Required, Trim, Min: 5 chars | Full announcement text and instructions |
| `scope` | String | Enum: `['College-wide', 'Department']`, Default: `'College-wide'` | Target audience scope |
| `department` | String | Enum: `['All', ...DEPARTMENTS]`, Default: `'All'` | Targeted department |
| `category` | String | Required, Enum: `CATEGORIES`, Default: `'General'` | Circular classification |
| `author` | String | Required, Trim, Max: 100 chars | Issuing authority |
| `isImportant` | Boolean | Default: `false` | Priority flag (badges & marquee ticker) |
| `expiresAt` | Date | Default: `null` | Optional date after which notice expires |
| `createdAt` / `updatedAt` | Date | Auto-generated by Mongoose | Timestamps |

---

## 🚀 REST API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new Student account |
| `POST` | `/api/auth/login` | Public | Authenticate Student or Admin (returns JWT) |
| `GET` | `/api/auth/profile` | Private (Auth) | Get authenticated user profile |

### Notices (`/api/notices`)
| Method | Endpoint | Access | Query Parameters | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/notices` | Public / Auth | `scope`, `category`, `search`, `important`, `status` | Role-filtered notice list (excludes expired for students/guests) |
| `GET` | `/api/notices/:id` | Public / Auth | None | Fetch single notice (returns 404 if expired for non-admins) |
| `GET` | `/api/notices/stats/summary` | Admin | None | Metric counts (total, active, expired, college-wide, etc.) |
| `POST` | `/api/notices` | Admin | None | Create a new notice with optional `expiresAt` |
| `PUT` | `/api/notices/:id` | Admin | None | Update existing notice and expiry schedule |
| `DELETE` | `/api/notices/:id` | Admin | None | Permanently delete notice from MongoDB |

### Configuration (`/api/config`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/config` | Public | Returns dynamic college departments and categories |

---

## ⚙️ Environment Variables

Create `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/college_notice_board
JWT_SECRET=pvpsit_digital_notice_board_jwt_secret_key_2026
ADMIN_EMAIL=admin@pvpsit.ac.in
ADMIN_PASSWORD=admin123
```

---

## 📦 Installation & Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (running locally on port 27017 or via MongoDB Atlas URI)

---

### 1. Backend Setup & Seeding

```bash
# In backend directory
cd backend
npm install
node seed/seedData.js   # Seeds 13 notices and demo accounts
node server.js          # Starts Express server on http://localhost:5000
```

---

### 2. Frontend Setup

```bash
# In frontend directory
cd frontend
npm install
npm run dev             # Starts Vite dev server on http://localhost:3000
```

---

## 🔑 Demo Credentials

| Role | Email | Password | Department & Details |
| :--- | :--- | :--- | :--- |
| 🛡️ **Administrator** | `admin@pvpsit.ac.in` | `admin123` | Full CRUD, Expiry Setting & Admin Dashboard Rights |
| 🎓 **CSE Student** | `rahul.cse@pvpsit.ac.in` | `student123` | Dept: CSE • Roll No: 21VR1A0542 |
| 🎓 **ECE Student** | `sneha.ece@pvpsit.ac.in` | `student123` | Dept: ECE • Roll No: 21VR1A0418 |
| 🎓 **IT Student** | `ananya.it@pvpsit.ac.in` | `student123` | Dept: IT • Roll No: 21VR1A1205 |

---

## 🧭 React Routes

| Path | Component | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `/` or `/notices` | `HomePage` | Public | Main Notice Board with search, category & scope filters |
| `/notice/:id` | `NoticeDetailPage` | Public | Full circular text, metadata, print & share buttons |
| `/login` | `AdminLoginPage` | Public | Unified sign-in with 1-click demo auto-fill |
| `/register` | `RegisterPage` | Public | Student account registration |
| `/profile` | `ProfilePage` | Private (Auth) | User information and registered department |
| `/admin` | `AdminDashboardPage` | Private (Admin) | Notice management table, metric cards, status filters |
| `/admin/notices/create` | `AddNoticePage` | Private (Admin) | Create notice with scope & expiry date selector |
| `/admin/notices/edit/:id` | `EditNoticePage` | Private (Admin) | Update existing notice and expiry dates |

---

## 🧪 Testing & Validation

The application is accompanied by automated test suites validating all API contracts and database persistence:

```bash
# Run backend audit test suite (34 automated tests)
node backend/test_audit.js

# Run MongoDB persistence across cold restarts
node backend/test_persistence.js
```

### Verified Test Assertions:
1. Student registration & duplicate email rejection.
2. Unified login & JWT issuance with department payload.
3. Department notice isolation (CSE students see CSE notices; blocked from ECE/Mech notices).
4. Student unauthorized mutation attempts blocked with `403 Forbidden`.
5. Expiry validation: Rejection of past expiry dates on notice creation (`400`).
6. Student & Guest exclusion of expired circulars (`GET /api/notices`).
7. Admin visibility of expired circulars with status filtering.
8. Single notice endpoint (`GET /api/notices/:id`) returns `404` to students for expired notices.
9. Admin stats summary endpoint returns total, active, and expired notice counts.
10. Full database persistence across cold reboot simulations.

---

## 📜 License

Developed for academic demonstration, evaluation, and full-stack coursework at **PVPSIT College**. Open-source under the ISC license.
