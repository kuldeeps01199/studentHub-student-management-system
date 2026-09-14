# StudentHub – Student Management System (MERN Stack)

A complete, production-ready **StudentHub – Student Management System** built with the **MERN Stack** (MongoDB, Express.js, React.js, Node.js), featuring **JWT authentication**, **role-based authorization**, **attendance tracking**, **result/marks management**, **visual analytics dashboards**, **comprehensive reporting (PDF & Excel)**, and **image uploads**.

---

## 🚀 Key Features & Deliverables

### 🔐 1. Authentication & Security
- **Secure JWT Authentication**: Token-based auth with auto-expiration and client-side context persistence.
- **Bcrypt Password Encryption**: Salted password hashing (10 rounds) for all user accounts.
- **Role-Based Authorization**: Strict access control for **Admin**, **Teacher**, and **Student** roles.
- **Password Reset**: Email-based forgotten password recovery workflow.

### 📊 2. Interactive Dashboard & Analytics
- **Live Stat Cards**: Total Students, Teachers, Courses, Today's Attendance %, Present & Absent counts.
- **SVG Donut Chart & Progress Bars**: Real-time class presence distribution.
- **Recent Admissions & Activity Log**: Real-time institutional event timeline.

### 🎓 3. Student Management
- Full CRUD: Add, Edit, Delete, View, Search, Filter, Sort, and Paginate student records.
- **Multi-Tab Profile Modal**: Personal Info, Attendance Summary, Results, Enrolled Subjects, Profile Image.
- **Printable Official Transcript**: Report card generator view.

### 👨‍🏫 4. Teacher Management
- Faculty profile management with **Assign Courses** (`assignedCourses`) & **Assign Subjects** selectors.
- Drawer preview & role badge indicators.

### 📚 5. Course & Subject Management
- **Course Management**: Add/Edit/Delete Courses with instant presets (**BCA**, **B.Tech**, **MBA**, **MCA**).
- **Subject Management**: Semester-wise subject listing (Sem 1–8), subject codes, and **Grouped Course Card View**.

### 📅 6. Attendance Management
- **Mark & Edit Attendance**: Daily attendance marking with quick **Mark All** (Present/Absent/Late) buttons.
- **Live Stat Counters**: Real-time count of Present, Absent, and Late students as you toggle.
- **3-Tab Attendance Reports**: Summary Report, Daily Sessions List, and Monthly Report.

### 🏆 7. Result & Marks Management
- **Subject-Wise Marks Entry**: Enter marks for all subjects of a selected student in one clean interface.
- **Auto Calculation**: Instant evaluation of **Total Marks**, **Percentage**, **Grade (`A+`, `A`, `B`, `C`, `D`, `Fail`)**, and **Pass/Fail Status**.
- **Results Report**: Detailed examination reporting with filters and CSV exports.

### 📁 8. Comprehensive Reports Central Hub
- **6 Report Modules**: Student List, Attendance Report, Result Report, Student Performance Analytics, Pass Percentage Stats, and Monthly Attendance.
- **Export Formats**: One-click **PDF Print** (`window.print()`) and **Excel/CSV Spreadsheet** download.

---

## 🛠️ Technology Stack

- **Frontend**: React.js 19, React Router v7, Axios, Tailwind CSS v4, Chart.js, Lucide Icons, jsPDF, ExcelJS
- **Backend**: Node.js, Express.js v5, Mongoose v9, JWT (`jsonwebtoken`), BcryptJS, Multer, PDFKit, Nodemailer
- **Database**: MongoDB (Local `mongodb://127.0.0.1:27017/student_management` or MongoDB Atlas Cloud)

---

## 📁 Database Schema Collections

1. **`users`**: Login credentials (`name`, `email`, `password`, `role`)
2. **`students`**: Student profiles (`fullName`, `rollNumber`, `admissionNumber`, `course`, `semester`, `profileImage`)
3. **`teachers`**: Faculty records (`fullName`, `employeeId`, `phone`, `assignedSubjects`, `assignedCourses`)
4. **`courses`**: Academic programs (`name`, `code`, `description`)
5. **`subjects`**: Subjects (`name`, `code`, `course`, `semester`)
6. **`attendances`**: Daily class sessions (`date`, `course`, `semester`, `records[{student, status}]`)
7. **`results`**: Exam results (`student`, `course`, `semester`, `subject`, `examType`, `marksObtained`, `totalMarks`)

---

## 💻 Installation & Setup Instructions

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB Server running locally OR a MongoDB Atlas URI string.

### 1. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/student_management
JWT_SECRET=jwtkey_12345
NODE_ENV=development
```

Run seed script to populate default Courses & Subjects:
```bash
node seedCourses.js
```

Start the backend server:
```bash
npm run dev
```
*(Server starts at `http://localhost:5000`)*

---

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*(Frontend starts at `http://localhost:5173` or Vite port)*

---

## 🌐 RESTful API Endpoints Summary

- **Auth**: `/api/auth/login`, `/api/auth/profile`, `/api/auth/forgot-password`
- **Users**: `/api/users` (CRUD)
- **Students**: `/api/students` (CRUD)
- **Teachers**: `/api/teachers` (CRUD)
- **Courses**: `/api/courses` (CRUD)
- **Subjects**: `/api/subjects` (CRUD)
- **Attendance**: `/api/attendance` (CRUD)
- **Results**: `/api/results` (CRUD)

---

## 📄 License
MIT License — Free to use and customize for student management project needs.
