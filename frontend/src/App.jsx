import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import StudentList from './pages/students/StudentList';
import StudentForm from './pages/students/StudentForm';
import TeacherList from './pages/teachers/TeacherList';
import TeacherForm from './pages/teachers/TeacherForm';
import CourseList from './pages/courses/CourseList';
import SubjectList from './pages/subjects/SubjectList';
import MarkAttendance from './pages/attendance/MarkAttendance';
import AttendanceReport from './pages/attendance/AttendanceReport';
import ResultManager from './pages/results/ResultManager';
import ResultReport from './pages/results/ResultReport';
import ReportCard from './pages/students/ReportCard';
import ReportsHub from './pages/reports/ReportsHub';

const RootRoute = () => {
    const { user, loading } = useContext(AuthContext);
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) {
        if (location.pathname === '/') {
            return <LandingPage />;
        }
        return <Navigate to="/login" replace />;
    }

    return <Layout />;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/home" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected & Root Routes */}
            <Route path="/" element={<RootRoute />}>
              <Route index element={<Dashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="students" element={<StudentList />} />
              <Route path="students/new" element={<StudentForm />} />
              <Route path="students/:id/edit" element={<StudentForm />} />
              <Route path="teachers" element={<TeacherList />} />
              <Route path="teachers/new" element={<TeacherForm />} />
              <Route path="teachers/:id/edit" element={<TeacherForm />} />
              <Route path="courses" element={<CourseList />} />
              <Route path="subjects" element={<SubjectList />} />
              <Route path="attendance" element={<MarkAttendance />} />
              <Route path="attendance/report" element={<AttendanceReport />} />
              <Route path="results" element={<ResultManager />} />
              <Route path="results/report" element={<ResultReport />} />
              <Route path="reports" element={<ReportsHub />} />
              <Route path="report-card" element={<ReportCard />} />
            </Route>
            {/* Catch-all fallback */}
            <Route path="*" element={<LandingPage />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
