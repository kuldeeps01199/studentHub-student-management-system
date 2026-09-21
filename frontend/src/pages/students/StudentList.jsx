import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { 
    Plus, Edit, Trash2, Search, Users, Download, Eye, X, 
    Mail, Phone, Calendar, MapPin, Hash, GraduationCap, 
    ArrowUpDown, ChevronLeft, ChevronRight, BookOpen, FileText, Award, CheckCircle, Clock 
} from 'lucide-react';

const StudentList = () => {
    const { user } = useContext(AuthContext);
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filter, Search, Sort & Pagination States
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');
    const [sortBy, setSortBy] = useState('name-asc');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    // View Details Modal State
    const [viewingStudent, setViewingStudent] = useState(null);
    const [modalTab, setModalTab] = useState('personal'); // 'personal' | 'attendance' | 'results'
    const [studentResults, setStudentResults] = useState([]);
    const [studentAttendance, setStudentAttendance] = useState([]);
    const [studentSubjects, setStudentSubjects] = useState([]);
    const [loadingModalData, setLoadingModalData] = useState(false);

    const isAdmin = user?.role === 'admin';

    useEffect(() => {
        fetchStudents();
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const { data } = await api.get('/courses');
            setCourses(data);
        } catch (err) {
            console.error('Error fetching courses', err);
        }
    };

    const fetchStudents = async () => {
        try {
            const { data } = await api.get('/students');
            setStudents(data);
        } catch (error) {
            console.error('Error fetching students', error);
        } finally {
            setLoading(false);
        }
    };

    // Open Student Modal & Fetch Student Academic/Attendance Data
    const handleOpenStudentModal = async (student) => {
        setViewingStudent(student);
        setModalTab('personal');
        setLoadingModalData(true);
        try {
            const [resData, attData, subData] = await Promise.all([
                api.get(`/results?student=${student._id}`),
                api.get(`/attendance?course=${student.course?._id || ''}&semester=${student.semester || ''}`),
                api.get('/subjects')
            ]);

            setStudentResults(resData.data || []);
            setStudentAttendance(attData.data || []);

            // Filter subjects for student course
            const filteredSubs = (subData.data || []).filter(sub => 
                String(sub.course?._id || sub.course) === String(student.course?._id || student.course)
            );
            setStudentSubjects(filteredSubs);
        } catch (err) {
            console.error('Error fetching modal details', err);
        } finally {
            setLoadingModalData(false);
        }
    };

    const handleExportCSV = () => {
        if (students.length === 0) return;
        const headers = ['Full Name', 'Roll Number', 'Admission Number', 'Course', 'Semester', 'Phone', 'Gender', 'Status'];
        const rows = students.map(s => [
            `"${s.fullName || ''}"`,
            `"${s.rollNumber || ''}"`,
            `"${s.admissionNumber || ''}"`,
            `"${s.course?.name || ''}"`,
            `"${s.semester || ''}"`,
            `"${s.phone || ''}"`,
            `"${s.gender || ''}"`,
            `"${s.status || 'Active'}"`
        ]);
        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'students_list.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this student?')) {
            try {
                await api.delete(`/students/${id}`);
                setStudents(students.filter(s => s._id !== id));
            } catch (error) {
                console.error('Error deleting student', error);
            }
        }
    };

    // Filter, Search, and Sort Logic
    const filteredStudents = students.filter(student => {
        const matchesSearch = student.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.admissionNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.course?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesCourse = selectedCourse ? (student.course?._id === selectedCourse || student.course === selectedCourse) : true;
        const matchesSemester = selectedSemester ? student.semester === selectedSemester : true;

        return matchesSearch && matchesCourse && matchesSemester;
    });

    const sortedStudents = [...filteredStudents].sort((a, b) => {
        if (sortBy === 'name-asc') return a.fullName.localeCompare(b.fullName);
        if (sortBy === 'name-desc') return b.fullName.localeCompare(a.fullName);
        if (sortBy === 'roll-asc') return (a.rollNumber || '').localeCompare(b.rollNumber || '');
        if (sortBy === 'roll-desc') return (b.rollNumber || '').localeCompare(a.rollNumber || '');
        return 0;
    });

    // Pagination Logic
    const totalPages = Math.ceil(sortedStudents.length / itemsPerPage) || 1;
    const paginatedStudents = sortedStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const getStatusBadge = (status) => {
        const map = {
            Active: 'bg-emerald-100 text-emerald-700',
            Inactive: 'bg-red-100 text-red-700',
            Graduated: 'bg-indigo-100 text-indigo-700',
        };
        return map[status] || 'bg-slate-100 text-slate-700';
    };

    // Attendance summary for viewing student
    let studentPresentCount = 0;
    let studentTotalSessions = 0;
    studentAttendance.forEach(session => {
        const record = session.records?.find(r => String(r.student?._id || r.student) === String(viewingStudent?._id));
        if (record) {
            studentTotalSessions++;
            if (record.status === 'Present' || record.status === 'Late') {
                studentPresentCount++;
            }
        }
    });
    const studentAttPct = studentTotalSessions > 0 ? Math.round((studentPresentCount / studentTotalSessions) * 100) : 100;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Student Directory</h1>
                    <p className="text-slate-500 text-sm mt-0.5">
                        {students.length} students enrolled • Page {currentPage} of {totalPages}
                    </p>
                </div>
                <div className="flex items-center space-x-3 self-start sm:self-auto">
                    {(isAdmin || user?.role === 'teacher') && (
                        <button 
                            onClick={handleExportCSV}
                            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl flex items-center space-x-2 transition-colors shadow-2xs font-medium text-sm"
                        >
                            <Download size={16} />
                            <span>Export CSV</span>
                        </button>
                    )}
                    {isAdmin && (
                        <Link to="/students/new" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl flex items-center space-x-2 transition-colors shadow-sm font-medium text-sm">
                            <Plus size={18} />
                            <span>Add New Student</span>
                        </Link>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
                
                {/* Search, Filter & Sort Controls Bar */}
                <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-center">
                    {/* Search */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <Search size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search name, roll, adm. no..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        />
                    </div>

                    {/* Course Filter */}
                    <div>
                        <select 
                            className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={selectedCourse}
                            onChange={e => { setSelectedCourse(e.target.value); setCurrentPage(1); }}
                        >
                            <option value="">All Courses</option>
                            {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                        </select>
                    </div>

                    {/* Semester Filter */}
                    <div>
                        <select 
                            className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={selectedSemester}
                            onChange={e => { setSelectedSemester(e.target.value); setCurrentPage(1); }}
                        >
                            <option value="">All Semesters</option>
                            {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={`Semester ${s}`}>Semester {s}</option>)}
                        </select>
                    </div>

                    {/* Sort Selector */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <ArrowUpDown size={16} />
                        </div>
                        <select 
                            className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700"
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value)}
                        >
                            <option value="name-asc">Sort: Name (A-Z)</option>
                            <option value="name-desc">Sort: Name (Z-A)</option>
                            <option value="roll-asc">Sort: Roll No. (Asc)</option>
                            <option value="roll-desc">Sort: Roll No. (Desc)</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                                <th className="p-4">Student Profile</th>
                                <th className="p-4">Roll Number</th>
                                <th className="p-4">Course & Class</th>
                                <th className="p-4">Contact</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                [1, 2, 3, 4].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="p-4"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
                                        <td className="p-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                                        <td className="p-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                                        <td className="p-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                                        <td className="p-4"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                                        <td className="p-4"><div className="h-4 bg-slate-200 rounded w-12 ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : paginatedStudents.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-slate-400">
                                        <Users size={40} className="mx-auto mb-3 opacity-30" />
                                        <p className="font-semibold text-slate-600">No students found</p>
                                        <p className="text-xs text-slate-400 mt-1">Try adjusting search or filters</p>
                                    </td>
                                </tr>
                            ) : (
                                paginatedStudents.map((student) => {
                                    const isSelf = String(student.user?._id || student.user) === String(user?._id);
                                    const canViewFull = isAdmin || user?.role === 'teacher' || isSelf;

                                    return (
                                        <tr key={student._id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center space-x-3">
                                                    {student.profileImage && canViewFull ? (
                                                        <img 
                                                            src={student.profileImage} 
                                                            alt={student.fullName} 
                                                            className="w-10 h-10 rounded-xl object-cover ring-2 ring-indigo-100 flex-shrink-0"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-2xs">
                                                            {student.fullName?.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-semibold text-slate-800 text-sm">{student.fullName}</p>
                                                        {canViewFull && student.admissionNumber && (
                                                            <p className="text-xs text-slate-400">{student.admissionNumber}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-slate-700 text-sm font-medium">
                                                {canViewFull ? (student.rollNumber || 'N/A') : <span className="text-slate-400 text-xs italic">Protected</span>}
                                            </td>
                                            <td className="p-4 text-slate-600 text-sm">
                                                <p className="font-medium text-slate-800">{student.course?.name || 'Unassigned'}</p>
                                                {canViewFull && (
                                                    <p className="text-xs text-slate-400">{student.semester || 'Semester 1'}</p>
                                                )}
                                            </td>
                                            <td className="p-4 text-xs text-slate-600 space-y-0.5">
                                                {canViewFull ? (
                                                    <>
                                                        <p className="truncate max-w-[150px]">{student.user?.email || 'N/A'}</p>
                                                        <p className="text-slate-400">{student.phone || 'N/A'}</p>
                                                    </>
                                                ) : (
                                                    <span className="text-slate-400 text-xs italic">Protected</span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                {canViewFull ? (
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusBadge(student.status)}`}>
                                                        {student.status || 'Active'}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 text-xs italic">Protected</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end space-x-2">
                                                    {canViewFull && (
                                                        <button 
                                                            onClick={() => handleOpenStudentModal(student)} 
                                                            className="text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-lg transition-colors" 
                                                            title="View Detailed Student Profile"
                                                        >
                                                            <Eye size={15} />
                                                        </button>
                                                    )}
                                                    {isAdmin && (
                                                        <>
                                                            <Link 
                                                                to={`/students/${student._id}/edit`} 
                                                                className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 p-1.5 rounded-lg transition-colors" 
                                                                title="Edit Student"
                                                            >
                                                                <Edit size={15} />
                                                            </Link>
                                                            <button 
                                                                onClick={() => handleDelete(student._id)} 
                                                                className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-1.5 rounded-lg transition-colors" 
                                                                title="Delete Student"
                                                            >
                                                                <Trash2 size={15} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls Footer */}
                {sortedStudents.length > 0 && (
                    <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
                        <div>
                            Showing <span className="font-semibold text-slate-700">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-semibold text-slate-700">{Math.min(currentPage * itemsPerPage, sortedStudents.length)}</span> of <span className="font-semibold text-slate-700">{sortedStudents.length}</span> students
                        </div>

                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent transition-colors flex items-center gap-1 font-medium"
                            >
                                <ChevronLeft size={14} /> Previous
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-8 h-8 rounded-lg font-semibold transition-colors ${
                                        currentPage === page
                                            ? 'bg-indigo-600 text-white shadow-2xs'
                                            : 'border border-slate-200 hover:bg-white text-slate-600'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent transition-colors flex items-center gap-1 font-medium"
                            >
                                Next <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Comprehensive Student Profile Modal */}
            {viewingStudent && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 sm:p-7 w-full max-w-2xl shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
                        <button 
                            onClick={() => setViewingStudent(null)} 
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                            <X size={20} />
                        </button>
                        
                        {/* Student Header */}
                        <div className="flex items-center space-x-4 mb-6">
                            {viewingStudent.profileImage ? (
                                <img 
                                    src={viewingStudent.profileImage} 
                                    alt={viewingStudent.fullName} 
                                    className="w-16 h-16 rounded-2xl object-cover shadow-md ring-2 ring-indigo-200 flex-shrink-0"
                                />
                            ) : (
                                <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-2xl shadow-md flex-shrink-0">
                                    {viewingStudent.fullName?.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">{viewingStudent.fullName}</h3>
                                <p className="text-xs text-indigo-600 font-semibold mt-0.5">
                                    {viewingStudent.course?.name || 'Unassigned Course'} • {viewingStudent.semester || 'Semester 1'}
                                </p>
                                <div className="flex items-center space-x-2 mt-1.5">
                                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded">Roll: {viewingStudent.rollNumber}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadge(viewingStudent.status)}`}>
                                        {viewingStudent.status || 'Active'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Modal Navigation Tabs */}
                        <div className="flex border-b border-slate-100 space-x-6 mb-5 text-xs font-bold uppercase tracking-wider">
                            <button
                                onClick={() => setModalTab('personal')}
                                className={`pb-2 transition-colors relative ${
                                    modalTab === 'personal' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-700'
                                }`}
                            >
                                Personal Info
                            </button>
                            <button
                                onClick={() => setModalTab('attendance')}
                                className={`pb-2 transition-colors relative ${
                                    modalTab === 'attendance' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-700'
                                }`}
                            >
                                Attendance Summary
                            </button>
                            <button
                                onClick={() => setModalTab('results')}
                                className={`pb-2 transition-colors relative ${
                                    modalTab === 'results' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-700'
                                }`}
                            >
                                Results & Subjects
                            </button>
                        </div>

                        {/* Tab Content 1: Personal Info */}
                        {modalTab === 'personal' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <div>
                                        <p className="text-slate-400 font-medium mb-0.5">Roll Number</p>
                                        <p className="font-bold text-slate-800 flex items-center gap-1"><Hash size={12}/> {viewingStudent.rollNumber}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-400 font-medium mb-0.5">Admission Number</p>
                                        <p className="font-bold text-slate-800">{viewingStudent.admissionNumber}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-400 font-medium mb-0.5">Email Address</p>
                                        <p className="font-semibold text-slate-700 truncate flex items-center gap-1"><Mail size={12}/> {viewingStudent.user?.email || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-400 font-medium mb-0.5">Phone Number</p>
                                        <p className="font-semibold text-slate-700 flex items-center gap-1"><Phone size={12}/> {viewingStudent.phone || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-400 font-medium mb-0.5">Gender</p>
                                        <p className="font-semibold text-slate-700">{viewingStudent.gender || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-400 font-medium mb-0.5">Date of Birth</p>
                                        <p className="font-semibold text-slate-700 flex items-center gap-1"><Calendar size={12}/> {viewingStudent.dateOfBirth ? new Date(viewingStudent.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
                                    </div>
                                </div>

                                {viewingStudent.address && (
                                    <div>
                                        <p className="text-xs font-semibold text-slate-500 mb-1">Residential Address</p>
                                        <p className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-200 flex items-start gap-1.5">
                                            <MapPin size={14} className="text-slate-400 flex-shrink-0 mt-0.5" />
                                            <span>{viewingStudent.address}</span>
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tab Content 2: Attendance Summary */}
                        {modalTab === 'attendance' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-3 gap-3 text-center">
                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <p className="text-xl font-bold text-slate-800">{studentTotalSessions}</p>
                                        <p className="text-[11px] text-slate-400 mt-0.5">Total Sessions</p>
                                    </div>
                                    <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                                        <p className="text-xl font-bold text-emerald-700">{studentPresentCount}</p>
                                        <p className="text-[11px] text-emerald-600 mt-0.5">Attended</p>
                                    </div>
                                    <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                                        <p className="text-xl font-bold text-indigo-700">{studentAttPct}%</p>
                                        <p className="text-[11px] text-indigo-600 mt-0.5">Attendance Ratio</p>
                                    </div>
                                </div>

                                <div className="w-full bg-slate-100 rounded-full h-3">
                                    <div className="bg-emerald-500 h-3 rounded-full" style={{ width: `${studentAttPct}%` }}></div>
                                </div>
                                <p className="text-xs text-slate-500 text-center font-medium">
                                    {studentAttPct >= 75 ? '✅ Eligible for final examinations (>= 75% attendance)' : '⚠️ Low attendance warning (< 75% attendance)'}
                                </p>
                            </div>
                        )}

                        {/* Tab Content 3: Academic Results & Enrolled Subjects */}
                        {modalTab === 'results' && (
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Enrolled Subjects & Scores</h4>
                                {studentResults.length === 0 ? (
                                    <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-xl text-xs">
                                        No exam results recorded for this student yet.
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto rounded-xl border border-slate-200 text-xs">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                                                    <th className="p-2.5">Subject</th>
                                                    <th className="p-2.5">Exam</th>
                                                    <th className="p-2.5 text-center">Marks</th>
                                                    <th className="p-2.5 text-center">%</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {studentResults.map(r => {
                                                    const pct = Math.round((r.marksObtained / r.totalMarks) * 100);
                                                    return (
                                                        <tr key={r._id}>
                                                            <td className="p-2.5 font-medium text-slate-800">{r.subject?.name || 'Subject'}</td>
                                                            <td className="p-2.5 text-slate-600">{r.examType}</td>
                                                            <td className="p-2.5 text-center font-bold text-slate-900">{r.marksObtained}/{r.totalMarks}</td>
                                                            <td className="p-2.5 text-center font-bold text-emerald-600">{pct}%</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex justify-end pt-4 mt-6 border-t border-slate-100">
                            <button 
                                onClick={() => setViewingStudent(null)} 
                                className="px-5 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                            >
                                Close Profile
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentList;
