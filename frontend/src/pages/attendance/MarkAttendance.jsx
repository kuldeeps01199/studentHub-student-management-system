import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { CheckCircle, XCircle, Clock, Search, Users, ClipboardList, ChevronDown } from 'lucide-react';

const MarkAttendance = () => {
    const { user } = useContext(AuthContext);
    const [courses, setCourses] = useState([]);
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Filters
    const [courseId, setCourseId] = useState('');
    const [semester, setSemester] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    // Form state
    const [attendanceRecords, setAttendanceRecords] = useState({});
    const [existingRecordId, setExistingRecordId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        api.get('/courses').then(r => setCourses(r.data)).catch(console.error);
    }, []);

    const fetchStudents = async () => {
        if (!courseId || !semester) {
            setError('Please select a Course and Semester first.');
            return;
        }
        setFetching(true);
        setError('');
        setSuccess('');
        setSearchTerm('');
        try {
            const [stRes, attRes] = await Promise.all([
                api.get('/students'),
                api.get(`/attendance?course=${courseId}&semester=${semester}&date=${date}`)
            ]);

            const filtered = stRes.data.filter(
                s => (s.course?._id || s.course) === courseId && s.semester === semester
            );
            setStudents(filtered);

            const existingAttendance = attRes.data[0];
            const existingMap = {};
            if (existingAttendance?.records) {
                setExistingRecordId(existingAttendance._id);
                existingAttendance.records.forEach(r => {
                    existingMap[r.student?._id || r.student] = r.status;
                });
            } else {
                setExistingRecordId(null);
            }

            const initialRecords = {};
            filtered.forEach(s => {
                initialRecords[s._id] = existingMap[s._id] || 'Present';
            });
            setAttendanceRecords(initialRecords);

            if (filtered.length === 0) {
                setError('No students enrolled in this course & semester.');
            }
        } catch (err) {
            setError('Failed to fetch students.');
        } finally {
            setFetching(false);
        }
    };

    const handleStatusChange = (studentId, status) => {
        setAttendanceRecords(prev => ({ ...prev, [studentId]: status }));
    };

    const markAll = (status) => {
        const updated = {};
        students.forEach(s => { updated[s._id] = status; });
        setAttendanceRecords(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (students.length === 0) return;
        setLoading(true);
        setError('');
        setSuccess('');

        const records = Object.keys(attendanceRecords).map(studentId => ({
            student: studentId,
            status: attendanceRecords[studentId]
        }));

        try {
            if (existingRecordId) {
                await api.put(`/attendance/${existingRecordId}`, { date, course: courseId, semester, records });
                setSuccess('✅ Attendance updated successfully!');
            } else {
                const res = await api.post('/attendance', { date, course: courseId, semester, records });
                setExistingRecordId(res.data._id);
                setSuccess('✅ Attendance marked and saved successfully!');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save attendance.');
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents = students.filter(s =>
        s.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const presentCount = Object.values(attendanceRecords).filter(s => s === 'Present').length;
    const absentCount = Object.values(attendanceRecords).filter(s => s === 'Absent').length;
    const lateCount = Object.values(attendanceRecords).filter(s => s === 'Late').length;
    const totalCount = students.length;

    const courseName = courses.find(c => c._id === courseId)?.name || '';

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <ClipboardList className="text-indigo-600" size={26} />
                        Mark & Edit Attendance
                    </h1>
                    <p className="text-slate-500 text-sm mt-0.5">Select course, semester and date to mark daily attendance</p>
                </div>
                {existingRecordId && (
                    <span className="px-3 py-1.5 bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold rounded-full">
                        ✏️ Editing Existing Record
                    </span>
                )}
            </div>

            {/* Filter Panel */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5">
                <h2 className="text-sm font-bold text-slate-700 mb-4">Step 1 — Select Class & Date</h2>
                <div className="flex gap-4 items-end flex-wrap">
                    <div className="flex-1 min-w-[180px]">
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Course Program *</label>
                        <select
                            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={courseId}
                            onChange={e => { setCourseId(e.target.value); setStudents([]); }}
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
                            onChange={e => { setSemester(e.target.value); setStudents([]); }}
                        >
                            <option value="">Select Semester...</option>
                            {[1,2,3,4,5,6,7,8].map(s => (
                                <option key={s} value={`Semester ${s}`}>Semester {s}</option>
                            ))}
                        </select>
                    </div>
                    <div className="w-44">
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Date *</label>
                        <input
                            type="date"
                            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={fetchStudents}
                        disabled={fetching}
                        className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl hover:bg-indigo-700 font-semibold text-sm flex items-center gap-2 shadow-sm disabled:opacity-60 transition-colors"
                    >
                        <Users size={16} />
                        {fetching ? 'Loading...' : 'Load Students'}
                    </button>
                </div>
            </div>

            {/* Alerts */}
            {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 text-sm font-medium">
                    ⚠️ {error}
                </div>
            )}
            {success && (
                <div className="p-4 bg-green-50 text-green-700 rounded-xl border border-green-200 text-sm font-medium">
                    {success}
                </div>
            )}

            {/* Student Attendance Form */}
            {students.length > 0 && (
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Step 2 Header + Stats Bar */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                            <div>
                                <h2 className="text-sm font-bold text-slate-700">
                                    Step 2 — Mark Attendance &nbsp;
                                    <span className="text-indigo-600">{courseName} • {semester} • {new Date(date).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric'})}</span>
                                </h2>
                                <p className="text-xs text-slate-400 mt-0.5">{totalCount} students found</p>
                            </div>
                            {/* Mark All Buttons */}
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500 font-semibold">Mark All:</span>
                                <button type="button" onClick={() => markAll('Present')}
                                    className="px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs font-bold hover:bg-green-100 transition-colors flex items-center gap-1">
                                    <CheckCircle size={13} /> Present
                                </button>
                                <button type="button" onClick={() => markAll('Absent')}
                                    className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors flex items-center gap-1">
                                    <XCircle size={13} /> Absent
                                </button>
                                <button type="button" onClick={() => markAll('Late')}
                                    className="px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-bold hover:bg-amber-100 transition-colors flex items-center gap-1">
                                    <Clock size={13} /> Late
                                </button>
                            </div>
                        </div>

                        {/* Live Stat Counter */}
                        <div className="grid grid-cols-3 gap-3 mb-4">
                            <div className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-xl p-3">
                                <CheckCircle size={22} className="text-green-600" />
                                <div>
                                    <p className="text-xl font-extrabold text-green-700">{presentCount}</p>
                                    <p className="text-xs text-green-600 font-medium">Present</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl p-3">
                                <XCircle size={22} className="text-red-500" />
                                <div>
                                    <p className="text-xl font-extrabold text-red-600">{absentCount}</p>
                                    <p className="text-xs text-red-500 font-medium">Absent</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-xl p-3">
                                <Clock size={22} className="text-amber-500" />
                                <div>
                                    <p className="text-xl font-extrabold text-amber-600">{lateCount}</p>
                                    <p className="text-xs text-amber-500 font-medium">Late</p>
                                </div>
                            </div>
                        </div>

                        {/* Search within list */}
                        <div className="relative mb-4">
                            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search student by name or roll number..."
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Student Roster */}
                        <div className="overflow-hidden rounded-xl border border-slate-200">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/80 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                                        <th className="p-3.5">#</th>
                                        <th className="p-3.5">Roll Number</th>
                                        <th className="p-3.5">Student Name</th>
                                        <th className="p-3.5 text-center">Attendance Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredStudents.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="p-8 text-center text-slate-400 text-sm">No students match your search.</td>
                                        </tr>
                                    ) : filteredStudents.map((student, idx) => {
                                        const status = attendanceRecords[student._id] || 'Present';
                                        return (
                                            <tr key={student._id} className={`transition-colors ${
                                                status === 'Present' ? 'bg-green-50/30' :
                                                status === 'Absent' ? 'bg-red-50/30' :
                                                'bg-amber-50/30'
                                            }`}>
                                                <td className="p-3.5 text-slate-400 text-sm font-medium">{idx + 1}</td>
                                                <td className="p-3.5">
                                                    <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-xs">
                                                        {student.rollNumber}
                                                    </span>
                                                </td>
                                                <td className="p-3.5">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                                                            {student.fullName?.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-slate-800 text-sm">{student.fullName}</p>
                                                            <p className="text-xs text-slate-400">{student.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-3.5 text-center">
                                                    <div className="flex justify-center gap-2">
                                                        {['Present', 'Absent', 'Late'].map(s => (
                                                            <button
                                                                key={s}
                                                                type="button"
                                                                onClick={() => handleStatusChange(student._id, s)}
                                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                                                                    status === s
                                                                        ? s === 'Present' ? 'bg-green-500 text-white border-green-500 shadow-sm'
                                                                        : s === 'Absent' ? 'bg-red-500 text-white border-red-500 shadow-sm'
                                                                        : 'bg-amber-500 text-white border-amber-500 shadow-sm'
                                                                        : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                                                                }`}
                                                            >
                                                                {s === 'Present' ? '✓ Present' : s === 'Absent' ? '✗ Absent' : '⏰ Late'}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-emerald-600 text-white px-8 py-3 rounded-xl hover:bg-emerald-700 font-bold text-sm disabled:opacity-50 transition-colors shadow-sm flex items-center gap-2"
                        >
                            <ClipboardList size={18} />
                            {loading ? 'Saving...' : existingRecordId ? 'Update Attendance' : 'Submit Attendance'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default MarkAttendance;
