import React, { useState, useEffect, useContext, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { 
    User, Mail, Shield, Key, CheckCircle, AlertCircle, 
    BookOpen, Calendar, Award, Phone, Hash, Save, Eye, EyeOff,
    Lock, MapPin, Sparkles
} from 'lucide-react';

const Profile = () => {
    const { user, updateUser } = useContext(AuthContext);
    const location = useLocation();
    const alertRef = useRef(null);
    const [activeTab, setActiveTab] = useState(location.state?.defaultTab || 'overview'); // 'overview' | 'edit' | 'security'

    const scrollToAlert = () => {
        // Scroll the main content container in Layout
        const mainEl = document.querySelector('main');
        if (mainEl) {
            mainEl.scrollTo({ top: 0, behavior: 'smooth' });
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => {
            if (alertRef.current) {
                alertRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 50);
    };
    
    // Extra details from student/teacher profile
    const [extraDetails, setExtraDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(true);

    // Edit Profile Form State (Editable fields)
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [gender, setGender] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [address, setAddress] = useState('');
    
    // Security / Password Form State
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [saving, setSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const fetchRoleData = async () => {
            try {
                const userId = user?._id || user?.id;
                if (user?.role === 'student') {
                    const { data } = await api.get('/students');
                    const myRecord = data.find(s => String(s.user?._id || s.user) === String(userId));
                    if (myRecord) {
                        setExtraDetails(myRecord);
                        setPhone(myRecord.phone || '');
                        setGender(myRecord.gender || '');
                        if (myRecord.dateOfBirth) {
                            setDateOfBirth(myRecord.dateOfBirth.split('T')[0]);
                        }
                        setAddress(myRecord.address || '');
                    }
                } else if (user?.role === 'teacher') {
                    const { data } = await api.get('/teachers');
                    const myRecord = data.find(t => String(t.user?._id || t.user) === String(userId));
                    if (myRecord) {
                        setExtraDetails(myRecord);
                        setPhone(myRecord.phone || '');
                    }
                }
            } catch (err) {
                console.error('Failed to load role details', err);
            } finally {
                setLoadingDetails(false);
            }
        };

        if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
            fetchRoleData();
        }
    }, [user]);

    useEffect(() => {
        if (location.state?.defaultTab) {
            setActiveTab(location.state.defaultTab);
        }
    }, [location.state]);

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');
        setSaving(true);

        try {
            const payload = {
                name: name ? name.trim() : undefined,
                phone: phone !== undefined ? phone.trim() : undefined,
            };

            if (user?.role === 'admin' && email) {
                payload.email = email.trim();
            }

            if (user?.role === 'student') {
                if (gender) payload.gender = gender;
                if (dateOfBirth) payload.dateOfBirth = dateOfBirth;
                if (address !== undefined) payload.address = address.trim();
            }

            const { data } = await api.put('/auth/profile', payload);
            updateUser({ name: data.name, email: data.email });
            
            // Update local extraDetails state
            setExtraDetails(prev => ({
                ...prev,
                phone: payload.phone || prev?.phone,
                gender: payload.gender || prev?.gender,
                dateOfBirth: payload.dateOfBirth || prev?.dateOfBirth,
                address: payload.address || prev?.address,
                fullName: data.name
            }));

            setSuccessMsg('Profile updated successfully! All changes have been saved.');
            scrollToAlert();
            setTimeout(() => setSuccessMsg(''), 4500);
        } catch (err) {
            console.error('Update profile error', err);
            setErrorMsg(err.response?.data?.message || 'Failed to update profile. Please try again.');
            scrollToAlert();
        } finally {
            setSaving(false);
        }
    };

    const handleSavePassword = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');

        if (password.length < 6) {
            setErrorMsg('Password must be at least 6 characters long');
            scrollToAlert();
            return;
        }

        if (password !== confirmPassword) {
            setErrorMsg('Passwords do not match');
            scrollToAlert();
            return;
        }

        setSaving(true);
        try {
            await api.put('/auth/profile', { password });
            setSuccessMsg('Password changed successfully!');
            setPassword('');
            setConfirmPassword('');
            scrollToAlert();
            setTimeout(() => setSuccessMsg(''), 4500);
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Failed to update password');
            scrollToAlert();
        } finally {
            setSaving(false);
        }
    };

    const getRoleBadge = (role) => {
        switch (role?.toLowerCase()) {
            case 'admin':
                return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'teacher':
                return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'student':
            default:
                return 'bg-indigo-100 text-indigo-700 border-indigo-200';
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            
            {/* Top Hero Banner */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="h-32 sm:h-36 bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 relative">
                    <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:16px_16px]"></div>
                </div>
                
                <div className="px-6 sm:px-8 pb-6 relative">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
                        {/* Avatar & Info */}
                        <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-5">
                            <div className="-mt-12 sm:-mt-14 w-24 h-24 sm:w-26 sm:h-26 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white font-bold text-3xl sm:text-4xl flex items-center justify-center shadow-xl ring-4 ring-white flex-shrink-0">
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="pt-2 sm:pt-4">
                                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                    {user?.name}
                                </h1>
                                <p className="text-sm text-slate-500 mt-0.5">{user?.email}</p>
                            </div>
                        </div>

                        {/* Status Badges */}
                        <div className="flex items-center space-x-2 pt-2 sm:pt-0 sm:pb-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shadow-xs ${getRoleBadge(user?.role)}`}>
                                {user?.role || 'Student'}
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                Active Account
                            </span>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex border-b border-slate-100 space-x-8 mt-6 overflow-x-auto">
                        <button
                            onClick={() => { setActiveTab('overview'); setErrorMsg(''); setSuccessMsg(''); }}
                            className={`pb-3 text-sm font-semibold transition-colors whitespace-nowrap relative ${
                                activeTab === 'overview'
                                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                                    : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            Overview & Details
                        </button>
                        <button
                            onClick={() => { setActiveTab('edit'); setErrorMsg(''); setSuccessMsg(''); }}
                            className={`pb-3 text-sm font-semibold transition-colors whitespace-nowrap relative ${
                                activeTab === 'edit'
                                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                                    : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            Edit Profile
                        </button>
                        <button
                            onClick={() => { setActiveTab('security'); setErrorMsg(''); setSuccessMsg(''); }}
                            className={`pb-3 text-sm font-semibold transition-colors whitespace-nowrap relative ${
                                activeTab === 'security'
                                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                                    : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            Security & Password
                        </button>
                    </div>
                </div>
            </div>

            {/* Alert Messages (Auto-scrolled on save) */}
            <div ref={alertRef}>
                {successMsg && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl text-sm flex items-center gap-2 shadow-xs mb-4">
                        <CheckCircle size={18} className="text-emerald-500 flex-shrink-0" />
                        <span className="font-medium">{successMsg}</span>
                    </div>
                )}
                {errorMsg && (
                    <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm flex items-center gap-2 shadow-xs mb-4">
                        <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
                        <span className="font-medium">{errorMsg}</span>
                    </div>
                )}
            </div>

            {/* Tab 1: Overview & Details */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Personal Info */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                                <User size={18} className="text-indigo-600" />
                                Personal Information
                            </h3>
                            <button
                                onClick={() => setActiveTab('edit')}
                                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg transition-colors"
                            >
                                Edit Details
                            </button>
                        </div>

                        <div className="space-y-3.5">
                            <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                                <span className="text-xs font-semibold text-slate-400 uppercase">Full Name</span>
                                <span className="text-sm font-semibold text-slate-800">{user?.name}</span>
                            </div>
                            <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                                <span className="text-xs font-semibold text-slate-400 uppercase">Email Address</span>
                                <span className="text-sm font-medium text-slate-700">{user?.email}</span>
                            </div>
                            <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                                <span className="text-xs font-semibold text-slate-400 uppercase">Phone Number</span>
                                <span className="text-sm font-medium text-slate-700">{extraDetails?.phone || 'Not provided'}</span>
                            </div>
                            {user?.role === 'student' && (
                                <>
                                    <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                                        <span className="text-xs font-semibold text-slate-400 uppercase">Gender</span>
                                        <span className="text-sm font-medium text-slate-700">{extraDetails?.gender || 'Not specified'}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                                        <span className="text-xs font-semibold text-slate-400 uppercase">Date of Birth</span>
                                        <span className="text-sm font-medium text-slate-700">
                                            {extraDetails?.dateOfBirth ? new Date(extraDetails.dateOfBirth).toLocaleDateString() : 'Not provided'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                                        <span className="text-xs font-semibold text-slate-400 uppercase">Address</span>
                                        <span className="text-sm font-medium text-slate-700 truncate max-w-[200px]">{extraDetails?.address || 'Not provided'}</span>
                                    </div>
                                </>
                            )}
                            <div className="flex justify-between items-center py-1.5">
                                <span className="text-xs font-semibold text-slate-400 uppercase">System Role</span>
                                <span className="text-xs font-bold uppercase text-indigo-600">{user?.role}</span>
                            </div>
                        </div>
                    </div>

                    {/* Academic / Institutional Details */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
                        <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
                            <BookOpen size={18} className="text-indigo-600" />
                            {user?.role === 'teacher' ? 'Faculty Information' : user?.role === 'admin' ? 'Administrative Information' : 'Academic Record (Institutional)'}
                        </h3>

                        {user?.role === 'student' && (
                            <div className="space-y-3.5">
                                <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                                    <span className="text-xs font-semibold text-slate-400 uppercase flex items-center gap-1">
                                        <Hash size={13} /> Roll Number
                                    </span>
                                    <span className="text-sm font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">{extraDetails?.rollNumber || 'CS2024001'}</span>
                                </div>
                                <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                                    <span className="text-xs font-semibold text-slate-400 uppercase">Admission No.</span>
                                    <span className="text-sm font-semibold text-slate-700">{extraDetails?.admissionNumber || 'ADM2024001'}</span>
                                </div>
                                <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                                    <span className="text-xs font-semibold text-slate-400 uppercase">Enrolled Course</span>
                                    <span className="text-sm font-medium text-slate-800">{extraDetails?.course?.name || 'Computer Applications'}</span>
                                </div>
                                <div className="flex justify-between items-center py-1.5">
                                    <span className="text-xs font-semibold text-slate-400 uppercase">Current Semester</span>
                                    <span className="text-sm font-bold text-indigo-600">{extraDetails?.semester || 'Semester 1'}</span>
                                </div>
                            </div>
                        )}

                        {user?.role === 'teacher' && (
                            <div className="space-y-3.5">
                                <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                                    <span className="text-xs font-semibold text-slate-400 uppercase flex items-center gap-1">
                                        <Hash size={13} /> Employee ID
                                    </span>
                                    <span className="text-sm font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">{extraDetails?.employeeId || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                                    <span className="text-xs font-semibold text-slate-400 uppercase">Education Qualification</span>
                                    <span className="text-sm font-semibold text-emerald-700">{extraDetails?.qualification || 'Ph.D / Doctorate'}</span>
                                </div>
                                <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                                    <span className="text-xs font-semibold text-slate-400 uppercase">Designation</span>
                                    <span className="text-sm font-medium text-slate-800">{extraDetails?.designation || 'Assistant Professor'}</span>
                                </div>
                                <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                                    <span className="text-xs font-semibold text-slate-400 uppercase">Assigned Subjects</span>
                                    <span className="text-sm font-medium text-slate-700">{extraDetails?.assignedSubjects?.length || 0} Subjects</span>
                                </div>
                                <div className="flex justify-between items-center py-1.5">
                                    <span className="text-xs font-semibold text-slate-400 uppercase">Department</span>
                                    <span className="text-sm font-medium text-slate-700">Academics</span>
                                </div>
                            </div>
                        )}

                        {user?.role === 'admin' && (
                            <div className="space-y-3.5">
                                <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                                    <span className="text-xs font-semibold text-slate-400 uppercase">Access Level</span>
                                    <span className="text-sm font-semibold text-slate-800">Super Administrator</span>
                                </div>
                                <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                                    <span className="text-xs font-semibold text-slate-400 uppercase">Database Control</span>
                                    <span className="text-sm font-medium text-emerald-600">Full System Read/Write</span>
                                </div>
                                <div className="flex justify-between items-center py-1.5">
                                    <span className="text-xs font-semibold text-slate-400 uppercase">Security Clearance</span>
                                    <span className="text-sm font-bold text-purple-600">Level 3 (Max)</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Tab 2: Edit Profile (Editable + Fixed Visual separation) */}
            {activeTab === 'edit' && (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-8">
                    
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <Sparkles size={20} className="text-indigo-600" />
                            Update Profile Details
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                            Personal details can be updated directly. Official institutional credentials (Roll No, Course, Semester) are locked by administration.
                        </p>
                    </div>

                    <form onSubmit={handleSaveProfile} className="space-y-6">
                        
                        {/* Section 1: Editable Fields */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                Editable Personal Information
                            </h4>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name *</label>
                                    <input 
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                        placeholder="Enter your full name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Phone Number</label>
                                    <input 
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                        placeholder="e.g. +91 9876543210"
                                    />
                                </div>

                                {user?.role === 'student' && (
                                    <>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Gender</label>
                                            <select
                                                value={gender}
                                                onChange={(e) => setGender(e.target.value)}
                                                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                            >
                                                <option value="">Select Gender</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Date of Birth</label>
                                            <input 
                                                type="date"
                                                value={dateOfBirth}
                                                onChange={(e) => setDateOfBirth(e.target.value)}
                                                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                            />
                                        </div>

                                        <div className="sm:col-span-2">
                                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Residential Address</label>
                                            <textarea 
                                                rows="2"
                                                value={address}
                                                onChange={(e) => setAddress(e.target.value)}
                                                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                                placeholder="Enter full address"
                                            />
                                        </div>
                                    </>
                                )}

                                {user?.role === 'admin' && (
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Admin Email Address</label>
                                        <input 
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Section 2: Fixed / Locked Fields (Read-Only) */}
                        <div className="pt-4 border-t border-slate-100 space-y-4">
                            <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                <Lock size={13} className="text-slate-400" />
                                <span>Locked Official Information (Institutional)</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/80 p-4 rounded-xl border border-slate-200/60">
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1 flex items-center gap-1">
                                        <Lock size={11} className="text-slate-400" /> Email Address
                                    </label>
                                    <input 
                                        type="text"
                                        disabled
                                        value={user?.email || ''}
                                        className="w-full px-3.5 py-2 bg-slate-100/80 border border-slate-200 rounded-lg text-xs text-slate-500 cursor-not-allowed"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1 flex items-center gap-1">
                                        <Lock size={11} className="text-slate-400" /> Account Role
                                    </label>
                                    <input 
                                        type="text"
                                        disabled
                                        value={user?.role?.toUpperCase() || 'STUDENT'}
                                        className="w-full px-3.5 py-2 bg-slate-100/80 border border-slate-200 rounded-lg text-xs text-slate-500 cursor-not-allowed font-semibold"
                                    />
                                </div>

                                {user?.role === 'student' && (
                                    <>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 mb-1 flex items-center gap-1">
                                                <Lock size={11} className="text-slate-400" /> Roll Number
                                            </label>
                                            <input 
                                                type="text"
                                                disabled
                                                value={extraDetails?.rollNumber || 'CS2024001'}
                                                className="w-full px-3.5 py-2 bg-slate-100/80 border border-slate-200 rounded-lg text-xs text-slate-500 cursor-not-allowed font-medium"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 mb-1 flex items-center gap-1">
                                                <Lock size={11} className="text-slate-400" /> Admission Number
                                            </label>
                                            <input 
                                                type="text"
                                                disabled
                                                value={extraDetails?.admissionNumber || 'ADM2024001'}
                                                className="w-full px-3.5 py-2 bg-slate-100/80 border border-slate-200 rounded-lg text-xs text-slate-500 cursor-not-allowed"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 mb-1 flex items-center gap-1">
                                                <Lock size={11} className="text-slate-400" /> Course
                                            </label>
                                            <input 
                                                type="text"
                                                disabled
                                                value={extraDetails?.course?.name || 'Computer Applications'}
                                                className="w-full px-3.5 py-2 bg-slate-100/80 border border-slate-200 rounded-lg text-xs text-slate-500 cursor-not-allowed"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 mb-1 flex items-center gap-1">
                                                <Lock size={11} className="text-slate-400" /> Semester
                                            </label>
                                            <input 
                                                type="text"
                                                disabled
                                                value={extraDetails?.semester || 'Semester 1'}
                                                className="w-full px-3.5 py-2 bg-slate-100/80 border border-slate-200 rounded-lg text-xs text-slate-500 cursor-not-allowed"
                                            />
                                        </div>
                                    </>
                                )}

                                {user?.role === 'teacher' && (
                                    <>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 mb-1 flex items-center gap-1">
                                                <Lock size={11} className="text-slate-400" /> Employee ID
                                            </label>
                                            <input 
                                                type="text"
                                                disabled
                                                value={extraDetails?.employeeId || 'N/A'}
                                                className="w-full px-3.5 py-2 bg-slate-100/80 border border-slate-200 rounded-lg text-xs text-slate-500 cursor-not-allowed font-mono"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 mb-1 flex items-center gap-1">
                                                <Lock size={11} className="text-slate-400" /> Education Qualification
                                            </label>
                                            <input 
                                                type="text"
                                                disabled
                                                value={extraDetails?.qualification || 'Ph.D / Doctorate'}
                                                className="w-full px-3.5 py-2 bg-slate-100/80 border border-slate-200 rounded-lg text-xs text-slate-600 font-semibold cursor-not-allowed"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 mb-1 flex items-center gap-1">
                                                <Lock size={11} className="text-slate-400" /> Designation
                                            </label>
                                            <input 
                                                type="text"
                                                disabled
                                                value={extraDetails?.designation || 'Assistant Professor'}
                                                className="w-full px-3.5 py-2 bg-slate-100/80 border border-slate-200 rounded-lg text-xs text-slate-600 font-medium cursor-not-allowed"
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2 flex justify-end">
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-colors shadow-sm disabled:opacity-50 flex items-center space-x-2"
                            >
                                <Save size={16} />
                                <span>{saving ? 'Saving changes...' : 'Save Profile Changes'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Tab 3: Security & Password */}
            {activeTab === 'security' && (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm max-w-2xl">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Key size={20} className="text-indigo-600" />
                        Change Account Password
                    </h3>

                    <form onSubmit={handleSavePassword} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
                            <div className="relative">
                                <input 
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    placeholder="Enter new password (min. 6 characters)"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-2.5 pr-11 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm New Password</label>
                            <input 
                                type={showPassword ? 'text' : 'password'}
                                required
                                placeholder="Re-enter new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                            />
                        </div>

                        <div className="pt-3">
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-colors shadow-sm disabled:opacity-50 flex items-center space-x-2"
                            >
                                <Key size={16} />
                                <span>{saving ? 'Updating password...' : 'Update Password'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            )}

        </div>
    );
};

export default Profile;
