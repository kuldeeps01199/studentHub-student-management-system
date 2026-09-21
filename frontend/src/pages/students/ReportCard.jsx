import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { GraduationCap, Printer, Download, Award, CheckCircle, Clock, BookOpen, User, Calendar, FileText } from 'lucide-react';

const ReportCard = () => {
    const { user } = useContext(AuthContext);
    const [studentProfile, setStudentProfile] = useState(null);
    const [results, setResults] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);

    const [allStudents, setAllStudents] = useState([]);
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [teachersList, setTeachersList] = useState([]);

    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                const userId = user?._id || user?.id;
                const { data: studentsData } = await api.get('/students');
                const { data: teachersData } = await api.get('/teachers').catch(() => ({ data: [] }));
                setTeachersList(teachersData || []);

                if (user?.role === 'student') {
                    // Student apna khud ka data dekhega
                    const currentStudent = studentsData.find(s => String(s.user?._id || s.user) === String(userId));
                    setStudentProfile(currentStudent);
                    if (currentStudent) {
                        const { data: resultsData } = await api.get(`/results?student=${currentStudent._id}`);
                        setResults(resultsData);
                        const { data: attendanceData } = await api.get(`/attendance?course=${currentStudent.course?._id || ''}&semester=${currentStudent.semester || ''}`);
                        setAttendance(attendanceData);
                    }
                } else {
                    // Admin/Teacher — sabhi students ki list dikhao
                    setAllStudents(studentsData);
                }
            } catch (err) {
                console.error('Error fetching report card data', err);
            } finally {
                setLoading(false);
            }
        };

        fetchStudentData();
    }, [user]);

    // Admin student select kare toh uska data load karo
    useEffect(() => {
        if (!selectedStudentId || user?.role === 'student') return;
        const loadSelectedStudent = async () => {
            const selected = allStudents.find(s => s._id === selectedStudentId);
            setStudentProfile(selected);
            if (selected) {
                const { data: resultsData } = await api.get(`/results?student=${selected._id}`);
                setResults(resultsData);
                const { data: attendanceData } = await api.get(`/attendance?course=${selected.course?._id || ''}&semester=${selected.semester || ''}`);
                setAttendance(attendanceData);
            }
        };
        loadSelectedStudent();
    }, [selectedStudentId]);

    const getGrade = (obtained, total) => {
        const pct = (obtained / total) * 100;
        if (pct >= 90) return { grade: 'A+', remark: 'Outstanding', color: 'text-emerald-700 bg-emerald-50' };
        if (pct >= 80) return { grade: 'A', remark: 'Excellent', color: 'text-green-700 bg-green-50' };
        if (pct >= 70) return { grade: 'B', remark: 'Very Good', color: 'text-blue-700 bg-blue-50' };
        if (pct >= 60) return { grade: 'C', remark: 'Good', color: 'text-indigo-700 bg-indigo-50' };
        if (pct >= 50) return { grade: 'D', remark: 'Satisfactory', color: 'text-amber-700 bg-amber-50' };
        return { grade: 'F', remark: 'Needs Improvement', color: 'text-red-700 bg-red-50' };
    };

    // Calculate Marks Totals
    const totalObtained = results.reduce((acc, r) => acc + (r.marksObtained || 0), 0);
    const totalMax = results.reduce((acc, r) => acc + (r.totalMarks || 100), 0);
    const overallPct = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;
    const overallGrade = getGrade(totalObtained, totalMax || 100);

    // Calculate Attendance Totals
    let presentCount = 0;
    let totalSessions = 0;
    attendance.forEach(session => {
        const record = session.records?.find(r => String(r.student?._id || r.student) === String(studentProfile?._id));
        if (record) {
            totalSessions++;
            if (record.status === 'Present' || record.status === 'Late') {
                presentCount++;
            }
        }
    });
    const attendancePct = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0;

    // Find assigned teacher for student's course, or fallback to first teacher
    const assignedTeacher = teachersList.find(t => 
        t.assignedCourses?.some(c => String(c._id || c) === String(studentProfile?.course?._id || studentProfile?.course))
    ) || teachersList[0];

    const classTeacherName = assignedTeacher ? assignedTeacher.fullName : 'Prof. Class In-charge';

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto py-12 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
                <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-slate-500 font-medium text-sm">Generating Official Report Card...</p>
            </div>
        );
    }

    // Admin / Teacher dropdown selector if no student selected yet
    const isStaff = user?.role === 'admin' || user?.role === 'teacher';

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Top Action Bar (Hidden when printing) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm print:hidden">
                <div>
                    <h1 className="text-xl font-bold text-slate-800">Academic Report Card</h1>
                    <p className="text-slate-500 text-xs mt-0.5">Official Student Evaluation & Progress Transcript</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                    {/* Admin / Teacher Student Dropdown */}
                    {isStaff && (
                        <div className="flex items-center space-x-2">
                            <label className="text-xs font-semibold text-slate-600 whitespace-nowrap">Select Student:</label>
                            <select
                                value={selectedStudentId}
                                onChange={(e) => setSelectedStudentId(e.target.value)}
                                className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            >
                                <option value="">-- Choose Student --</option>
                                {allStudents.map(s => (
                                    <option key={s._id} value={s._id}>
                                        {s.fullName} ({s.rollNumber || 'No Roll'}) • {s.course?.name || 'Class'}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {studentProfile && (
                        <button
                            onClick={handlePrint}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl font-semibold text-sm flex items-center space-x-2 shadow-sm transition-all active:scale-95"
                        >
                            <Printer size={16} />
                            <span>Print / Download PDF</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Prompt if Admin/Teacher hasn't selected a student yet */}
            {isStaff && !studentProfile && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
                    <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <User size={32} className="text-indigo-600" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Select a Student</h2>
                    <p className="text-slate-500 text-sm max-w-md mx-auto">
                        Aap Admin hain. Upar diye gaye dropdown se student select karein unka official Report Card dekhne ke liye.
                    </p>
                </div>
            )}

            {/* Printable Report Card Container (Only when student profile is loaded) */}
            {studentProfile && (
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md p-6 sm:p-10 print:shadow-none print:border-none print:p-0 space-y-8">
                    
                    {/* Official Letterhead Header */}
                    <div className="border-b-2 border-indigo-900 pb-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                        <div className="flex items-center space-x-4">
                            <img 
                                src="/logo.jpg" 
                                alt="StudentHub Logo" 
                                className="w-16 h-16 rounded-2xl object-contain bg-slate-50 p-1 border border-slate-200 shadow-md flex-shrink-0"
                            />
                            <div>
                                <h2 className="text-2xl font-black text-indigo-950 tracking-tight uppercase">StudentHub</h2>
                                <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest mt-0.5">Student Management System</p>
                                <p className="text-xs text-slate-400 mt-1">Academic Session: {(() => { const now = new Date(); const yr = now.getMonth() >= 5 ? now.getFullYear() : now.getFullYear() - 1; return `${yr}–${yr + 1}`; })()}</p>
                            </div>
                        </div>
                        <div className="text-right sm:text-right text-xs text-slate-500 border-t sm:border-t-0 pt-3 sm:pt-0 w-full sm:w-auto">
                            <p className="font-bold text-slate-700">Issued On: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                            <p className="text-slate-400 mt-0.5">Status: <span className="text-emerald-600 font-bold">OFFICIAL</span></p>
                        </div>
                    </div>

                    {/* Student Details Grid */}
                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/60">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-200/60 pb-2">
                            Student Demographics & Class Details
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                            <div>
                                <span className="text-slate-400 block font-medium">Student Full Name</span>
                                <span className="font-bold text-slate-900 text-sm">{studentProfile?.fullName || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="text-slate-400 block font-medium">Roll Number</span>
                                <span className="font-bold text-indigo-700 text-sm">{studentProfile?.rollNumber || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="text-slate-400 block font-medium">Admission No.</span>
                            <span className="font-semibold text-slate-800">{studentProfile?.admissionNumber || 'N/A'}</span>
                        </div>
                        <div>
                            <span className="text-slate-400 block font-medium">Current Course</span>
                            <span className="font-semibold text-slate-800">{studentProfile?.course?.name || 'N/A'}</span>
                        </div>
                        <div>
                            <span className="text-slate-400 block font-medium">Semester</span>
                            <span className="font-semibold text-slate-800">{studentProfile?.semester || 'N/A'}</span>
                        </div>
                        <div>
                            <span className="text-slate-400 block font-medium">Email Address</span>
                            <span className="font-semibold text-slate-700 truncate block">{studentProfile?.user?.email || user?.email}</span>
                        </div>
                        <div>
                            <span className="text-slate-400 block font-medium">Phone Number</span>
                            <span className="font-semibold text-slate-700">{studentProfile?.phone || 'N/A'}</span>
                        </div>
                        <div>
                            <span className="text-slate-400 block font-medium">Attendance Ratio</span>
                            <span className={`font-bold ${attendancePct >= 75 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                {attendancePct}% ({presentCount}/{totalSessions} classes)
                            </span>
                        </div>
                    </div>
                </div>

                {/* Academic Results Table */}
                <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <BookOpen size={16} className="text-indigo-600" />
                        Subject-wise Examination Performance
                    </h3>

                    {results.length === 0 ? (
                        <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200/60 text-slate-400 text-sm">
                            No examination marks recorded yet for this student.
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-xl border border-slate-200">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-indigo-900 text-white font-semibold uppercase tracking-wider">
                                        <th className="p-3.5">Subject Code</th>
                                        <th className="p-3.5">Subject Title</th>
                                        <th className="p-3.5">Exam Type</th>
                                        <th className="p-3.5 text-center">Marks Obtained</th>
                                        <th className="p-3.5 text-center">Max Marks</th>
                                        <th className="p-3.5 text-center">Percentage</th>
                                        <th className="p-3.5 text-center">Grade</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {results.map((r, i) => {
                                        const pct = Math.round((r.marksObtained / r.totalMarks) * 100);
                                        const { grade, color } = getGrade(r.marksObtained, r.totalMarks);
                                        return (
                                            <tr key={r._id || i} className="hover:bg-slate-50/80">
                                                <td className="p-3.5 font-bold text-slate-800">{r.subject?.code || '-'}</td>
                                                <td className="p-3.5 font-medium text-slate-800">{r.subject?.name || '-'}</td>
                                                <td className="p-3.5 text-slate-600 font-medium">{r.examType}</td>
                                                <td className="p-3.5 text-center font-bold text-slate-900 text-sm">{r.marksObtained}</td>
                                                <td className="p-3.5 text-center text-slate-600">{r.totalMarks}</td>
                                                <td className="p-3.5 text-center font-semibold text-slate-700">{pct}%</td>
                                                <td className="p-3.5 text-center">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${color}`}>
                                                        {grade}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Overall Transcript Summary Box — only when results exist */}
                {results.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-200 pt-6">
                    <div className="bg-indigo-50/80 p-4 rounded-xl border border-indigo-100 text-center">
                        <span className="text-xs text-indigo-700 font-semibold uppercase block">Total Marks</span>
                        <span className="text-2xl font-black text-indigo-950 mt-1 block">{totalObtained} / {totalMax}</span>
                    </div>

                    <div className="bg-emerald-50/80 p-4 rounded-xl border border-emerald-100 text-center">
                        <span className="text-xs text-emerald-700 font-semibold uppercase block">Overall Percentage</span>
                        <span className="text-2xl font-black text-emerald-950 mt-1 block">{overallPct}%</span>
                    </div>

                    <div className="bg-purple-50/80 p-4 rounded-xl border border-purple-100 text-center">
                        <span className="text-xs text-purple-700 font-semibold uppercase block">Grade / Status</span>
                        <span className="text-2xl font-black text-purple-950 mt-1 block">{overallGrade.grade} ({overallGrade.remark})</span>
                    </div>
                </div>
                ) : (
                <div className="border-t border-slate-200 pt-6 text-center text-slate-400 text-sm py-4">
                    No grades available yet — results have not been entered.
                </div>
                )}

                {/* Signatures & Verification Footer */}
                <div className="pt-12 border-t border-slate-200 grid grid-cols-3 gap-6 items-end text-xs text-slate-500">
                    {/* 1. Class In-charge (Assigned Teacher Signature) */}
                    <div className="text-center">
                        <div className="h-12 flex flex-col justify-end items-center pb-1">
                            <span className="font-serif italic text-base font-bold text-slate-800 tracking-wide select-none">
                                {classTeacherName}
                            </span>
                            <div className="w-full border-b border-slate-400 mt-1"></div>
                        </div>
                        <p className="font-bold text-slate-800 text-xs mt-1.5">{classTeacherName}</p>
                        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Class In-charge</p>
                    </div>

                    {/* 2. Controller of Exams (Kuldeep Signature) */}
                    <div className="text-center">
                        <div className="h-12 flex flex-col justify-end items-center pb-1">
                            <span className="font-serif italic text-base font-bold text-slate-800 tracking-wider select-none">
                                Kuldeep
                            </span>
                            <div className="w-full border-b border-slate-400 mt-1"></div>
                        </div>
                        <p className="font-bold text-slate-800 text-xs mt-1.5">Kuldeep</p>
                        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Controller of Exams</p>
                    </div>

                    {/* 3. PRINCIPAL / DEAN (Dr. Kuldeep Signature) */}
                    <div className="text-center">
                        <div className="h-12 flex flex-col justify-end items-center pb-1">
                            <span className="font-serif italic text-base font-bold text-indigo-950 tracking-widest select-none">
                                Dr. Kuldeep
                            </span>
                            <div className="w-full border-b border-indigo-900 mt-1"></div>
                        </div>
                        <p className="font-bold text-indigo-950 text-xs mt-1.5 uppercase">Dr. Kuldeep</p>
                        <p className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider">PRINCIPAL / DEAN</p>
                    </div>
                </div>
            </div>
            )}
        </div>
    );
};

export default ReportCard;
