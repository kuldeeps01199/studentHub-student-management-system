import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../../services/api';
import { Eye, EyeOff, BookOpen, GraduationCap } from 'lucide-react';

const TeacherForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { register, handleSubmit, setValue, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [subjects, setSubjects] = useState([]);
    const [courses, setCourses] = useState([]);
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [selectedCourses, setSelectedCourses] = useState([]);

    const isEditMode = !!id;

    useEffect(() => {
        const fetchDropdowns = async () => {
            try {
                const [subRes, crsRes] = await Promise.all([
                    api.get('/subjects'),
                    api.get('/courses')
                ]);
                setSubjects(subRes.data);
                setCourses(crsRes.data);
            } catch (err) {
                console.error('Failed to fetch subjects or courses', err);
            }
        };
        fetchDropdowns();

        if (isEditMode) {
            fetchTeacher();
        }
    }, [id]);

    const fetchTeacher = async () => {
        try {
            const { data } = await api.get(`/teachers/${id}`);
            const fields = ['fullName', 'employeeId', 'phone', 'qualification', 'designation'];
            fields.forEach(field => {
                if (data[field] !== undefined) {
                    setValue(field, data[field]);
                }
            });
            if (data.user?.email) {
                setValue('email', data.user.email);
            }
            if (data.assignedSubjects) {
                const subIds = data.assignedSubjects.map(s => s._id || s);
                setSelectedSubjects(subIds);
            }
            if (data.assignedCourses) {
                const crsIds = data.assignedCourses.map(c => c._id || c);
                setSelectedCourses(crsIds);
            }
        } catch (err) {
            setError('Failed to fetch teacher details');
        }
    };

    const handleSubjectToggle = (subId) => {
        setSelectedSubjects(prev => 
            prev.includes(subId) ? prev.filter(i => i !== subId) : [...prev, subId]
        );
    };

    const handleCourseToggle = (crsId) => {
        setSelectedCourses(prev => 
            prev.includes(crsId) ? prev.filter(i => i !== crsId) : [...prev, crsId]
        );
    };

    const onSubmit = async (data) => {
        setLoading(true);
        setError('');
        try {
            const payload = {
                ...data,
                assignedSubjects: selectedSubjects,
                assignedCourses: selectedCourses
            };
            if (isEditMode) {
                await api.put(`/teachers/${id}`, payload);
            } else {
                await api.post('/teachers', payload);
            }
            navigate('/teachers');
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-slate-800">
                    {isEditMode ? 'Edit Teacher Details' : 'Add New Teacher'}
                </h1>
                <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-800">
                    Back
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 sm:p-8">
                {error && <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Full Name *</label>
                            <input 
                                {...register('fullName', { required: 'Full Name is required' })} 
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500" 
                            />
                            {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Email Address *</label>
                            <input 
                                type="email"
                                {...register('email', { required: !isEditMode ? 'Email is required' : false })} 
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500" 
                                disabled={isEditMode}
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                        </div>

                        {/* Password */}
                        {!isEditMode && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Password *</label>
                                <div className="relative">
                                    <input 
                                        type={showPassword ? 'text' : 'password'}
                                        {...register('password', { required: 'Password is required' })} 
                                        className="w-full px-4 py-2 pr-11 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm" 
                                        placeholder="Min. 6 characters"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                            </div>
                        )}

                        {/* Employee ID */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Employee ID *</label>
                            <input 
                                {...register('employeeId', { required: 'Employee ID is required' })} 
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500" 
                            />
                            {errors.employeeId && <p className="text-red-500 text-xs mt-1">{errors.employeeId.message}</p>}
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                            <input 
                                {...register('phone')} 
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500" 
                            />
                        </div>

                        {/* Education Level / Qualification */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Education Level / Qualification *</label>
                            <select 
                                {...register('qualification', { required: 'Qualification is required' })} 
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                            >
                                <option value="Ph.D / Doctorate">Ph.D / Doctorate</option>
                                <option value="Master's Degree (M.Tech / M.Sc / MCA / M.A)">Master's Degree (M.Tech / M.Sc / MCA / M.A)</option>
                                <option value="Bachelor's Degree (B.Tech / B.Sc / BCA / B.A)">Bachelor's Degree (B.Tech / B.Sc / BCA / B.A)</option>
                                <option value="Diploma / Certification">Diploma / Certification</option>
                            </select>
                        </div>

                        {/* Designation */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Designation</label>
                            <select 
                                {...register('designation')} 
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                            >
                                <option value="Professor">Professor</option>
                                <option value="Associate Professor">Associate Professor</option>
                                <option value="Assistant Professor">Assistant Professor</option>
                                <option value="Senior Lecturer">Senior Lecturer</option>
                                <option value="Guest Faculty">Guest Faculty</option>
                            </select>
                        </div>
                    </div>

                    {/* Assign Subjects */}
                    <div className="pt-2">
                        <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1.5">
                            <BookOpen size={16} className="text-emerald-600" />
                            <span>Assign Teaching Subjects ({selectedSubjects.length})</span>
                        </label>
                        {subjects.length === 0 ? (
                            <p className="text-xs text-slate-400 italic">No subjects available to assign.</p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-4 rounded-xl border border-slate-200/80 max-h-40 overflow-y-auto">
                                {subjects.map(sub => (
                                    <label key={sub._id} className="flex items-center space-x-2.5 p-2 rounded-lg hover:bg-white transition-colors cursor-pointer border border-transparent hover:border-slate-200">
                                        <input 
                                            type="checkbox"
                                            checked={selectedSubjects.includes(sub._id)}
                                            onChange={() => handleSubjectToggle(sub._id)}
                                            className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                                        />
                                        <span className="text-xs font-semibold text-slate-800">{sub.name} <span className="text-slate-400 font-normal">({sub.code})</span></span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Assign Classes / Courses */}
                    <div className="pt-2">
                        <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1.5">
                            <GraduationCap size={16} className="text-indigo-600" />
                            <span>Assign Classes / Courses ({selectedCourses.length})</span>
                        </label>
                        {courses.length === 0 ? (
                            <p className="text-xs text-slate-400 italic">No courses available to assign.</p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-4 rounded-xl border border-slate-200/80 max-h-40 overflow-y-auto">
                                {courses.map(crs => (
                                    <label key={crs._id} className="flex items-center space-x-2.5 p-2 rounded-lg hover:bg-white transition-colors cursor-pointer border border-transparent hover:border-slate-200">
                                        <input 
                                            type="checkbox"
                                            checked={selectedCourses.includes(crs._id)}
                                            onChange={() => handleCourseToggle(crs._id)}
                                            className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                                        />
                                        <span className="text-xs font-semibold text-slate-800">{crs.name} <span className="text-slate-400 font-normal">({crs.code || 'Course'})</span></span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end space-x-4 pt-4 border-t border-slate-100">
                        <button 
                            type="button" 
                            onClick={() => navigate(-1)}
                            className="px-6 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors text-sm font-medium"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 text-sm font-semibold shadow-xs"
                        >
                            {loading ? 'Saving...' : 'Save Teacher & Assignments'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TeacherForm;
