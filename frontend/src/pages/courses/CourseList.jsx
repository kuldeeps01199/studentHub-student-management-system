import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { Plus, Trash2, GraduationCap, Edit, X, BookOpen, Layers } from 'lucide-react';

const CourseList = () => {
    const { user } = useContext(AuthContext);
    const [courses, setCourses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [saving, setSaving] = useState(false);

    // Edit Course Modal State
    const [editingCourse, setEditingCourse] = useState(null);
    const [editName, setEditName] = useState('');
    const [editDescription, setEditDescription] = useState('');

    // Add Subject Modal State
    const [assigningSubjectCourse, setAssigningSubjectCourse] = useState(null);
    const [newSubjectName, setNewSubjectName] = useState('');
    const [newSubjectCode, setNewSubjectCode] = useState('');
    const [newSubjectSemester, setNewSubjectSemester] = useState('Semester 1');

    // View All Subjects Modal State
    const [viewingSubjectsCourse, setViewingSubjectsCourse] = useState(null);

    const isAdmin = user?.role === 'admin';

    useEffect(() => {
        fetchData();
    }, []);

    const getSemestersForCourseName = (courseName) => {
        const name = courseName?.toUpperCase() || '';
        let count = 8;
        if (name.includes('BCA')) count = 6;
        else if (name.includes('MBA') || name.includes('MCA')) count = 4;
        else if (name.includes('B.TECH') || name.includes('BTECH')) count = 8;
        return Array.from({ length: count }, (_, i) => `Semester ${i + 1}`);
    };

    const fetchData = async () => {
        try {
            const [crsRes, subsRes] = await Promise.all([
                api.get('/courses'),
                api.get('/subjects')
            ]);
            setCourses(crsRes.data);
            setSubjects(subsRes.data);
        } catch (error) {
            console.error('Error fetching courses/subjects', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddCourse = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { data } = await api.post('/courses', { name, description });
            setCourses([...courses, data]);
            setName('');
            setDescription('');
        } catch (error) {
            console.error('Error adding course', error);
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateCourse = async (e) => {
        e.preventDefault();
        if (!editingCourse) return;
        setSaving(true);
        try {
            const { data } = await api.put(`/courses/${editingCourse._id}`, { name: editName, description: editDescription });
            setCourses(courses.map(c => c._id === editingCourse._id ? data : c));
            setEditingCourse(null);
        } catch (error) {
            console.error('Error updating course', error);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteCourse = async (id) => {
        if (window.confirm('Are you sure you want to delete this course program?')) {
            try {
                await api.delete(`/courses/${id}`);
                setCourses(courses.filter(c => c._id !== id));
            } catch (error) {
                console.error('Error deleting course', error);
            }
        }
    };

    const handleDeleteSubject = async (subId) => {
        if (window.confirm('Are you sure you want to remove this subject?')) {
            try {
                await api.delete(`/subjects/${subId}`);
                setSubjects(subjects.filter(s => s._id !== subId));
            } catch (error) {
                console.error('Error deleting subject', error);
            }
        }
    };

    const handleAddSubjectToCourse = async (e) => {
        e.preventDefault();
        if (!assigningSubjectCourse) return;
        setSaving(true);
        try {
            await api.post('/subjects', {
                name: newSubjectName,
                code: newSubjectCode,
                course: assigningSubjectCourse._id,
                semester: newSubjectSemester || 'Semester 1'
            });
            await fetchData();
            setAssigningSubjectCourse(null);
            setNewSubjectName('');
            setNewSubjectCode('');
            setNewSubjectSemester('Semester 1');
        } catch (error) {
            console.error('Error assigning subject to course', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <GraduationCap className="text-indigo-600" size={28} />
                        Academic Course Programs & Subject Lists
                    </h1>
                    <p className="text-slate-500 text-sm mt-0.5">
                        {courses.length} courses offered with {subjects.length} assigned subjects
                    </p>
                </div>
            </div>
            
            {/* Admin Only: Add Course Form */}
            {isAdmin && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 sm:p-6">
                    <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Plus size={18} className="text-indigo-600" />
                        Add New Course Program
                    </h2>
                    <form onSubmit={handleAddCourse} className="flex flex-col sm:flex-row gap-4 items-end">
                        <div className="flex-1 w-full">
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="block text-xs font-semibold text-slate-700">Course Program Name *</label>
                                <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                                    <span>Quick Preset:</span>
                                    {[
                                        { n: 'BCA', d: 'Bachelor of Computer Applications' },
                                        { n: 'B.Tech', d: 'Bachelor of Technology' },
                                        { n: 'MBA', d: 'Master of Business Administration' },
                                        { n: 'MCA', d: 'Master of Computer Applications' }
                                    ].map(preset => (
                                        <button
                                            key={preset.n}
                                            type="button"
                                            onClick={() => { setName(preset.n); setDescription(preset.d); }}
                                            className="px-2 py-0.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-md transition-colors font-bold"
                                        >
                                            +{preset.n}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <input 
                                required 
                                type="text" 
                                placeholder="e.g. BCA, B.Tech CS, MBA, MCA"
                                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className="flex-2 w-full sm:w-1/2">
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Program Description</label>
                            <input 
                                type="text" 
                                placeholder="e.g. Bachelor of Computer Applications (3 Year Degree)"
                                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={saving}
                            className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors font-medium text-sm flex items-center justify-center space-x-2 w-full sm:w-auto shadow-sm disabled:opacity-50"
                        >
                            <Plus size={18} /> <span>{saving ? 'Adding...' : 'Add Course'}</span>
                        </button>
                    </form>
                </div>
            )}

            {/* Edit Course Modal */}
            {editingCourse && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-slate-100 relative">
                        <button 
                            onClick={() => setEditingCourse(null)} 
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                        >
                            <X size={20} />
                        </button>
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Edit Course Program</h3>
                        <form onSubmit={handleUpdateCourse} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Course Name</label>
                                <input 
                                    required 
                                    type="text" 
                                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                                    value={editName}
                                    onChange={e => setEditName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                                <textarea 
                                    rows="3"
                                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                                    value={editDescription}
                                    onChange={e => setEditDescription(e.target.value)}
                                />
                            </div>
                            <div className="flex justify-end space-x-2 pt-2">
                                <button 
                                    type="button"
                                    onClick={() => setEditingCourse(null)}
                                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={saving}
                                    className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl disabled:opacity-50"
                                >
                                    {saving ? 'Updating...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Quick Assign Subject Modal */}
            {assigningSubjectCourse && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-slate-100 relative">
                        <button 
                            onClick={() => setAssigningSubjectCourse(null)} 
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                        >
                            <X size={20} />
                        </button>
                        <h3 className="text-lg font-bold text-slate-800 mb-1">Add Subject to {assigningSubjectCourse.name}</h3>
                        <p className="text-xs text-slate-500 mb-4">Create and assign a new subject under this course program.</p>
                        <form onSubmit={handleAddSubjectToCourse} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Subject Name *</label>
                                <input 
                                    required 
                                    type="text" 
                                    placeholder="e.g. Operating Systems"
                                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                                    value={newSubjectName}
                                    onChange={e => setNewSubjectName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Subject Code *</label>
                                <input 
                                    required 
                                    type="text" 
                                    placeholder="e.g. CS201"
                                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                                    value={newSubjectCode}
                                    onChange={e => setNewSubjectCode(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Semester *</label>
                                <select 
                                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
                                    value={newSubjectSemester}
                                    onChange={e => setNewSubjectSemester(e.target.value)}
                                >
                                    {getSemestersForCourseName(assigningSubjectCourse.name).map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex justify-end space-x-2 pt-2">
                                <button 
                                    type="button"
                                    onClick={() => setAssigningSubjectCourse(null)}
                                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={saving}
                                    className="px-4 py-2 text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl disabled:opacity-50"
                                >
                                    {saving ? 'Assigning...' : 'Assign Subject'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Courses & Subject Breakdown Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                                <th className="p-4 w-1/4">Course Program</th>
                                <th className="p-4 w-1/4">Description</th>
                                <th className="p-4 w-2/5">Assigned Subject List</th>
                                {isAdmin && <th className="p-4 text-right">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="p-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                                        <td className="p-4"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
                                        <td className="p-4"><div className="h-4 bg-slate-200 rounded w-48"></div></td>
                                        {isAdmin && <td className="p-4"><div className="h-4 bg-slate-200 rounded w-10 ml-auto"></div></td>}
                                    </tr>
                                ))
                            ) : courses.length === 0 ? (
                                <tr>
                                    <td colSpan={isAdmin ? 4 : 3} className="p-12 text-center text-slate-400">
                                        <GraduationCap size={40} className="mx-auto mb-3 opacity-30" />
                                        <p className="font-semibold text-slate-600">No courses found</p>
                                    </td>
                                </tr>
                            ) : (
                                courses.map(course => {
                                    const courseSubjects = subjects.filter(
                                        s => (s.course?._id || s.course) === course._id
                                    );

                                    return (
                                        <tr key={course._id} className="hover:bg-slate-50/80 transition-colors align-top">
                                            <td className="p-4 font-bold text-slate-900 text-sm">
                                                <div className="flex items-center space-x-2.5">
                                                    <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs shadow-2xs">
                                                        {course.name?.substring(0, 3)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900">{course.name}</p>
                                                        <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                                                            {courseSubjects.length} Subjects
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="p-4 text-slate-600 text-xs leading-relaxed">
                                                {course.description || 'No description provided'}
                                            </td>

                                            <td className="p-4">
                                                {courseSubjects.length > 0 ? (
                                                    <div className="space-y-2">
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {courseSubjects.slice(0, 3).map(sub => (
                                                                <span 
                                                                    key={sub._id} 
                                                                    className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors"
                                                                >
                                                                    <span className="font-bold text-indigo-600">[{sub.code}]</span>
                                                                    <span>{sub.name}</span>
                                                                    <span className="text-[10px] text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded font-semibold ml-0.5">
                                                                        {sub.semester || 'Sem 1'}
                                                                    </span>
                                                                </span>
                                                            ))}
                                                        </div>
                                                        <div className="flex items-center gap-3 pt-1">
                                                            {courseSubjects.length > 3 && (
                                                                <button 
                                                                    type="button"
                                                                    onClick={() => setViewingSubjectsCourse(course)}
                                                                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
                                                                >
                                                                    <Layers size={13} />
                                                                    <span>+{courseSubjects.length - 3} More Subjects (View All)</span>
                                                                </button>
                                                            )}
                                                            {courseSubjects.length <= 3 && (
                                                                <button 
                                                                    type="button"
                                                                    onClick={() => setViewingSubjectsCourse(course)}
                                                                    className="text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-1"
                                                                >
                                                                    <BookOpen size={13} />
                                                                    <span>View Semester Breakdown</span>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-dashed border-slate-200">
                                                        <span className="text-xs text-slate-400 italic">No subjects linked to this course</span>
                                                        {isAdmin && (
                                                            <button 
                                                                onClick={() => setAssigningSubjectCourse(course)} 
                                                                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold bg-white border border-indigo-200 px-2 py-1 rounded-md"
                                                            >
                                                                + Add Subject
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </td>

                                            {isAdmin && (
                                                <td className="p-4 text-right">
                                                    <div className="flex justify-end space-x-1.5">
                                                        <button 
                                                            onClick={() => setAssigningSubjectCourse(course)}
                                                            className="text-emerald-600 hover:text-emerald-900 p-1.5 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                                                            title="Add Subject to Course"
                                                        >
                                                            <Plus size={15} />
                                                        </button>
                                                        <button 
                                                            onClick={() => {
                                                                setEditingCourse(course);
                                                                setEditName(course.name);
                                                                setEditDescription(course.description || '');
                                                            }} 
                                                            className="text-indigo-600 hover:text-indigo-900 p-1.5 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors" 
                                                            title="Edit Course"
                                                        >
                                                            <Edit size={15} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteCourse(course._id)} 
                                                            className="text-red-500 hover:text-red-700 p-1.5 bg-red-50 hover:bg-red-100 rounded-lg transition-colors" 
                                                            title="Delete Course"
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* View All Subjects Modal — Semester Breakdown */}
            {viewingSubjectsCourse && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] shadow-2xl border border-slate-100 relative flex flex-col overflow-hidden">
                        {/* Sticky Header with Close Button */}
                        <div className="sticky top-0 z-10 bg-white border-b border-slate-100 p-5 sm:p-6 flex items-center justify-between shadow-2xs">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-xs flex-shrink-0">
                                    {viewingSubjectsCourse.name?.substring(0, 3)}
                                </div>
                                <div>
                                    <h3 className="text-base sm:text-lg font-bold text-slate-800">
                                        {viewingSubjectsCourse.name} — Full Curriculum
                                    </h3>
                                    <p className="text-xs text-slate-400">
                                        Semester-wise breakdown of assigned subjects
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setViewingSubjectsCourse(null)} 
                                className="text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-2 rounded-xl transition-colors flex-shrink-0"
                                title="Close Modal"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
                            {getSemestersForCourseName(viewingSubjectsCourse.name).map((semName) => {
                                const semSubjects = subjects.filter(
                                    s => (s.course?._id || s.course) === viewingSubjectsCourse._id && (s.semester || 'Semester 1') === semName
                                );

                                return (
                                    <div key={semName} className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80">
                                        <div className="flex items-center justify-between border-b border-slate-200/60 pb-2 mb-3">
                                            <span className="font-extrabold text-xs text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded-md uppercase tracking-wider">
                                                {semName}
                                            </span>
                                            {isAdmin && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setViewingSubjectsCourse(null);
                                                        setAssigningSubjectCourse(viewingSubjectsCourse);
                                                        setNewSubjectSemester(semName);
                                                    }}
                                                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-white border border-indigo-200 px-2.5 py-1 rounded-lg shadow-2xs hover:bg-indigo-50 transition-colors"
                                                >
                                                    + Add Subject to {semName}
                                                </button>
                                            )}
                                        </div>

                                        {semSubjects.length === 0 ? (
                                            <p className="text-xs text-slate-400 italic py-2">No subjects assigned for {semName} yet.</p>
                                        ) : (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                                {semSubjects.map(sub => (
                                                    <div key={sub._id} className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between shadow-2xs">
                                                        <div>
                                                            <span className="font-extrabold text-[11px] text-indigo-700 block mb-0.5">
                                                                [{sub.code}]
                                                            </span>
                                                            <p className="font-bold text-slate-800 text-xs">{sub.name}</p>
                                                        </div>
                                                        {isAdmin && (
                                                            <button
                                                                onClick={() => handleDeleteSubject(sub._id)}
                                                                className="text-slate-400 hover:text-red-600 p-1 transition-colors"
                                                                title="Delete Subject"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseList;
