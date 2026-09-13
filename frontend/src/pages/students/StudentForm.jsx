import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../../services/api';
import { Eye, EyeOff } from 'lucide-react';

const StudentForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [courses, setCourses] = useState([]);

    const isEditMode = !!id;

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const { data } = await api.get('/courses');
                setCourses(data);
            } catch (err) {
                console.error('Failed to fetch courses', err);
            }
        };
        fetchCourses();

        if (isEditMode) {
            fetchStudent();
        }
    }, [id]);

    const fetchStudent = async () => {
        try {
            const { data } = await api.get(`/students/${id}`);
            const fields = ['fullName', 'rollNumber', 'admissionNumber', 'phone', 'gender', 'course', 'semester', 'address', 'profileImage'];
            fields.forEach(field => {
                if (field === 'course' && data[field]) {
                    setValue(field, data[field]._id || data[field]);
                } else {
                    setValue(field, data[field]);
                }
            });
            // Date handling
            if (data.dateOfBirth) {
                setValue('dateOfBirth', data.dateOfBirth.split('T')[0]);
            }
        } catch (err) {
            setError('Failed to fetch student details');
        }
    };

    const onSubmit = async (data) => {
        setLoading(true);
        setError('');
        try {
            if (isEditMode) {
                await api.put(`/students/${id}`, data);
            } else {
                await api.post('/students', data);
            }
            navigate('/students');
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
                    {isEditMode ? 'Edit Student' : 'Add New Student'}
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
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" 
                            />
                            {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Email Address *</label>
                            <input 
                                type="email"
                                {...register('email', { required: !isEditMode ? 'Email is required' : false })} 
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" 
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
                                        className="w-full px-4 py-2 pr-11 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm" 
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

                        {/* Roll Number */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Roll Number *</label>
                            <input 
                                {...register('rollNumber', { required: 'Roll Number is required' })} 
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" 
                            />
                            {errors.rollNumber && <p className="text-red-500 text-xs mt-1">{errors.rollNumber.message}</p>}
                        </div>

                        {/* Admission Number */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Admission Number *</label>
                            <input 
                                {...register('admissionNumber', { required: 'Admission Number is required' })} 
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" 
                            />
                            {errors.admissionNumber && <p className="text-red-500 text-xs mt-1">{errors.admissionNumber.message}</p>}
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                            <input 
                                {...register('phone')} 
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" 
                            />
                        </div>

                        {/* Gender */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Gender</label>
                            <select 
                                {...register('gender')} 
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        {/* DOB */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Date of Birth</label>
                            <input 
                                type="date"
                                {...register('dateOfBirth')} 
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" 
                            />
                        </div>

                        {/* Course */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Course *</label>
                            <select 
                                {...register('course', { required: 'Course is required' })} 
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="">Select Course</option>
                                {courses.map(c => (
                                    <option key={c._id} value={c._id}>{c.name}</option>
                                ))}
                            </select>
                            {errors.course && <p className="text-red-500 text-xs mt-1">{errors.course.message}</p>}
                        </div>

                        {/* Semester */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Semester *</label>
                            <select 
                                {...register('semester', { required: 'Semester is required' })} 
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="">Select Semester</option>
                                {(() => {
                                    const selectedCourseId = watch('course');
                                    const selected = courses.find(c => c._id === selectedCourseId);
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
                            {errors.semester && <p className="text-red-500 text-xs mt-1">{errors.semester.message}</p>}
                        </div>

                        {/* Profile Image URL */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Profile Image URL</label>
                            <input 
                                type="url"
                                placeholder="https://example.com/avatar.jpg"
                                {...register('profileImage')} 
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" 
                            />
                        </div>
                    </div>

                    {/* Address */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Address</label>
                        <textarea 
                            {...register('address')} 
                            rows="3"
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" 
                        />
                    </div>

                    <div className="flex justify-end space-x-4 pt-4 border-t border-slate-100">
                        <button 
                            type="button" 
                            onClick={() => navigate(-1)}
                            className="px-6 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save Student'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StudentForm;
