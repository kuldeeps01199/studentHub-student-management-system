import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { CheckCircle, XCircle, Clock, Search, ClipboardList, Download, Trash2, BarChart2, Calendar } from 'lucide-react';

const AttendanceReport = () => {
    const { user } = useContext(AuthContext);
    const [courses, setCourses] = useState([]);
    const [courseId, setCourseId] = useState('');
    const [semester, setSemester] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('summary');
    const [studentProfile, setStudentProfile] = useState(null);

    const isAdmin = user?.role === 'admin';
    const isStudent = user?.role === 'student';

    useEffect(() => {
        api.get('/courses').then(r => setCourses(r.data)).catch(console.error);
    }, []);

    // Auto-load for students
    useEffect(() => {
        if (isStudent) {
            const loadStudentAttendance = async () => {
                setLoading(true);
                setSearched(true);
                try {
                    const userId = user?._id || user?.id;
                    const { data: studentsData } = await api.get('/students');
                    const myProfile = studentsData.find(s => String(s.user?._id || s.user) === String(userId));
                    setStudentProfile(myProfile);

                    if (myProfile) {
                        const params = new URLSearchParams();
                        if (myProfile.course?._id) params.append('course', myProfile.course._id);
                        if (myProfile.semester) params.append('semester', myProfile.semester);
                        const { data } = await api.get(`/attendance?${params}`);
                        setRecords(data);
                    }
                } catch (err) {
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            };
            loadStudentAttendance();
        }
    }, [user, isStudent]);

    const fetchRecords = async () => {
        if (!courseId || !semester) return;
        setLoading(true);
        setSearched(true);
        try {
            const params = new URLSearchParams({ course: courseId, semester });
            const { data } = await api.get(`/attendance?${params}`);
            setRecords(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSession = async (id) => {
        if (window.confirm('Are you sure you want to delete this attendance session?')) {
            try {
                await api.delete(`/attendance/${id}`);
                setRecords(records.filter(r => r._id !== id));
            } catch (err) {
                console.error(err);
            }
        }
    };

    // Build per-student summary
    const buildSummary = (filterRecords = records) => {
        const map = {};
        filterRecords.forEach(session => {
            session.records.forEach(rec => {
                const key = rec.student?._id;
                if (!key) return;
                // If student, show only their own record
                if (isStudent && studentProfile && String(key) !== String(studentProfile._id)) return;
                if (!map[key]) {
                    map[key] = { name: rec.student?.fullName || 'Unknown', roll: rec.student?.rollNumber || '-', present: 0, absent: 0, late: 0 };
                }
                if (rec.status === 'Present') map[key].present++;
                else if (rec.status === 'Absent') map[key].absent++;
                else if (rec.status === 'Late') map[key].late++;
            });
        });
        return Object.values(map);
    };

    const getPercent = (row) => {
        const total = row.present + row.absent + row.late;
        if (total === 0) return 0;
        return Math.round(((row.present + row.late) / total) * 100);
    };

    const getPercentColor = (pct) => {
        if (pct >= 75) return { bar: 'bg-green-500', text: 'text-green-700 bg-green-50' };
        if (pct >= 50) return { bar: 'bg-amber-500', text: 'text-amber-700 bg-amber-50' };
        return { bar: 'bg-red-500', text: 'text-red-700 bg-red-50' };
    };

    // Monthly filter
    const monthlyRecords = selectedMonth
        ? records.filter(r => {
            const d = new Date(r.date);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === selectedMonth;
        })
        : records;

    const summary = buildSummary(monthlyRecords);

    const filteredSummary = summary.filter(row =>
        row.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.roll.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Get unique months from records
    const uniqueMonths = [...new Set(records.map(r => {
        const d = new Date(r.date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    }))].sort().reverse();

    const handleExportCSV = () => {
        if (filteredSummary.length === 0) return;
        const headers = ['Student Name', 'Roll Number', 'Present', 'Absent', 'Late', 'Attendance %'];
        const rows = filteredSummary.map(r => [
            `"${r.name}"`, `"${r.roll}"`, r.present, r.absent, r.late, `${getPercent(r)}%`
        ]);
        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        const link = document.createElement('a');
        link.setAttribute('href', encodeURI(csvContent));
        link.setAttribute('download', `attendance_report_${semester}_${selectedMonth || 'all'}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const avgAttendance = filteredSummary.length > 0
        ? Math.round(filteredSummary.reduce((acc, r) => acc + getPercent(r), 0) / filteredSummary.length)
        : 0;

    const courseName = courses.find(c => c._id === courseId)?.name || '';

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <BarChart2 className="text-indigo-600" size={26} />
                    {isStudent ? 'My Attendance' : 'Attendance Report'}
                </h1>
                <p className="text-slate-500 text-sm mt-0.5">
                    {isStudent ? 'Your personal attendance summary' : 'View consolidated daily, monthly, and overall attendance summaries'}
                </p>
            </div>

            {/* Filter Panel — hidden for students */}
            {!isStudent && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5">
                <div className="flex gap-4 items-end flex-wrap">
                    <div className="flex-1 min-w-[180px]">
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Course Program *</label>
                        <select
                            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={courseId}
                            onChange={e => { setCourseId(e.target.value); setRecords([]); setSearched(false); }}
                        >
                            <option value="">Select Course...</option>
                            {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="w-44">
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Semester *</label>
                        <select
                            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={semester}
                            onChange={e => { setSemester(e.target.value); setRecords([]); setSearched(false); }}
                        >
                            <option value="">Select Semester...</option>
                            {[1,2,3,4,5,6,7,8].map(s => (
                                <option key={s} value={`Semester ${s}`}>Semester {s}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={fetchRecords}
                        disabled={!courseId || !semester || loading}
                        className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl hover:bg-indigo-700 font-semibold text-sm flex items-center gap-2 disabled:opacity-50 shadow-sm"
                    >
                        <Search size={16} />
                        {loading ? 'Loading...' : 'Generate Report'}
                    </button>
                </div>
            </div>
            )}

            {/* Loading */}
            {loading && (
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
                    <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-slate-500 text-sm">Loading attendance data...</p>
                </div>
            )}

            {/* No Results */}
            {!loading && searched && records.length === 0 && (
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 text-slate-400 shadow-sm">
                    <ClipboardList size={40} className="mx-auto mb-3 opacity-40" />
                    <p className="font-semibold text-slate-600">No attendance records found</p>
                    <p className="text-sm mt-1">Mark attendance for this class first</p>
                </div>
            )}

            {/* Report Panel */}
            {!loading && records.length > 0 && (
                <>
                    {/* Stat cards row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm text-center">
                            <p className="text-2xl font-bold text-slate-800">{records.length}</p>
                            <p className="text-slate-500 text-xs mt-1">Total Sessions</p>
                        </div>
                        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm text-center">
                            <p className="text-2xl font-bold text-slate-800">{summary.length}</p>
                            <p className="text-slate-500 text-xs mt-1">Total Students</p>
                        </div>
                        <div className={`bg-white rounded-2xl p-4 border shadow-sm text-center ${avgAttendance >= 75 ? 'border-green-200' : avgAttendance >= 50 ? 'border-amber-200' : 'border-red-200'}`}>
                            <p className={`text-2xl font-bold ${avgAttendance >= 75 ? 'text-green-600' : avgAttendance >= 50 ? 'text-amber-600' : 'text-red-600'}`}>{avgAttendance}%</p>
                            <p className="text-slate-500 text-xs mt-1">Avg. Attendance</p>
                        </div>
                        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm text-center">
                            <p className="text-2xl font-bold text-indigo-600">{uniqueMonths.length}</p>
                            <p className="text-slate-500 text-xs mt-1">Months Covered</p>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                        <div className="flex border-b border-slate-200 bg-slate-50/60">
                            {[
                                { id: 'summary', label: 'Summary Report', icon: <BarChart2 size={15}/> },
                                { id: 'daily', label: 'Daily Sessions', icon: <ClipboardList size={15}/> },
                                { id: 'monthly', label: 'Monthly Report', icon: <Calendar size={15}/> }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold border-b-2 transition-colors ${
                                        activeTab === tab.id
                                            ? 'border-indigo-600 text-indigo-700 bg-white'
                                            : 'border-transparent text-slate-500 hover:text-slate-800'
                                    }`}
                                >
                                    {tab.icon} {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Summary Tab */}
                        {activeTab === 'summary' && (
                            <div>
                                <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100">
                                    <div className="relative w-full sm:w-72">
                                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Search student..."
                                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            value={searchTerm}
                                            onChange={e => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={handleExportCSV}
                                            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors shadow-2xs">
                                            <Download size={14} /> Export CSV
                                        </button>
                                        <button onClick={() => window.print()}
                                            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors shadow-2xs">
                                            🖨️ Print
                                        </button>
                                    </div>
                                </div>

                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                                            <th className="p-4 font-semibold">Student</th>
                                            <th className="p-4 font-semibold text-center"><span className="flex items-center justify-center gap-1"><CheckCircle size={13} className="text-green-500"/>Present</span></th>
                                            <th className="p-4 font-semibold text-center"><span className="flex items-center justify-center gap-1"><XCircle size={13} className="text-red-500"/>Absent</span></th>
                                            <th className="p-4 font-semibold text-center"><span className="flex items-center justify-center gap-1"><Clock size={13} className="text-amber-500"/>Late</span></th>
                                            <th className="p-4 font-semibold">Attendance %</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredSummary.length === 0 ? (
                                            <tr><td colSpan={5} className="p-10 text-center text-slate-400 text-sm">No students found.</td></tr>
                                        ) : filteredSummary.map((row, i) => {
                                            const pct = getPercent(row);
                                            const colors = getPercentColor(pct);
                                            return (
                                                <tr key={i} className="hover:bg-slate-50">
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center">
                                                                {row.name.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-slate-800 text-sm">{row.name}</p>
                                                                <p className="text-xs text-slate-400">{row.roll}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-center font-bold text-green-600">{row.present}</td>
                                                    <td className="p-4 text-center font-bold text-red-500">{row.absent}</td>
                                                    <td className="p-4 text-center font-bold text-amber-500">{row.late}</td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                                                                <div className={`${colors.bar} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                                                            </div>
                                                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${colors.text}`}>{pct}%</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Daily Sessions Tab */}
                        {activeTab === 'daily' && (
                            <div className="p-5 space-y-3">
                                <p className="text-xs text-slate-500 font-medium">{records.length} attendance sessions recorded</p>
                                {records.length === 0 ? (
                                    <p className="text-slate-400 text-sm text-center py-8">No sessions found.</p>
                                ) : records.map(rec => {
                                    const pCount = rec.records?.filter(r => r.status === 'Present').length || 0;
                                    const aCount = rec.records?.filter(r => r.status === 'Absent').length || 0;
                                    const lCount = rec.records?.filter(r => r.status === 'Late').length || 0;
                                    return (
                                        <div key={rec._id} className="flex items-center justify-between p-4 bg-slate-50 hover:bg-white rounded-xl border border-slate-200 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="text-center bg-indigo-600 text-white rounded-xl px-3 py-2 min-w-[64px]">
                                                    <p className="text-lg font-extrabold leading-none">{new Date(rec.date).getDate()}</p>
                                                    <p className="text-[11px] font-semibold opacity-80">{new Date(rec.date).toLocaleString('default', { month:'short' })}</p>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-800 text-sm">{new Date(rec.date).toLocaleDateString('en-IN', { weekday:'long', day:'2-digit', month:'long', year:'numeric' })}</p>
                                                    <p className="text-xs text-slate-400 mt-0.5">Marked by: {rec.markedBy?.name || 'Staff'}</p>
                                                    <div className="flex items-center gap-3 mt-1.5 text-xs font-semibold">
                                                        <span className="text-green-600">✓ {pCount} Present</span>
                                                        <span className="text-red-500">✗ {aCount} Absent</span>
                                                        {lCount > 0 && <span className="text-amber-500">⏰ {lCount} Late</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            {isAdmin && (
                                                <button
                                                    onClick={() => handleDeleteSession(rec._id)}
                                                    className="text-red-400 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors"
                                                    title="Delete Session"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Monthly Report Tab */}
                        {activeTab === 'monthly' && (
                            <div className="p-5 space-y-5">
                                <div className="flex items-center gap-3">
                                    <label className="text-xs font-semibold text-slate-700">Filter by Month:</label>
                                    <select
                                        className="px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={selectedMonth}
                                        onChange={e => setSelectedMonth(e.target.value)}
                                    >
                                        <option value="">All Months</option>
                                        {uniqueMonths.map(m => {
                                            const [yr, mo] = m.split('-');
                                            const label = new Date(parseInt(yr), parseInt(mo) - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
                                            return <option key={m} value={m}>{label}</option>;
                                        })}
                                    </select>
                                    {selectedMonth && (
                                        <button onClick={() => setSelectedMonth('')} className="text-xs text-indigo-600 underline">
                                            Clear
                                        </button>
                                    )}
                                </div>

                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-semibold text-slate-700">
                                        {selectedMonth ? (() => {
                                            const [yr, mo] = selectedMonth.split('-');
                                            return new Date(parseInt(yr), parseInt(mo)-1).toLocaleString('default', { month: 'long', year: 'numeric' });
                                        })() : 'All Months'} — {monthlyRecords.length} sessions
                                    </p>
                                    <button onClick={handleExportCSV}
                                        className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors">
                                        <Download size={14} /> Export CSV
                                    </button>
                                </div>

                                {/* Monthly Student Summary */}
                                <div className="space-y-2.5">
                                    {filteredSummary.length === 0 ? (
                                        <p className="text-slate-400 text-sm text-center py-8">No data for this month.</p>
                                    ) : filteredSummary.map((row, i) => {
                                        const pct = getPercent(row);
                                        const colors = getPercentColor(pct);
                                        const total = row.present + row.absent + row.late;
                                        return (
                                            <div key={i} className="flex items-center gap-4 p-3.5 bg-slate-50 hover:bg-white rounded-xl border border-slate-200 transition-colors">
                                                <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm flex-shrink-0 flex items-center justify-center">
                                                    {row.name.charAt(0)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <div>
                                                            <p className="font-semibold text-slate-800 text-sm truncate">{row.name}</p>
                                                            <p className="text-xs text-slate-400">{row.roll} &bull; {total} sessions</p>
                                                        </div>
                                                        <div className="flex items-center gap-3 text-xs font-bold ml-2">
                                                            <span className="text-green-600">{row.present}P</span>
                                                            <span className="text-red-500">{row.absent}A</span>
                                                            {row.late > 0 && <span className="text-amber-500">{row.late}L</span>}
                                                            <span className={`px-2.5 py-1 rounded-full ${colors.text}`}>{pct}%</span>
                                                        </div>
                                                    </div>
                                                    <div className="w-full bg-slate-200 rounded-full h-1.5">
                                                        <div className={`${colors.bar} h-1.5 rounded-full`} style={{ width: `${pct}%` }} />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default AttendanceReport;
