import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { Plus, Edit, Trash2, Search, Phone, Hash, UserCog, Download, Eye, X, Mail, BookOpen, GraduationCap, Shield } from 'lucide-react';

const TeacherList = () => {
    const { user } = useContext(AuthContext);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewingTeacher, setViewingTeacher] = useState(null);
    const [adminToast, setAdminToast] = useState(null);
    const toastTimerRef = React.useRef(null);

    const isAdmin = user?.role === 'admin';

    useEffect(() => {
        fetchTeachers();
        return () => {
            if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        };
    }, []);

    const fetchTeachers = async () => {
        try {
            const { data } = await api.get('/teachers');
            setTeachers(data);
        } catch (error) {
            console.error('Error fetching teachers', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleAdmin = async (teacher, currentRole) => {
        const action = currentRole === 'admin' ? 'revoke Admin rights from' : 'grant Admin rights to';
        if (window.confirm(`Are you sure you want to ${action} ${teacher.fullName}?`)) {
            try {
                const { data } = await api.put(`/teachers/${teacher._id}/toggle-admin`);
                await fetchTeachers();
                if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
                setAdminToast({
                    name: teacher.fullName,
                    message: data.role === 'admin' ? 'Granted Admin Rights Successfully! ⚡' : 'Admin Rights Revoked Successfully!',
                    isGranted: data.role === 'admin'
                });
                toastTimerRef.current = setTimeout(() => setAdminToast(null), 4500);
            } catch (error) {
                console.error('Error toggling admin rights', error);
                if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
                setAdminToast({
                    name: teacher.fullName,
                    message: error.response?.data?.message || 'Failed to update admin rights',
                    isError: true
                });
                toastTimerRef.current = setTimeout(() => setAdminToast(null), 4500);
            }
        }
    };

    const handleExportCSV = () => {
        if (teachers.length === 0) return;
        const headers = ['Full Name', 'Employee ID', 'Phone Number', 'Assigned Subjects Count', 'Assigned Classes Count'];
        const rows = teachers.map(t => [
            `"${t.fullName || ''}"`,
            `"${t.employeeId || ''}"`,
            `"${t.phone || ''}"`,
            `"${t.assignedSubjects?.length || 0}"`,
            `"${t.assignedCourses?.length || 0}"`
        ]);
        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'faculty_list.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this teacher?')) {
            try {
                await api.delete(`/teachers/${id}`);
                setTeachers(teachers.filter(t => t._id !== id));
            } catch (error) {
                console.error('Error deleting teacher', error);
            }
        }
    };

    const filteredTeachers = teachers.filter(teacher =>
        teacher.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.phone?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 relative">
            {/* Floating Toast Notification Card */}
            {adminToast && (
                <div className="fixed top-6 right-6 z-50 bg-white border border-slate-200/80 p-4 rounded-2xl shadow-2xl flex items-center space-x-3.5 max-w-sm border-l-4 border-l-purple-600 transition-all transform animate-fade-in">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white flex-shrink-0 shadow-xs ${adminToast.isError ? 'bg-rose-500' : 'bg-purple-600'}`}>
                        <Shield size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                            <span>{adminToast.name}</span>
                        </h4>
                        <p className="text-xs font-semibold text-slate-500 mt-0.5">{adminToast.message}</p>
                    </div>
                    <button onClick={() => setAdminToast(null)} className="text-slate-400 hover:text-slate-700 p-1">
                        <X size={16} />
                    </button>
                </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Faculty Directory</h1>
                    <p className="text-slate-500 text-sm mt-0.5">
                        {teachers.length} teachers and faculty members
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
                        <Link to="/teachers/new" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl flex items-center space-x-2 transition-colors shadow-sm font-medium text-sm">
                            <Plus size={18} />
                            <span>Add New Teacher</span>
                        </Link>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50">
                    <div className="relative max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <Search size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by name, employee ID, or phone..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                                <th className="p-4">Teacher</th>
                                <th className="p-4">Employee ID</th>
                                <th className="p-4">Qualification</th>
                                <th className="p-4">Phone Number</th>
                                <th className="p-4">Assigned Subjects & Classes</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="p-4"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
                                        <td className="p-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                                        <td className="p-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                                        <td className="p-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                                        <td className="p-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                                        <td className="p-4"><div className="h-4 bg-slate-200 rounded w-12 ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : filteredTeachers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-slate-400">
                                        <UserCog size={40} className="mx-auto mb-3 opacity-30" />
                                        <p className="font-semibold text-slate-600">No faculty members found</p>
                                        <p className="text-xs text-slate-400 mt-1">Try adjusting your search query</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredTeachers.map((teacher) => (
                                    <tr key={teacher._id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm flex-shrink-0">
                                                    {teacher.fullName?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-1.5">
                                                        <p className="font-semibold text-slate-800 text-sm">{teacher.fullName}</p>
                                                        {teacher.user?.role === 'admin' && (
                                                            <span className="text-[10px] font-extrabold bg-purple-100 text-purple-800 border border-purple-200 px-2 py-0.5 rounded-md flex items-center gap-1 shadow-2xs">
                                                                <Shield size={10} /> Admin
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-emerald-600 font-medium">{teacher.designation || 'Assistant Professor'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="inline-flex items-center gap-1 text-slate-700 text-sm font-medium bg-slate-100 px-2 py-0.5 rounded">
                                                <Hash size={13} className="text-slate-400" />
                                                {teacher.employeeId}
                                            </span>
                                        </td>
                                        <td className="p-4 text-slate-700 text-xs font-semibold">
                                            <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-100">
                                                {teacher.qualification || 'Master Degree'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-slate-600 text-sm">
                                            {teacher.phone ? (
                                                <span className="flex items-center gap-1.5">
                                                    <Phone size={13} className="text-slate-400" />
                                                    {teacher.phone}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 text-xs italic">Not provided</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-slate-600 text-sm space-y-1">
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md text-[11px] font-semibold border border-emerald-100 flex items-center gap-1">
                                                    <BookOpen size={11} /> {teacher.assignedSubjects?.length || 0} Subjects
                                                </span>
                                                <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md text-[11px] font-semibold border border-indigo-100 flex items-center gap-1">
                                                    <GraduationCap size={11} /> {teacher.assignedCourses?.length || 0} Classes
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end space-x-2">
                                                <button onClick={() => setViewingTeacher(teacher)} className="text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-lg transition-colors" title="View Teacher Profile">
                                                    <Eye size={15} />
                                                </button>
                                                {isAdmin && (
                                                    <>
                                                        <button
                                                            onClick={() => handleToggleAdmin(teacher, teacher.user?.role)}
                                                            className={`p-1.5 rounded-lg transition-all ${
                                                                teacher.user?.role === 'admin' 
                                                                    ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-xs ring-2 ring-purple-300 font-bold' 
                                                                    : 'bg-slate-100 text-slate-400 hover:bg-purple-100 hover:text-purple-700'
                                                            }`}
                                                            title={teacher.user?.role === 'admin' ? 'Admin Rights Active (Click to Revoke)' : 'Grant Admin Rights'}
                                                        >
                                                            <Shield size={15} />
                                                        </button>
                                                        <Link to={`/teachers/${teacher._id}/edit`} className="text-emerald-600 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 p-1.5 rounded-lg transition-colors" title="Edit Teacher">
                                                            <Edit size={15} />
                                                        </Link>
                                                        <button onClick={() => handleDelete(teacher._id)} className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-1.5 rounded-lg transition-colors" title="Delete Teacher">
                                                            <Trash2 size={15} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* View Teacher Modal */}
            {viewingTeacher && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setViewingTeacher(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                            <X size={20} />
                        </button>
                        
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-extrabold text-xl shadow-md flex-shrink-0">
                                {viewingTeacher.fullName?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">{viewingTeacher.fullName}</h3>
                                <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1"><Hash size={12}/> Employee ID: {viewingTeacher.employeeId}</p>
                                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                                    {viewingTeacher.designation || 'Faculty Member'}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl mb-4 border border-slate-100">
                            <div>
                                <p className="text-slate-400 font-medium mb-0.5">Education / Qualification</p>
                                <p className="font-bold text-indigo-700">{viewingTeacher.qualification || 'Master Degree'}</p>
                            </div>
                            <div>
                                <p className="text-slate-400 font-medium mb-0.5">Designation</p>
                                <p className="font-semibold text-slate-700">{viewingTeacher.designation || 'Assistant Professor'}</p>
                            </div>
                            <div>
                                <p className="text-slate-400 font-medium mb-0.5">Email Address</p>
                                <p className="font-semibold text-slate-700 truncate flex items-center gap-1"><Mail size={12}/> {viewingTeacher.user?.email || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-slate-400 font-medium mb-0.5">Phone Number</p>
                                <p className="font-semibold text-slate-700 flex items-center gap-1"><Phone size={12}/> {viewingTeacher.phone || 'Not provided'}</p>
                            </div>
                        </div>

                        {/* Assigned Subjects */}
                        <div className="mb-4">
                            <p className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                                <BookOpen size={14} className="text-emerald-600" />
                                <span>Assigned Subjects ({viewingTeacher.assignedSubjects?.length || 0})</span>
                            </p>
                            {viewingTeacher.assignedSubjects?.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {viewingTeacher.assignedSubjects.map((sub, idx) => (
                                        <span key={idx} className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-medium">
                                            {sub.name || sub}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-slate-400 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                    No subjects assigned.
                                </p>
                            )}
                        </div>

                        {/* Assigned Classes / Courses */}
                        <div className="mb-4">
                            <p className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                                <GraduationCap size={14} className="text-indigo-600" />
                                <span>Assigned Classes / Courses ({viewingTeacher.assignedCourses?.length || 0})</span>
                            </p>
                            {viewingTeacher.assignedCourses?.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {viewingTeacher.assignedCourses.map((crs, idx) => (
                                        <span key={idx} className="px-3 py-1 bg-indigo-50 text-indigo-800 border border-indigo-200 rounded-lg text-xs font-medium">
                                            {crs.name || crs}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-slate-400 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                    No classes assigned.
                                </p>
                            )}
                        </div>

                        <div className="flex justify-end pt-2 border-t border-slate-100">
                            <button onClick={() => setViewingTeacher(null)} className="px-5 py-2 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherList;
