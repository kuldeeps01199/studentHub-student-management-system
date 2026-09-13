import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
    Users, UserCog, BookOpen, FileText, GraduationCap, 
    CheckCircle, XCircle, Clock, TrendingUp, Bell, Calendar, 
    UserPlus, Award, Activity, ArrowRight, Check
} from 'lucide-react';
import api from '../services/api';
import NoticeBoard from '../components/NoticeBoard';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState({
        students: 0,
        teachers: 0,
        courses: 0,
        subjects: 0,
        todayAttendancePct: 0,
        presentStudents: 0,
        absentStudents: 0,
        totalAttendanceRecords: 0
    });

    const [recentAdmissions, setRecentAdmissions] = useState([]);
    const [recentActivities, setRecentActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [stRes, teRes, coRes, suRes, attRes, notRes, resRes] = await Promise.all([
                    api.get('/students'),
                    api.get('/teachers'),
                    api.get('/courses'),
                    api.get('/subjects'),
                    api.get('/attendance'),
                    api.get('/notices'),
                    api.get('/results')
                ]);

                const studentsList = stRes.data || [];
                const teachersList = teRes.data || [];
                const coursesList = coRes.data || [];
                const subjectsList = suRes.data || [];
                const attendanceList = attRes.data || [];
                const noticesList = notRes.data || [];
                const resultsList = resRes.data || [];

                // Calculate Today's / Latest Attendance Metrics
                let totalPresent = 0;
                let totalAbsent = 0;
                let totalRecords = 0;

                const todayStr = new Date().toISOString().split('T')[0];
                const todayAttendanceSessions = attendanceList.filter(session => {
                    const sessionDate = new Date(session.date).toISOString().split('T')[0];
                    return sessionDate === todayStr;
                });

                // If today has sessions, calculate from today; otherwise fallback to overall latest attendance sessions
                const targetSessions = todayAttendanceSessions.length > 0 ? todayAttendanceSessions : attendanceList.slice(-5);

                targetSessions.forEach(session => {
                    session.records?.forEach(rec => {
                        totalRecords++;
                        if (rec.status === 'Present' || rec.status === 'Late') {
                            totalPresent++;
                        } else if (rec.status === 'Absent') {
                            totalAbsent++;
                        }
                    });
                });

                const attPct = totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 0;

                setStats({
                    students: studentsList.length,
                    teachers: teachersList.length,
                    courses: coursesList.length,
                    subjects: subjectsList.length,
                    todayAttendancePct: attPct,
                    presentStudents: totalPresent,
                    absentStudents: totalAbsent,
                    totalAttendanceRecords: totalRecords
                });

                // Recent Admissions (Sorted by creation or last 5)
                const sortedStudents = [...studentsList].reverse().slice(0, 5);
                setRecentAdmissions(sortedStudents);

                // Build System Activity Log
                const activities = [];

                noticesList.slice(-3).forEach(n => {
                    activities.push({
                        id: 'not-' + n._id,
                        type: 'notice',
                        title: `Announcement: ${n.title}`,
                        desc: n.category || 'General Notice',
                        time: new Date(n.createdAt || Date.now()).toLocaleDateString(),
                        icon: <Bell size={15} className="text-amber-600" />,
                        bg: 'bg-amber-50'
                    });
                });

                sortedStudents.slice(0, 3).forEach(s => {
                    activities.push({
                        id: 'stu-' + s._id,
                        type: 'student',
                        title: `New Student Enrolled: ${s.fullName}`,
                        desc: `${s.course?.name || 'Class'} • Roll ${s.rollNumber}`,
                        time: 'Recently',
                        icon: <UserPlus size={15} className="text-indigo-600" />,
                        bg: 'bg-indigo-50'
                    });
                });

                resultsList.slice(-3).forEach(r => {
                    activities.push({
                        id: 'res-' + r._id,
                        type: 'result',
                        title: `Exam Result Entered`,
                        desc: `${r.student?.fullName || 'Student'} scored ${r.marksObtained}/${r.totalMarks} in ${r.subject?.name || 'Subject'}`,
                        time: 'Recently',
                        icon: <Award size={15} className="text-emerald-600" />,
                        bg: 'bg-emerald-50'
                    });
                });

                setRecentActivities(activities.slice(0, 5));

            } catch (error) {
                console.error('Failed to load dashboard data', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const statCards = [
        { 
            title: 'Total Students', 
            value: stats.students, 
            path: '/students', 
            icon: <Users size={22} className="text-indigo-600 group-hover:text-white transition-colors" />, 
            bg: 'bg-indigo-50 group-hover:bg-indigo-600',
            borderColor: 'border-indigo-100',
            hint: 'Manage Students →'
        },
        { 
            title: 'Total Teachers', 
            value: stats.teachers, 
            path: '/teachers', 
            icon: <UserCog size={22} className="text-emerald-600 group-hover:text-white transition-colors" />, 
            bg: 'bg-emerald-50 group-hover:bg-emerald-600',
            borderColor: 'border-emerald-100',
            hint: 'View Faculty Staff →'
        },
        { 
            title: 'Total Courses', 
            value: stats.courses, 
            path: '/courses', 
            icon: <GraduationCap size={22} className="text-amber-600 group-hover:text-white transition-colors" />, 
            bg: 'bg-amber-50 group-hover:bg-amber-600',
            borderColor: 'border-amber-100',
            hint: 'Manage Curriculum →'
        },
        { 
            title: "Today's Attendance", 
            value: `${stats.todayAttendancePct}%`, 
            path: '/attendance/report', 
            icon: <CheckCircle size={22} className="text-teal-600 group-hover:text-white transition-colors" />, 
            bg: 'bg-teal-50 group-hover:bg-teal-600',
            borderColor: 'border-teal-100',
            hint: 'Attendance Report →'
        },
        { 
            title: 'Present Students', 
            value: stats.presentStudents, 
            path: '/attendance/report', 
            icon: <CheckCircle size={22} className="text-green-600 group-hover:text-white transition-colors" />, 
            bg: 'bg-green-50 group-hover:bg-green-600',
            borderColor: 'border-green-100',
            hint: 'Present Students →'
        },
        { 
            title: 'Absent Students', 
            value: stats.absentStudents, 
            path: '/attendance/report', 
            icon: <XCircle size={22} className="text-rose-600 group-hover:text-white transition-colors" />, 
            bg: 'bg-rose-50 group-hover:bg-rose-600',
            borderColor: 'border-rose-100',
            hint: 'Absent Students →'
        }
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Header Welcome */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                        Welcome back, {user?.name}! 👋
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Here is the live institution analytics, attendance, and recent activity overview.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Academic System Active
                    </span>
                </div>
            </div>

            {/* 6 Key Stat Cards Grid */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs animate-pulse h-28"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {statCards.map((card, index) => (
                        <Link 
                            to={card.path} 
                            key={index} 
                            className={`bg-white p-5.5 rounded-2xl border ${card.borderColor} shadow-xs hover:shadow-md transition-all flex flex-col justify-between group active:scale-98`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{card.title}</p>
                                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                                        {card.value}
                                    </h3>
                                </div>
                                <div className={`${card.bg} p-3 rounded-xl transition-all group-hover:scale-105 shadow-2xs flex-shrink-0`}>
                                    {card.icon}
                                </div>
                            </div>
                            <div className="pt-2.5 border-t border-slate-100/80 flex items-center justify-between text-xs font-bold text-slate-400 group-hover:text-indigo-600 transition-colors">
                                <span>{card.hint}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Visual Analytics & Attendance Distribution Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Visual Attendance & Status Visualization Chart */}
                <div className="lg:col-span-2 bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <div>
                            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                                <TrendingUp size={18} className="text-indigo-600" />
                                Today's Attendance Breakdown & Visualization
                            </h2>
                            <p className="text-xs text-slate-400 mt-0.5">Real-time attendance ratio & student presence distribution</p>
                        </div>
                        <Link to="/attendance/report" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
                            Detailed Report →
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                        {/* Donut Visual Chart */}
                        <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="relative w-28 h-28 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                    <path
                                        className="text-slate-200"
                                        strokeWidth="4"
                                        stroke="currentColor"
                                        fill="none"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    />
                                    <path
                                        className="text-emerald-500 transition-all duration-1000"
                                        strokeDasharray={`${stats.todayAttendancePct}, 100`}
                                        strokeWidth="4"
                                        strokeLinecap="round"
                                        stroke="currentColor"
                                        fill="none"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    />
                                </svg>
                                <div className="absolute flex flex-col items-center">
                                    <span className="text-xl font-black text-slate-900">{stats.todayAttendancePct}%</span>
                                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Present</span>
                                </div>
                            </div>
                            <span className="text-xs font-semibold text-slate-600 mt-2">Class Attendance Rate</span>
                        </div>

                        {/* Progress Bar Visualization */}
                        <div className="sm:col-span-2 space-y-4 px-2">
                            <div>
                                <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1.5">
                                    <span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-emerald-400" /> Present Students</span>
                                    <span className="text-emerald-500">{stats.presentStudents} Students ({stats.todayAttendancePct}%)</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2.5">
                                    <div className="bg-emerald-400 h-2.5 rounded-full transition-all duration-500" style={{ width: `${stats.todayAttendancePct}%` }}></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1.5">
                                    <span className="flex items-center gap-1.5"><XCircle size={14} className="text-rose-400" /> Absent Students</span>
                                    <span className="text-rose-400">{stats.absentStudents} Students ({stats.totalAttendanceRecords > 0 ? (100 - stats.todayAttendancePct) : 0}%)</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2.5">
                                    <div className="bg-rose-400 h-2.5 rounded-full transition-all duration-500" style={{ width: `${stats.totalAttendanceRecords > 0 ? (100 - stats.todayAttendancePct) : 0}%` }}></div>
                                </div>
                            </div>

                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                                <span>Total Enrolled Students: <strong className="text-slate-800">{stats.students}</strong></span>
                                <span>Total Faculty: <strong className="text-slate-800">{stats.teachers}</strong></span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-gradient-to-b from-indigo-900 to-indigo-950 text-white p-6 sm:p-7 rounded-2xl shadow-md flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between pb-4 mb-4 border-b border-indigo-800/80">
                            <h3 className="font-bold text-base text-white">Quick Actions</h3>
                            <span className="text-[10px] bg-indigo-800 text-indigo-200 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                {user?.role}
                            </span>
                        </div>

                        <div className="space-y-2.5">
                            {user?.role === 'student' ? (
                                <>
                                <Link to="/report-card" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center justify-between transition-colors shadow-xs">
                                    <span>📄 My Report Card</span>
                                    <ArrowRight size={15} />
                                </Link>
                                <Link to="/attendance/report" className="w-full bg-indigo-800/60 hover:bg-indigo-800 text-white font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center justify-between transition-colors border border-indigo-700/50">
                                    <span>📋 My Attendance</span>
                                    <ArrowRight size={15} />
                                </Link>
                                <Link to="/results/report" className="w-full bg-indigo-800/60 hover:bg-indigo-800 text-white font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center justify-between transition-colors border border-indigo-700/50">
                                    <span>📊 My Results</span>
                                    <ArrowRight size={15} />
                                </Link>
                                </>
                            ) : (
                                <>
                                    <Link to="/attendance" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center justify-between transition-colors shadow-xs">
                                        <span>📋 Mark & Edit Attendance</span>
                                        <ArrowRight size={15} />
                                    </Link>
                                    <Link to="/results" className="w-full bg-indigo-800/60 hover:bg-indigo-800 text-white font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center justify-between transition-colors border border-indigo-700/50">
                                        <span>📊 Enter Exam Results</span>
                                        <ArrowRight size={15} />
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-indigo-800/80 text-[11px] text-indigo-300 text-center">
                        <span>StudentHub</span>
                    </div>
                </div>
            </div>

            {/* Recent Admissions & Recent Activities Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Card 1: Recent Admissions */}
                <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                <UserPlus size={18} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 text-base">Recent Admissions</h3>
                                <p className="text-xs text-slate-400">Newly enrolled students</p>
                            </div>
                        </div>
                        <Link to="/students" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                            View All →
                        </Link>
                    </div>

                    {recentAdmissions.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 text-xs">
                            No recent admissions recorded yet.
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {recentAdmissions.map((student) => (
                                <div key={student._id} className="py-3 flex items-center justify-between hover:bg-slate-50/60 px-2 rounded-xl transition-colors">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center flex-shrink-0">
                                            {student.fullName?.charAt(0).toUpperCase() || 'S'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 text-sm">{student.fullName}</p>
                                            <p className="text-xs text-slate-400">{student.course?.name || 'Computer Course'} • Roll: {student.rollNumber}</p>
                                        </div>
                                    </div>
                                    <span className="text-[11px] font-semibold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-100">
                                        {student.semester || 'Sem 1'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Card 2: Recent Activities Timeline */}
                <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <Activity size={18} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 text-base">Recent Activities</h3>
                                <p className="text-xs text-slate-400">System event timeline & updates</p>
                            </div>
                        </div>
                    </div>

                    {recentActivities.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 text-xs">
                            No recent system activity recorded yet.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {recentActivities.map((act) => (
                                <div key={act.id} className="flex items-start space-x-3">
                                    <div className={`w-8 h-8 rounded-xl ${act.bg} flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs`}>
                                        {act.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-slate-800 text-xs">{act.title}</p>
                                        <p className="text-[11px] text-slate-500 truncate mt-0.5">{act.desc}</p>
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">{act.time}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Notice Board Section */}
            <div className="mt-8">
                <NoticeBoard />
            </div>
        </div>
    );
};

export default Dashboard;
