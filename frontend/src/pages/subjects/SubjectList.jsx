import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { Plus, Trash2, BookOpen, Edit, X, Search, Filter } from 'lucide-react';

const SubjectList = () => {
    const { user } = useContext(AuthContext);
    const [subjects, setSubjects] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCourseFilter, setSelectedCourseFilter] = useState('');
    const [viewMode, setViewMode] = useState('grouped'); // 'table' or 'grouped'
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [courseId, setCourseId] = useState('');
    const [semester, setSemester] = useState('Semester 1');
    const [saving, setSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const [editingSubject, setEditingSubject] = useState(null);
    const [editName, setEditName] = useState('');
    const [editCode, setEditCode] = useState('');
    const [editCourseId, setEditCourseId] = useState('');
    const [editSemester, setEditSemester] = useState('Semester 1');

    // Quick Add Subject Modal State
    const [quickAddCourse, setQuickAddCourse] = useState(null);
    const [quickName, setQuickName] = useState('');
    const [quickCode, setQuickCode] = useState('');
    const [quickSemester, setQuickSemester] = useState('Semester 1');

    const isAdmin = user?.role === 'admin';

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [subs, crs] = await Promise.all([
                api.get('/subjects'),
                api.get('/courses')
            ]);
            setSubjects(subs.data);
            setCourses(crs.data);
        } catch (error) {
            console.error('Error fetching data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        setSaving(true);
        setSuccessMsg('');
        setErrorMsg('');
        try {
            await api.post('/subjects', { name, code, course: courseId, semester });
            fetchData();
            setName('');
            setCode('');
            setCourseId('');
            setSemester('Semester 1');
            setSuccessMsg('Subject added successfully! ✅');
            setTimeout(() => setSuccessMsg(''), 4000);
        } catch (error) {
            const msg = error.response?.data?.message || 'Error adding subject';
            setErrorMsg(msg);
            setTimeout(() => setErrorMsg(''), 5000);
        } finally {
            setSaving(false);
        }
    };

    const handleQuickAdd = async (e) => {
        e.preventDefault();
        if (!quickAddCourse) return;
        setSaving(true);
        setSuccessMsg('');
        setErrorMsg('');
        try {
            await api.post('/subjects', {
                name: quickName,
                code: quickCode,
                course: quickAddCourse._id,
                semester: quickSemester
            });
            fetchData();
            setQuickAddCourse(null);
            setQuickName('');
            setQuickCode('');
            setQuickSemester('Semester 1');
            setSuccessMsg('Subject added successfully! ✅');
            setTimeout(() => setSuccessMsg(''), 4000);
        } catch (error) {
            const msg = error.response?.data?.message || 'Error adding subject';
            setErrorMsg(msg);
            setTimeout(() => setErrorMsg(''), 5000);
        } finally {
            setSaving(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!editingSubject) return;
        setSaving(true);
        try {
            await api.put(`/subjects/${editingSubject._id}`, {
                name: editName,
                code: editCode,
                course: editCourseId,
                semester: editSemester
            });
            fetchData();
            setEditingSubject(null);
        } catch (error) {
            console.error('Error updating subject', error);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this subject?')) {
            try {
                await api.delete(`/subjects/${id}`);
                setSubjects(subjects.filter(s => s._id !== id));
            } catch (error) {
                console.error('Error deleting subject', error);
            }
        }
    };

    const filteredSubjects = subjects.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              s.code.toLowerCase().includes(searchTerm.toLowerCase());
        const courseIdStr = s.course?._id || s.course;
        const matchesCourse = selectedCourseFilter ? courseIdStr === selectedCourseFilter : true;
        return matchesSearch && matchesCourse;
    });

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Academic Subjects</h1>
                    <p className="text-slate-500 text-sm mt-0.5">{filteredSubjects.length} of {subjects.length} subjects registered</p>
                </div>
            </div>

            {/* Search & Filter Controls */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-72">
                    <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                        type="text"
                        placeholder="Search by name or code..."
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Filter size={16} className="text-slate-400" />
                    <select
                        className="w-full sm:w-48 px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={selectedCourseFilter}
                        onChange={(e) => setSelectedCourseFilter(e.target.value)}
                    >
                        <option value="">All Course Programs</option>
                        {courses.map(c => (
                            <option key={c._id} value={c._id}>{c.name}</option>
                        ))}
                    </select>

                    {/* View Mode Toggle */}
                    <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                        <button
                            type="button"
                            onClick={() => setViewMode('grouped')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                viewMode === 'grouped' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            Grouped View
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('table')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                viewMode === 'table' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            Table View
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Admin Only: Add Subject Form */}
            {isAdmin && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 sm:p-6 space-y-4">
                    {successMsg && (
                        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-between animate-fade-in">
                            <span>{successMsg}</span>
                            <button onClick={() => setSuccessMsg('')} className="text-emerald-500 hover:text-emerald-800 text-sm font-bold">✕</button>
                        </div>
                    )}
                    {errorMsg && (
                        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-between animate-fade-in">
                            <span>⚠️ {errorMsg}</span>
                            <button onClick={() => setErrorMsg('')} className="text-rose-500 hover:text-rose-800 text-sm font-bold">✕</button>
                        </div>
                    )}
                    <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                        <Plus size={18} className="text-indigo-600" />
                        Add New Subject
                    </h2>
                    <form onSubmit={handleAdd} className="flex gap-4 items-end flex-wrap">
                        <div className="flex-1 min-w-[220px]">
                            <div className="flex justify-between items-center mb-1.5 flex-wrap gap-1">
                                <label className="block text-xs font-semibold text-slate-700">Subject Name *</label>
                                <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                                    <span>Preset:</span>
                                    {[
                                        { n: 'Mathematics', c: 'MATH101' },
                                        { n: 'Programming', c: 'PROG102' },
                                        { n: 'Database', c: 'DBMS201' },
                                        { n: 'Networking', c: 'NET301' }
                                    ].map(preset => (
                                        <button
                                            key={preset.n}
                                            type="button"
                                            onClick={() => { setName(preset.n); setCode(preset.c); }}
                                            className="px-1.5 py-0.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded transition-colors font-bold"
                                        >
                                            +{preset.n}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <input 
                                required 
                                type="text" 
                                placeholder="e.g. Mathematics, Programming, Database"
                                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" 
                                value={name} 
                                onChange={e => setName(e.target.value)} 
                            />
                        </div>
                        <div className="w-36">
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Subject Code *</label>
                            <input 
                                required 
                                type="text" 
                                placeholder="e.g. CS101"
                                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" 
                                value={code} 
                                onChange={e => setCode(e.target.value)} 
                            />
                        </div>
                        <div className="w-48">
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Assign to Course *</label>
                            <select 
                                required 
                                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" 
                                value={courseId} 
                                onChange={e => setCourseId(e.target.value)}
                            >
                                <option value="">Select Course...</option>
                                {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="w-40">
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Semester</label>
                            <select 
                                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" 
                                value={semester} 
                                onChange={e => setSemester(e.target.value)}
                            >
                                {(() => {
                                    const selected = courses.find(c => c._id === courseId);
                                    const name = selected?.name?.toUpperCase() || '';
                                    let count = 8;
                                    if (name.includes('BCA')) count = 6;
                                    else if (name.includes('MBA') || name.includes('MCA')) count = 4;
                                    else if (name.includes('B.TECH') || name.includes('BTECH')) count = 8;
                                    return Array.from({ length: count }, (_, i) => `Semester ${i + 1}`).map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ));
                                })()}
                            </select>
                        </div>
                        <button 
                            type="submit" 
                            disabled={saving}
                            className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl hover:bg-indigo-700 font-medium text-sm transition-colors flex items-center space-x-2 shadow-sm disabled:opacity-50"
                        >
                            <Plus size={18} /> <span>{saving ? 'Adding...' : 'Add Subject'}</span>
                        </button>
                    </form>
                </div>
            )}

            {/* Edit Modal */}
            {editingSubject && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-slate-100 relative">
                        <button 
                            onClick={() => setEditingSubject(null)} 
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                        >
                            <X size={20} />
                        </button>
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Edit Subject</h3>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Subject Name</label>
                                <input 
                                    required 
                                    type="text" 
                                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                                    value={editName}
                                    onChange={e => setEditName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Subject Code</label>
                                <input 
                                    required 
                                    type="text" 
                                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                                    value={editCode}
                                    onChange={e => setEditCode(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Course</label>
                                <select 
                                    required 
                                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                                    value={editCourseId}
                                    onChange={e => setEditCourseId(e.target.value)}
                                >
                                    <option value="">Select Course...</option>
                                    {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Semester</label>
                                <select 
                                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                                    value={editSemester}
                                    onChange={e => setEditSemester(e.target.value)}
                                >
                                    {(() => {
                                        const selected = courses.find(c => c._id === editCourseId);
                                        const name = selected?.name?.toUpperCase() || '';
                                        let count = 8;
                                        if (name.includes('BCA')) count = 6;
                                        else if (name.includes('MBA') || name.includes('MCA')) count = 4;
                                        else if (name.includes('B.TECH') || name.includes('BTECH')) count = 8;
                                        return Array.from({ length: count }, (_, i) => `Semester ${i + 1}`).map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ));
                                    })()}
                                </select>
                            </div>
                            <div className="flex justify-end space-x-2 pt-2">
                                <button 
                                    type="button"
                                    onClick={() => setEditingSubject(null)}
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

            {/* Quick Add Subject Modal */}
            {quickAddCourse && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-100 relative">
                        <button 
                            onClick={() => setQuickAddCourse(null)} 
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
                        >
                            <X size={20} />
                        </button>
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                                {quickAddCourse.name?.substring(0, 3)}
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-800">Add Subject to {quickAddCourse.name}</h3>
                                <p className="text-xs text-slate-400">Target Course: <strong className="text-indigo-600">{quickAddCourse.name}</strong></p>
                            </div>
                        </div>

                        <form onSubmit={handleQuickAdd} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Subject Name *</label>
                                <input 
                                    required 
                                    type="text" 
                                    placeholder="e.g. Mathematics, Programming"
                                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 font-medium"
                                    value={quickName}
                                    onChange={e => setQuickName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Subject Code *</label>
                                <input 
                                    required 
                                    type="text" 
                                    placeholder="e.g. BCA101, CSE001"
                                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 font-medium"
                                    value={quickCode}
                                    onChange={e => setQuickCode(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Semester *</label>
                                <select 
                                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
                                    value={quickSemester}
                                    onChange={e => setQuickSemester(e.target.value)}
                                >
                                    {(() => {
                                        const name = quickAddCourse.name?.toUpperCase() || '';
                                        let count = 8;
                                        if (name.includes('BCA')) count = 6;
                                        else if (name.includes('MBA') || name.includes('MCA')) count = 4;
                                        else if (name.includes('B.TECH') || name.includes('BTECH')) count = 8;
                                        return Array.from({ length: count }, (_, i) => `Semester ${i + 1}`).map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ));
                                    })()}
                                </select>
                            </div>
                            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                                <button 
                                    type="button"
                                    onClick={() => setQuickAddCourse(null)}
                                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={saving}
                                    className="px-5 py-2 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl shadow-xs disabled:opacity-50 transition-colors"
                                >
                                    {saving ? 'Adding...' : 'Add Subject'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Course Grouped View */}
            {viewMode === 'grouped' ? (
                <div className="space-y-6">
                    {courses.filter(c => !selectedCourseFilter || c._id === selectedCourseFilter).map(crs => {
                        const crsSubjects = filteredSubjects.filter(
                            s => (s.course?._id || s.course) === crs._id
                        );
                        return (
                            <div key={crs._id} className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5">
                                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                                            {crs.name.substring(0, 3)}
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-slate-800">{crs.name} Program</h3>
                                            <p className="text-xs text-slate-400">{crsSubjects.length} subjects assigned</p>
                                        </div>
                                    </div>
                                    {isAdmin && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setQuickAddCourse(crs);
                                                setQuickName('');
                                                setQuickCode('');
                                                setQuickSemester('Semester 1');
                                            }}
                                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3.5 py-1.5 rounded-xl transition-all shadow-2xs cursor-pointer active:scale-95 flex items-center gap-1.5"
                                        >
                                            <Plus size={14} />
                                            <span>Add Subject to {crs.name}</span>
                                        </button>
                                    )}
                                </div>

                                {crsSubjects.length === 0 ? (
                                    <p className="text-xs text-slate-400 italic p-4 text-center bg-slate-50 rounded-xl">
                                        No subjects assigned under {crs.name} program yet.
                                    </p>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {crsSubjects.map(sub => (
                                            <div key={sub._id} className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-white hover:border-slate-300 transition-all flex justify-between items-start">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-extrabold text-xs text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md">
                                                            {sub.code}
                                                        </span>
                                                        <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                                                            {sub.semester || 'Semester 1'}
                                                        </span>
                                                    </div>
                                                    <h4 className="font-bold text-slate-800 text-sm">{sub.name}</h4>
                                                </div>
                                                {isAdmin && (
                                                    <div className="flex items-center space-x-1">
                                                        <button 
                                                            onClick={() => {
                                                                setEditingSubject(sub);
                                                                setEditName(sub.name);
                                                                setEditCode(sub.code);
                                                                setEditCourseId(sub.course?._id || sub.course || '');
                                                                setEditSemester(sub.semester || 'Semester 1');
                                                            }} 
                                                            className="text-slate-400 hover:text-indigo-600 p-1"
                                                            title="Edit"
                                                        >
                                                            <Edit size={14} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDelete(sub._id)} 
                                                            className="text-slate-400 hover:text-red-600 p-1"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* Subjects Table */
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/80 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                                    <th className="p-4">Subject Code</th>
                                    <th className="p-4">Subject Name</th>
                                    <th className="p-4">Assigned Course</th>
                                    <th className="p-4">Semester</th>
                                    {isAdmin && <th className="p-4 text-right">Actions</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    [1, 2, 3].map(i => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="p-4"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                                            <td className="p-4"><div className="h-4 bg-slate-200 rounded w-40"></div></td>
                                            <td className="p-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                                            <td className="p-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                                            {isAdmin && <td className="p-4"><div className="h-4 bg-slate-200 rounded w-10 ml-auto"></div></td>}
                                        </tr>
                                    ))
                                ) : filteredSubjects.length === 0 ? (
                                    <tr>
                                        <td colSpan={isAdmin ? 5 : 4} className="p-12 text-center text-slate-400">
                                            <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
                                            <p className="font-semibold text-slate-600">No matching subjects found</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredSubjects.map(sub => (
                                        <tr key={sub._id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="p-4">
                                                <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md text-xs">
                                                    {sub.code}
                                                </span>
                                            </td>
                                            <td className="p-4 font-semibold text-slate-800 text-sm">{sub.name}</td>
                                            <td className="p-4">
                                                <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold">
                                                    {sub.course?.name || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-semibold">
                                                    {sub.semester || 'Semester 1'}
                                                </span>
                                            </td>
                                            {isAdmin && (
                                                <td className="p-4 text-right">
                                                    <div className="flex justify-end space-x-2">
                                                        <button 
                                                            onClick={() => {
                                                                setEditingSubject(sub);
                                                                setEditName(sub.name);
                                                                setEditCode(sub.code);
                                                                setEditCourseId(sub.course?._id || sub.course || '');
                                                                setEditSemester(sub.semester || 'Semester 1');
                                                            }} 
                                                            className="text-indigo-600 hover:text-indigo-900 p-1.5 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors" 
                                                            title="Edit Subject"
                                                        >
                                                            <Edit size={15} />
                                                        </button>
                                                        <button onClick={() => handleDelete(sub._id)} className="text-red-500 hover:text-red-700 p-1.5 bg-red-50 hover:bg-red-100 rounded-lg transition-colors" title="Delete Subject">
                                                            <Trash2 size={15} />
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubjectList;
