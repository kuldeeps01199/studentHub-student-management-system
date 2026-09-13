import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { Search, Award, TrendingUp, Printer, Download, CheckCircle, XCircle } from 'lucide-react';

const getGrade = (obtained, total) => {
    const pct = total > 0 ? Math.round((obtained / total) * 100) : 0;
    if (pct >= 90) return { grade: 'A+', pass: true, color: 'text-emerald-700 bg-emerald-100 border-emerald-200' };
    if (pct >= 80) return { grade: 'A',  pass: true, color: 'text-green-700 bg-green-100 border-green-200' };
    if (pct >= 70) return { grade: 'B',  pass: true, color: 'text-blue-700 bg-blue-100 border-blue-200' };
    if (pct >= 60) return { grade: 'C',  pass: true, color: 'text-indigo-700 bg-indigo-100 border-indigo-200' };
    if (pct >= 50) return { grade: 'D',  pass: true, color: 'text-amber-700 bg-amber-100 border-amber-200' };
    return { grade: 'Fail', pass: false, color: 'text-red-700 bg-red-100 border-red-200' };
};

const ResultReport = () => {
    const { user } = useContext(AuthContext);
    const [courses, setCourses] = useState([]);
    const [students, setStudents] = useState([]);
    const [allStudents, setAllStudents] = useState([]);
    const [courseId, setCourseId] = useState('');
    const [semester, setSemester] = useState('');
    const [studentId, setStudentId] = useState('');
    const [examType, setExamType] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const isStudent = user?.role === 'student';

    useEffect(() => {
        Promise.all([api.get('/courses'), api.get('/students')]).then(([crs, sts]) => {
            setCourses(crs.data);
            setAllStudents(sts.data);
        }).catch(console.error);
    }, []);

    // Auto-load results for student
    useEffect(() => {
        if (isStudent && allStudents.length > 0) {
            const userId = user?._id || user?.id;
            const myProfile = allStudents.find(s => String(s.user?._id || s.user) === String(userId));
            if (myProfile) {
                setLoading(true);
                setSearched(true);
                api.get(`/results?student=${myProfile._id}`)
                    .then(({ data }) => setResults(data))
                    .catch(console.error)
                    .finally(() => setLoading(false));
            }
        }
    }, [user, isStudent, allStudents]);

    useEffect(() => {
        if (courseId && semester) {
            setStudents(allStudents.filter(s => (s.course?._id || s.course) === courseId && s.semester === semester));
        } else if (courseId) {
            setStudents(allStudents.filter(s => (s.course?._id || s.course) === courseId));
        } else if (semester) {
            setStudents(allStudents.filter(s => s.semester === semester));
        } else {
            setStudents(allStudents);
        }
        setStudentId('');
    }, [courseId, semester, allStudents]);

    const fetchResults = async () => {
        setLoading(true);
        setSearched(true);
        try {
            const params = new URLSearchParams();
            if (courseId) params.append('course', courseId);
            if (semester) params.append('semester', semester);
            if (studentId) params.append('student', studentId);
            if (examType) params.append('examType', examType);
            const { data } = await api.get(`/results?${params}`);
            setResults(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleExportCSV = () => {
        if (results.length === 0) return;
        const headers = ['Student Name', 'Roll Number', 'Subject Name', 'Subject Code', 'Exam Type', 'Marks Obtained', 'Total Marks', 'Percentage', 'Grade', 'Status'];
        const rows = results.map(r => {
            const pct = Math.round((r.marksObtained / r.totalMarks) * 100);
            const { grade, pass } = getGrade(r.marksObtained, r.totalMarks);
            return [
                `"${r.student?.fullName || ''}"`,
                `"${r.student?.rollNumber || ''}"`,
                `"${r.subject?.name || ''}"`,
                `"${r.subject?.code || ''}"`,
                `"${r.examType || ''}"`,
                `"${r.marksObtained}"`,
                `"${r.totalMarks}"`,
                `"${pct}%"`,
                `"${grade}"`,
                `"${pass ? 'Pass' : 'Fail'}"`
            ];
        });
        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'results_report.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const totalObtained = results.reduce((a, r) => a + r.marksObtained, 0);
    const totalMax = results.reduce((a, r) => a + r.totalMarks, 0);
    const overallPct = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;
    const overallGrade = getGrade(totalObtained, totalMax);

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Award className="text-indigo-600" size={26} />
                        {isStudent ? 'My Results' : 'Results Report'}
                    </h1>
                    <p className="text-slate-500 text-sm mt-0.5">
                        {isStudent ? 'Your personal exam results and grades' : 'View and filter overall student academic examination performance'}
                    </p>
                </div>
            </div>

            {/* Filters — hidden for students */}
            {!isStudent && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Course Program</label>
                        <select className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500" value={courseId} onChange={e => setCourseId(e.target.value)}>
                            <option value="">All Courses</option>
                            {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Semester</label>
                        <select className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500" value={semester} onChange={e => setSemester(e.target.value)}>
                            <option value="">All Semesters</option>
                            {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={`Semester ${s}`}>Semester {s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Student</label>
                        <select className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500" value={studentId} onChange={e => setStudentId(e.target.value)}>
                            <option value="">All Students</option>
                            {students.map(s => <option key={s._id} value={s._id}>{s.fullName} ({s.rollNumber})</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Exam Type</label>
                        <select className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500" value={examType} onChange={e => setExamType(e.target.value)}>
                            <option value="">All Exam Types</option>
                            <option value="Final">Final Exam</option>
                            <option value="Midterm">Midterm Exam</option>
                            <option value="Assignment">Assignment</option>
                            <option value="Quiz">Quiz</option>
                        </select>
                    </div>
                </div>
                <button onClick={fetchResults} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl hover:bg-indigo-700 font-semibold text-sm flex items-center gap-2 shadow-sm transition-colors">
                    <Search size={16} />
                    <span>Generate Report</span>
                </button>
            </div>
            )}

            {loading && (
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
                    <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-slate-500 text-sm">Loading results...</p>
                </div>
            )}

            {!loading && searched && results.length === 0 && (
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 text-slate-400 shadow-sm">
                    <Award size={40} className="mx-auto mb-3 opacity-40" />
                    <p className="font-semibold text-slate-600">No result records found</p>
                    <p className="text-sm mt-1">Try selecting different filters or enter results in Result Manager</p>
                </div>
            )}

            {!loading && results.length > 0 && (
                <>
                    {/* Summary cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm text-center">
                            <p className="text-2xl font-extrabold text-slate-800">{results.length}</p>
                            <p className="text-slate-500 text-xs mt-1">Records Found</p>
                        </div>
                        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm text-center">
                            <p className="text-2xl font-extrabold text-slate-800">{totalObtained}/{totalMax}</p>
                            <p className="text-slate-500 text-xs mt-1">Total Marks</p>
                        </div>
                        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm text-center">
                            <p className={`text-2xl font-extrabold ${overallPct >= 50 ? 'text-green-600' : 'text-red-600'}`}>{overallPct}%</p>
                            <p className="text-slate-500 text-xs mt-1">Overall Percentage</p>
                        </div>
                        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm text-center">
                            <p className={`text-2xl font-extrabold ${overallGrade.pass ? 'text-emerald-600' : 'text-red-600'}`}>Grade {overallGrade.grade}</p>
                            <p className="text-slate-500 text-xs mt-1">Overall Grade</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
                        <div className="p-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <TrendingUp size={18} className="text-indigo-600" />
                                <h2 className="font-bold text-slate-700 text-sm">Detailed Examination Results</h2>
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={handleExportCSV} 
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors shadow-2xs"
                                >
                                    <Download size={14} />
                                    <span>Export CSV</span>
                                </button>
                                <button 
                                    onClick={() => window.print()} 
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors shadow-2xs"
                                >
                                    <Printer size={14} />
                                    <span>Print Report</span>
                                </button>
                            </div>
                        </div>
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                                    <th className="p-4">Student</th>
                                    <th className="p-4">Subject</th>
                                    <th className="p-4">Exam Type</th>
                                    <th className="p-4 text-center">Marks</th>
                                    <th className="p-4 text-center">%</th>
                                    <th className="p-4 text-center">Grade</th>
                                    <th className="p-4 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {results.map(result => {
                                    const pct = Math.round((result.marksObtained / result.totalMarks) * 100);
                                    const { grade, pass, color } = getGrade(result.marksObtained, result.totalMarks);
                                    return (
                                        <tr key={result._id} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                                                        {result.student?.fullName?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-800 text-sm">{result.student?.fullName}</p>
                                                        <p className="text-xs text-slate-400">{result.student?.rollNumber}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <p className="font-semibold text-slate-800 text-sm">{result.subject?.name}</p>
                                                <p className="text-xs text-slate-400">{result.subject?.code}</p>
                                            </td>
                                            <td className="p-4">
                                                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-medium rounded-lg text-xs">{result.examType}</span>
                                            </td>
                                            <td className="p-4 text-center font-bold text-slate-800 text-sm">{result.marksObtained}/{result.totalMarks}</td>
                                            <td className="p-4 text-center font-bold text-slate-700 text-sm">{pct}%</td>
                                            <td className="p-4 text-center">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold border ${color}`}>{grade}</span>
                                            </td>
                                            <td className="p-4 text-center">
                                                {pass ? (
                                                    <span className="inline-flex items-center gap-1 text-green-600 text-xs font-bold bg-green-50 px-2 py-0.5 rounded-full">
                                                        <CheckCircle size={13}/> Pass
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-red-600 text-xs font-bold bg-red-50 px-2 py-0.5 rounded-full">
                                                        <XCircle size={13}/> Fail
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

export default ResultReport;
