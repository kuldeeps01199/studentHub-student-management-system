import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import {
    FileText, Users, ClipboardList, Award, TrendingUp, Calendar,
    Download, Printer, Search, CheckCircle, XCircle, BarChart2, Filter
} from 'lucide-react';

const ReportsHub = () => {
    const { user } = useContext(AuthContext);

    // Data states
    const [courses, setCourses] = useState([]);
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter states
    const [activeTab, setActiveTab] = useState('student-list'); // 'student-list' | 'attendance' | 'results' | 'performance' | 'pass-percentage' | 'monthly-attendance'
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            try {
                const [cRes, stRes, attRes, resRes] = await Promise.all([
                    api.get('/courses'),
                    api.get('/students'),
                    api.get('/attendance'),
                    api.get('/results')
                ]);
                setCourses(cRes.data || []);
                setStudents(stRes.data || []);
                setAttendance(attRes.data || []);
                setResults(resRes.data || []);
            } catch (err) {
                console.error('Error fetching report data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, []);

    // Helper Grade Calculation
    const evalGrade = (pct) => {
        if (pct >= 90) return { grade: 'A+', pass: true, color: 'text-emerald-700 bg-emerald-100' };
        if (pct >= 80) return { grade: 'A',  pass: true, color: 'text-green-700 bg-green-100' };
        if (pct >= 70) return { grade: 'B',  pass: true, color: 'text-blue-700 bg-blue-100' };
        if (pct >= 60) return { grade: 'C',  pass: true, color: 'text-indigo-700 bg-indigo-100' };
        if (pct >= 50) return { grade: 'D',  pass: true, color: 'text-amber-700 bg-amber-100' };
        return { grade: 'Fail', pass: false, color: 'text-red-700 bg-red-100' };
    };

    // Universal CSV / Excel Export
    const exportCSV = (filename, headers, rows) => {
        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `${filename}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Universal PDF Print Trigger
    const printPDF = () => {
        window.print();
    };

    // Filtered Data Helpers
    const filteredStudents = students.filter(s => {
        const cId = s.course?._id || s.course;
        const matchC = !selectedCourse || cId === selectedCourse;
        const matchS = !selectedSemester || s.semester === selectedSemester;
        const matchQ = !searchTerm || s.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || s.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchC && matchS && matchQ;
    });

    // Student List Report
    const renderStudentListReport = () => {
        const headers = ['Full Name', 'Roll Number', 'Admission No', 'Email', 'Phone', 'Course', 'Semester', 'Gender'];
        const rows = filteredStudents.map(s => [
            `"${s.fullName || ''}"`, `"${s.rollNumber || ''}"`, `"${s.admissionNumber || ''}"`,
            `"${s.email || ''}"`, `"${s.phone || ''}"`, `"${s.course?.name || ''}"`, `"${s.semester || ''}"`, `"${s.gender || ''}"`
        ]);

        return (
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div>
                        <h3 className="text-sm font-bold text-slate-800">Student Directory & Enrolment Report</h3>
                        <p className="text-xs text-slate-500">{filteredStudents.length} active students listed</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => exportCSV('student_list_report', headers, rows)} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100">
                            <Download size={14} /> Export Excel/CSV
                        </button>
                        <button onClick={printPDF} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700">
                            <Printer size={14} /> Print / Save PDF
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="bg-slate-100 text-slate-600 text-xs font-semibold uppercase">
                                <th className="p-3">#</th>
                                <th className="p-3">Roll No</th>
                                <th className="p-3">Student Name</th>
                                <th className="p-3">Course</th>
                                <th className="p-3">Semester</th>
                                <th className="p-3">Email</th>
                                <th className="p-3">Phone</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredStudents.length === 0 ? (
                                <tr><td colSpan={7} className="p-8 text-center text-slate-400">No students match filter criteria.</td></tr>
                            ) : filteredStudents.map((s, i) => (
                                <tr key={s._id} className="hover:bg-slate-50">
                                    <td className="p-3 text-slate-400 text-xs">{i + 1}</td>
                                    <td className="p-3 font-bold text-slate-800">{s.rollNumber}</td>
                                    <td className="p-3 font-semibold text-slate-800">{s.fullName}</td>
                                    <td className="p-3">{s.course?.name || 'Unassigned'}</td>
                                    <td className="p-3">{s.semester}</td>
                                    <td className="p-3 text-slate-500 text-xs">{s.email}</td>
                                    <td className="p-3 text-slate-500 text-xs">{s.phone}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    // ── Render 2: Attendance Report ───────────────────────────────────
    const renderAttendanceReport = () => {
        // Aggregate per-student attendance
        const attSummary = {};
        attendance.forEach(session => {
            const cId = session.course?._id || session.course;
            if (selectedCourse && cId !== selectedCourse) return;
            if (selectedSemester && session.semester !== selectedSemester) return;

            session.records.forEach(r => {
                const sId = r.student?._id || r.student;
                if (!sId) return;
                if (!attSummary[sId]) {
                    const st = students.find(s => s._id === sId) || r.student;
                    attSummary[sId] = { name: st?.fullName || 'Student', roll: st?.rollNumber || '-', present: 0, absent: 0, late: 0, total: 0 };
                }
                attSummary[sId].total++;
                if (r.status === 'Present') attSummary[sId].present++;
                else if (r.status === 'Absent') attSummary[sId].absent++;
                else if (r.status === 'Late') attSummary[sId].late++;
            });
        });

        const list = Object.values(attSummary).filter(s =>
            !searchTerm || s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.roll.toLowerCase().includes(searchTerm.toLowerCase())
        );

        const headers = ['Student Name', 'Roll Number', 'Total Classes', 'Present', 'Absent', 'Late', 'Attendance %'];
        const rows = list.map(s => {
            const pct = s.total > 0 ? Math.round(((s.present + s.late) / s.total) * 100) : 0;
            return [`"${s.name}"`, `"${s.roll}"`, s.total, s.present, s.absent, s.late, `"${pct}%"`];
        });

        return (
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div>
                        <h3 className="text-sm font-bold text-slate-800">Overall Attendance Consolidated Report</h3>
                        <p className="text-xs text-slate-500">{list.length} students summarized across {attendance.length} total sessions</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => exportCSV('attendance_report', headers, rows)} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100">
                            <Download size={14} /> Export Excel/CSV
                        </button>
                        <button onClick={printPDF} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700">
                            <Printer size={14} /> Print / Save PDF
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="bg-slate-100 text-slate-600 text-xs font-semibold uppercase">
                                <th className="p-3">Student</th>
                                <th className="p-3">Roll No</th>
                                <th className="p-3 text-center">Classes</th>
                                <th className="p-3 text-center text-green-600">Present</th>
                                <th className="p-3 text-center text-red-500">Absent</th>
                                <th className="p-3 text-center text-amber-500">Late</th>
                                <th className="p-3">Attendance %</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {list.length === 0 ? (
                                <tr><td colSpan={7} className="p-8 text-center text-slate-400">No attendance data found.</td></tr>
                            ) : list.map((s, i) => {
                                const pct = s.total > 0 ? Math.round(((s.present + s.late) / s.total) * 100) : 0;
                                return (
                                    <tr key={i} className="hover:bg-slate-50">
                                        <td className="p-3 font-semibold text-slate-800">{s.name}</td>
                                        <td className="p-3 text-xs font-bold text-slate-600">{s.roll}</td>
                                        <td className="p-3 text-center font-bold">{s.total}</td>
                                        <td className="p-3 text-center font-bold text-green-600">{s.present}</td>
                                        <td className="p-3 text-center font-bold text-red-500">{s.absent}</td>
                                        <td className="p-3 text-center font-bold text-amber-500">{s.late}</td>
                                        <td className="p-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-24 bg-slate-200 rounded-full h-2 overflow-hidden">
                                                    <div className={`h-2 rounded-full ${pct >= 75 ? 'bg-green-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
                                                </div>
                                                <span className="text-xs font-bold text-slate-700">{pct}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    // ── Render 3: Result Report ────────────────────────────────────────
    const renderResultReport = () => {
        const filteredRes = results.filter(r => {
            const cId = r.course?._id || r.course;
            const matchC = !selectedCourse || cId === selectedCourse;
            const matchS = !selectedSemester || r.semester === selectedSemester;
            const sName = r.student?.fullName || '';
            const matchQ = !searchTerm || sName.toLowerCase().includes(searchTerm.toLowerCase());
            return matchC && matchS && matchQ;
        });

        const headers = ['Student Name', 'Roll Number', 'Course', 'Semester', 'Subject', 'Exam Type', 'Marks Obtained', 'Total Marks', 'Percentage', 'Grade', 'Status'];
        const rows = filteredRes.map(r => {
            const pct = Math.round((r.marksObtained / r.totalMarks) * 100);
            const { grade, pass } = evalGrade(pct);
            return [
                `"${r.student?.fullName || ''}"`, `"${r.student?.rollNumber || ''}"`, `"${r.course?.name || ''}"`,
                `"${r.semester || ''}"`, `"${r.subject?.name || ''}"`, `"${r.examType || ''}"`,
                r.marksObtained, r.totalMarks, `"${pct}%"`, `"${grade}"`, `"${pass ? 'Pass' : 'Fail'}"`
            ];
        });

        return (
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div>
                        <h3 className="text-sm font-bold text-slate-800">Examination Results & Grades Report</h3>
                        <p className="text-xs text-slate-500">{filteredRes.length} exam entries found</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => exportCSV('results_report', headers, rows)} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100">
                            <Download size={14} /> Export Excel/CSV
                        </button>
                        <button onClick={printPDF} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700">
                            <Printer size={14} /> Print / Save PDF
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="bg-slate-100 text-slate-600 text-xs font-semibold uppercase">
                                <th className="p-3">Student</th>
                                <th className="p-3">Subject</th>
                                <th className="p-3">Exam Type</th>
                                <th className="p-3 text-center">Marks</th>
                                <th className="p-3 text-center">%</th>
                                <th className="p-3 text-center">Grade</th>
                                <th className="p-3 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredRes.length === 0 ? (
                                <tr><td colSpan={7} className="p-8 text-center text-slate-400">No exam results recorded.</td></tr>
                            ) : filteredRes.map(r => {
                                const pct = Math.round((r.marksObtained / r.totalMarks) * 100);
                                const { grade, pass, color } = evalGrade(pct);
                                return (
                                    <tr key={r._id} className="hover:bg-slate-50">
                                        <td className="p-3">
                                            <p className="font-semibold text-slate-800">{r.student?.fullName}</p>
                                            <p className="text-xs text-slate-400">{r.student?.rollNumber}</p>
                                        </td>
                                        <td className="p-3 font-medium text-slate-700">{r.subject?.name}</td>
                                        <td className="p-3 text-xs text-slate-500">{r.examType}</td>
                                        <td className="p-3 text-center font-bold">{r.marksObtained}/{r.totalMarks}</td>
                                        <td className="p-3 text-center font-bold text-slate-700">{pct}%</td>
                                        <td className="p-3 text-center">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${color}`}>{grade}</span>
                                        </td>
                                        <td className="p-3 text-center">
                                            <span className={`text-xs font-bold ${pass ? 'text-green-600' : 'text-red-600'}`}>{pass ? 'Pass' : 'Fail'}</span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    // ── Render 4: Student Performance ─────────────────────────────────
    const renderStudentPerformance = () => {
        // Aggregate performance per student
        const perfMap = {};
        students.forEach(st => {
            const cId = st.course?._id || st.course;
            if (selectedCourse && cId !== selectedCourse) return;
            if (selectedSemester && st.semester !== selectedSemester) return;
            if (searchTerm && !st.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) && !st.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase())) return;

            perfMap[st._id] = {
                name: st.fullName,
                roll: st.rollNumber,
                course: st.course?.name || 'General',
                semester: st.semester,
                obtained: 0,
                max: 0,
                exams: 0,
                attPresent: 0,
                attTotal: 0
            };
        });

        results.forEach(r => {
            const sId = r.student?._id || r.student;
            if (perfMap[sId]) {
                perfMap[sId].obtained += r.marksObtained;
                perfMap[sId].max += r.totalMarks;
                perfMap[sId].exams++;
            }
        });

        attendance.forEach(session => {
            session.records.forEach(rec => {
                const sId = rec.student?._id || rec.student;
                if (perfMap[sId]) {
                    perfMap[sId].attTotal++;
                    if (rec.status === 'Present' || rec.status === 'Late') perfMap[sId].attPresent++;
                }
            });
        });

        const list = Object.values(perfMap);
        const headers = ['Student Name', 'Roll Number', 'Course', 'Semester', 'Exams Taken', 'Total Marks', 'Max Marks', 'Academic %', 'Overall Grade', 'Attendance %', 'Performance Rating'];
        const rows = list.map(s => {
            const acadPct = s.max > 0 ? Math.round((s.obtained / s.max) * 100) : 0;
            const attPct = s.attTotal > 0 ? Math.round((s.attPresent / s.attTotal) * 100) : 0;
            const grade = evalGrade(acadPct).grade;
            const rating = acadPct >= 80 && attPct >= 75 ? 'Outstanding' : acadPct >= 60 ? 'Good' : 'Needs Improvement';
            return [`"${s.name}"`, `"${s.roll}"`, `"${s.course}"`, `"${s.semester}"`, s.exams, s.obtained, s.max, `"${acadPct}%"`, `"${grade}"`, `"${attPct}%"`, `"${rating}"`];
        });

        return (
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div>
                        <h3 className="text-sm font-bold text-slate-800">Holistic Student Performance & Progress Analytics</h3>
                        <p className="text-xs text-slate-500">Correlates academic marks percentage with attendance percentage</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => exportCSV('student_performance_report', headers, rows)} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100">
                            <Download size={14} /> Export Excel/CSV
                        </button>
                        <button onClick={printPDF} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700">
                            <Printer size={14} /> Print / Save PDF
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="bg-slate-100 text-slate-600 text-xs font-semibold uppercase">
                                <th className="p-3">Student Name</th>
                                <th className="p-3">Roll No</th>
                                <th className="p-3 text-center">Exams</th>
                                <th className="p-3 text-center">Academic %</th>
                                <th className="p-3 text-center">Attendance %</th>
                                <th className="p-3 text-center">Grade</th>
                                <th className="p-3 text-center">Rating</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {list.length === 0 ? (
                                <tr><td colSpan={7} className="p-8 text-center text-slate-400">No performance records match filters.</td></tr>
                            ) : list.map((s, i) => {
                                const acadPct = s.max > 0 ? Math.round((s.obtained / s.max) * 100) : 0;
                                const attPct = s.attTotal > 0 ? Math.round((s.attPresent / s.attTotal) * 100) : 0;
                                const { grade, color } = evalGrade(acadPct);
                                const isOutstanding = acadPct >= 80 && attPct >= 75;
                                return (
                                    <tr key={i} className="hover:bg-slate-50">
                                        <td className="p-3 font-semibold text-slate-800">{s.name}</td>
                                        <td className="p-3 text-xs font-bold text-slate-600">{s.roll}</td>
                                        <td className="p-3 text-center text-xs font-bold">{s.exams}</td>
                                        <td className="p-3 text-center font-bold text-indigo-700">{s.max > 0 ? `${acadPct}%` : 'N/A'}</td>
                                        <td className="p-3 text-center font-bold text-emerald-700">{s.attTotal > 0 ? `${attPct}%` : 'N/A'}</td>
                                        <td className="p-3 text-center">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-extrabold ${color}`}>{s.max > 0 ? grade : '—'}</span>
                                        </td>
                                        <td className="p-3 text-center">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                                isOutstanding ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                                                acadPct >= 60 ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'
                                            }`}>
                                                {isOutstanding ? '🌟 Outstanding' : acadPct >= 60 ? '👍 Good' : '⚠️ Needs Focus'}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    // ── Render 5: Pass Percentage Report ──────────────────────────────
    const renderPassPercentage = () => {
        // Group pass stats by Course
        const courseStats = courses.map(crs => {
            const crsResults = results.filter(r => (r.course?._id || r.course) === crs._id);
            let totalExams = crsResults.length;
            let passExams = 0;
            let failExams = 0;

            crsResults.forEach(r => {
                const pct = Math.round((r.marksObtained / r.totalMarks) * 100);
                if (pct >= 50) passExams++;
                else failExams++;
            });

            const passRate = totalExams > 0 ? Math.round((passExams / totalExams) * 100) : 0;
            return { name: crs.name, totalExams, passExams, failExams, passRate };
        });

        const headers = ['Course Name', 'Total Exam Entries', 'Passed Entries', 'Failed Entries', 'Pass Rate %'];
        const rows = courseStats.map(c => [`"${c.name}"`, c.totalExams, c.passExams, c.failExams, `"${c.passRate}%"`]);

        return (
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div>
                        <h3 className="text-sm font-bold text-slate-800">Course & Exam Pass Percentage Summary</h3>
                        <p className="text-xs text-slate-500">Breakdown of pass/fail statistics grouped by academic program</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => exportCSV('pass_percentage_report', headers, rows)} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100">
                            <Download size={14} /> Export Excel/CSV
                        </button>
                        <button onClick={printPDF} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700">
                            <Printer size={14} /> Print / Save PDF
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {courseStats.map((c, i) => (
                        <div key={i} className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4 shadow-xs hover:shadow-md transition-all">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2.5">
                                    <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-extrabold text-xs shadow-2xs">
                                        {c.name.substring(0, 3)}
                                    </div>
                                    <h4 className="font-extrabold text-slate-800 text-base">{c.name}</h4>
                                </div>

                                {c.totalExams === 0 ? (
                                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                                        No Exams Yet
                                    </span>
                                ) : (
                                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                                        c.passRate >= 75 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                        c.passRate >= 50 ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                                        'bg-rose-50 text-rose-700 border-rose-200'
                                    }`}>
                                        {c.passRate}% Pass Rate
                                    </span>
                                )}
                            </div>

                            {/* Progress Bar */}
                            <div className="space-y-1">
                                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                    {c.totalExams === 0 ? (
                                        <div className="bg-slate-200 h-2.5 rounded-full w-full opacity-60" />
                                    ) : (
                                        <div 
                                            className={`h-2.5 rounded-full transition-all duration-500 ${
                                                c.passRate >= 75 ? 'bg-emerald-500' :
                                                c.passRate >= 50 ? 'bg-indigo-500' :
                                                'bg-rose-500'
                                            }`} 
                                            style={{ width: `${c.passRate}%` }} 
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Metric Mini-Cards */}
                            <div className="grid grid-cols-3 text-center gap-2 text-xs border-t border-slate-100 pt-3">
                                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                    <p className="font-black text-slate-800 text-sm">{c.totalExams}</p>
                                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Total Exams</p>
                                </div>
                                <div className="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100/60">
                                    <p className="font-black text-emerald-700 text-sm">{c.passExams}</p>
                                    <p className="text-[10px] text-emerald-600/80 font-semibold uppercase tracking-wider mt-0.5">Passed</p>
                                </div>
                                <div className="bg-rose-50/60 p-2.5 rounded-xl border border-rose-100/60">
                                    <p className="font-black text-rose-700 text-sm">{c.failExams}</p>
                                    <p className="text-[10px] text-rose-600/80 font-semibold uppercase tracking-wider mt-0.5">Failed</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // ── Render 6: Monthly Attendance ──────────────────────────────────
    const renderMonthlyAttendance = () => {
        // Filter attendance sessions by selected month if any
        const filteredAtt = selectedMonth
            ? attendance.filter(a => {
                const d = new Date(a.date);
                const mKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                return mKey === selectedMonth;
            })
            : attendance;

        const headers = ['Session Date', 'Course', 'Semester', 'Total Marked', 'Present Count', 'Absent Count', 'Attendance %'];
        const rows = filteredAtt.map(a => {
            const pCount = a.records?.filter(r => r.status === 'Present' || r.status === 'Late').length || 0;
            const total = a.records?.length || 0;
            const pct = total > 0 ? Math.round((pCount / total) * 100) : 0;
            return [
                `"${new Date(a.date).toLocaleDateString()}"`, `"${a.course?.name || ''}"`, `"${a.semester}"`,
                total, pCount, total - pCount, `"${pct}%"`
            ];
        });

        return (
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div>
                        <h3 className="text-sm font-bold text-slate-800">Month-wise Attendance Session Report</h3>
                        <p className="text-xs text-slate-500">{filteredAtt.length} sessions recorded</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => exportCSV('monthly_attendance_report', headers, rows)} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100">
                            <Download size={14} /> Export Excel/CSV
                        </button>
                        <button onClick={printPDF} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700">
                            <Printer size={14} /> Print / Save PDF
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="bg-slate-100 text-slate-600 text-xs font-semibold uppercase">
                                <th className="p-3">Date</th>
                                <th className="p-3">Course</th>
                                <th className="p-3">Semester</th>
                                <th className="p-3 text-center">Students Marked</th>
                                <th className="p-3 text-center text-green-600">Present</th>
                                <th className="p-3 text-center text-red-500">Absent</th>
                                <th className="p-3">Session Attendance %</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredAtt.length === 0 ? (
                                <tr><td colSpan={7} className="p-8 text-center text-slate-400">No monthly attendance entries found.</td></tr>
                            ) : filteredAtt.map((a, i) => {
                                const pCount = a.records?.filter(r => r.status === 'Present' || r.status === 'Late').length || 0;
                                const total = a.records?.length || 0;
                                const pct = total > 0 ? Math.round((pCount / total) * 100) : 0;
                                return (
                                    <tr key={i} className="hover:bg-slate-50">
                                        <td className="p-3 font-semibold text-slate-800">{new Date(a.date).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric'})}</td>
                                        <td className="p-3 font-medium text-slate-700">{a.course?.name || 'Class'}</td>
                                        <td className="p-3 text-xs text-slate-500">{a.semester}</td>
                                        <td className="p-3 text-center font-bold">{total}</td>
                                        <td className="p-3 text-center font-bold text-green-600">{pCount}</td>
                                        <td className="p-3 text-center font-bold text-red-500">{total - pCount}</td>
                                        <td className="p-3">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${pct >= 75 ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                                                {pct}%
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <FileText className="text-indigo-600" size={26} />
                    Comprehensive Reports Central Hub
                </h1>
                <p className="text-slate-500 text-sm mt-0.5">
                    Generate, analyze and export institutional reports for students, attendance, performance, and exam results
                </p>
            </div>

            {/* Global Controls & Filters */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
                <div className="flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[180px]">
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Filter by Course</label>
                        <select
                            className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={selectedCourse}
                            onChange={e => setSelectedCourse(e.target.value)}
                        >
                            <option value="">All Courses</option>
                            {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                        </select>
                    </div>

                    <div className="w-44">
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Filter by Semester</label>
                        <select
                            className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={selectedSemester}
                            onChange={e => setSelectedSemester(e.target.value)}
                        >
                            <option value="">All Semesters</option>
                            {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={`Semester ${s}`}>Semester {s}</option>)}
                        </select>
                    </div>

                    {activeTab === 'monthly-attendance' && (
                        <div className="w-44">
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Month</label>
                            <input
                                type="month"
                                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={selectedMonth}
                                onChange={e => setSelectedMonth(e.target.value)}
                            />
                        </div>
                    )}

                    <div className="flex-1 min-w-[200px] relative">
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Search Keywords</label>
                        <div className="relative">
                            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by name or roll number..."
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="flex flex-wrap border-b border-slate-200 bg-slate-50/60">
                    {[
                        { id: 'student-list', label: 'Student List', icon: <Users size={15} /> },
                        { id: 'attendance', label: 'Attendance Report', icon: <ClipboardList size={15} /> },
                        { id: 'results', label: 'Result Report', icon: <Award size={15} /> },
                        { id: 'performance', label: 'Student Performance', icon: <TrendingUp size={15} /> },
                        { id: 'pass-percentage', label: 'Pass Percentage', icon: <BarChart2 size={15} /> },
                        { id: 'monthly-attendance', label: 'Monthly Attendance', icon: <Calendar size={15} /> },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-3.5 text-xs font-bold border-b-2 transition-colors ${
                                activeTab === tab.id
                                    ? 'border-indigo-600 text-indigo-700 bg-white shadow-2xs'
                                    : 'border-transparent text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="p-5">
                    {loading ? (
                        <div className="p-12 text-center text-slate-400">
                            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                            <p className="text-sm font-medium">Generating consolidated reports...</p>
                        </div>
                    ) : (
                        <>
                            {activeTab === 'student-list' && renderStudentListReport()}
                            {activeTab === 'attendance' && renderAttendanceReport()}
                            {activeTab === 'results' && renderResultReport()}
                            {activeTab === 'performance' && renderStudentPerformance()}
                            {activeTab === 'pass-percentage' && renderPassPercentage()}
                            {activeTab === 'monthly-attendance' && renderMonthlyAttendance()}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportsHub;
