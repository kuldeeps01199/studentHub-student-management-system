import React, { useState, useEffect, useContext } from 'react';
import { Link, Navigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import PublicNavbar from '../components/PublicNavbar';
import OtpInput from '../components/OtpInput';
import { Eye, EyeOff, Mail, CheckCircle, ShieldAlert } from 'lucide-react';

const Signup = () => {
    const [role, setRole] = useState('student');
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [courses, setCourses] = useState([]);
    const { login, user } = useContext(AuthContext);

    // Signup OTP States
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [otp, setOtp] = useState('');
    const [sendingOtp, setSendingOtp] = useState(false);
    const [verifyingOtp, setVerifyingOtp] = useState(false);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        rollNumber: '',
        admissionNumber: '',
        course: '',
        semester: '',
        employeeId: '',
        phone: ''
    });

    const [adminExists, setAdminExists] = useState(false);

    useEffect(() => {
        api.get('/courses')
            .then(({ data }) => setCourses(data))
            .catch(err => console.error('Failed to fetch courses', err));

        api.get('/auth/admin-exists')
            .then(({ data }) => setAdminExists(data.exists))
            .catch(console.error);
    }, []);

    if (user) return <Navigate to="/" replace />;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSendOTP = async () => {
        setError('');
        setSuccessMsg('');
        if (!formData.email) {
            setError('Please enter your Email Address first.');
            return;
        }
        setSendingOtp(true);
        try {
            const { data } = await api.post('/auth/send-signup-otp', {
                email: formData.email.trim(),
                role
            });
            setOtpSent(true);
            setOtpVerified(false);
            setSuccessMsg(data.message || `Verification OTP sent to ${formData.email}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send verification OTP.');
        } finally {
            setSendingOtp(false);
        }
    };

    const handleVerifyOTP = async () => {
        setError('');
        setSuccessMsg('');

        if (!otp || otp.trim().length !== 6) {
            setError('Please enter the complete 6-digit OTP code.');
            return;
        }

        setVerifyingOtp(true);
        try {
            await api.post('/auth/verify-signup-otp', {
                email: formData.email.trim(),
                otp: otp.trim()
            });
            setOtpVerified(true);
            setSuccessMsg('✅ Email verified successfully! Now fill the details below to complete registration.');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid or expired OTP code. Please check and try again.');
        } finally {
            setVerifyingOtp(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');

        if (!otpSent) {
            await handleSendOTP();
            return;
        }

        if (!otpVerified) {
            setError('Please click "Verify OTP" to verify your email first before submitting registration.');
            return;
        }

        setLoading(true);
        try {
            const endpoint = role === 'student' 
                ? '/auth/register-student' 
                : role === 'teacher' 
                ? '/auth/register-teacher' 
                : '/auth/register-admin';
            await api.post(endpoint, { ...formData, otp: otp.trim() });
            await login(formData.email, formData.password, role);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
            setLoading(false);
        }
    };

    const inputClass = "w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors";

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <PublicNavbar />
            <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-xl w-full bg-white p-8 sm:p-10 rounded-xl shadow-lg border border-slate-100">
                    <div className="text-center mb-6">
                        <Link to="/home" className="inline-block group mb-3" title="StudentHub - Go to Home">
                            <img 
                                src="/logo.jpg" 
                                alt="StudentHub Logo" 
                                className="w-16 h-16 rounded-2xl object-contain mx-auto bg-slate-50 p-1 border border-slate-200 shadow-md group-hover:scale-105 transition-transform"
                            />
                        </Link>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Create an account</h2>
                        <p className="mt-1 text-xs text-slate-500 font-medium">Join StudentHub – Student Management System</p>
                    </div>

                    {/* Role Toggle */}
                    <div className="flex justify-center space-x-3 mb-6">
                        <button
                            type="button"
                            className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${role === 'student' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            onClick={() => { setRole('student'); setOtpSent(false); }}
                        >
                            👨‍🎓 Student Registration
                        </button>
                        <button
                            type="button"
                            className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${role === 'teacher' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            onClick={() => { setRole('teacher'); setOtpSent(false); }}
                        >
                            👨‍🏫 Teacher Registration
                        </button>
                    </div>

                    <div className="mb-5 bg-indigo-50/70 p-3 rounded-xl border border-indigo-100 text-center">
                        <p className="text-xs text-indigo-900 font-semibold">
                            🛡️ <strong>Admin Account?</strong> Admin accounts are protected and created internally. Please <Link to="/login" className="underline text-indigo-600 font-bold">Sign In here</Link>.
                        </p>
                    </div>

                    {successMsg && (
                        <div className="mb-4 bg-emerald-50 text-emerald-700 p-3 rounded-lg text-xs font-semibold text-center border border-emerald-200 flex items-center justify-center gap-2">
                            <CheckCircle size={16} className="text-emerald-500" />
                            <span>{successMsg}</span>
                        </div>
                    )}

                    {error && (
                        <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-xs font-semibold text-center border border-red-200">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Common Fields */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                                <input name="fullName" required className={inputClass} value={formData.fullName} onChange={handleChange} placeholder="Enter full name" />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address (Verification Required) *</label>
                                <div className="flex gap-2">
                                    <input 
                                        name="email" 
                                        type="email" 
                                        required 
                                        className={inputClass} 
                                        value={formData.email} 
                                        onChange={handleChange} 
                                        placeholder="example@email.com" 
                                    />
                                    <button
                                        type="button"
                                        onClick={handleSendOTP}
                                        disabled={sendingOtp || !formData.email}
                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors whitespace-nowrap shadow-xs flex items-center gap-1"
                                    >
                                        <Mail size={14} />
                                        <span>{sendingOtp ? 'Sending...' : otpSent ? 'Resend OTP' : 'Send OTP'}</span>
                                    </button>
                                </div>
                            </div>

                            {/* Modern 6-Digit OTP Code Pin Field */}
                            {otpVerified ? (
                                <div className="md:col-span-2 bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
                                        <CheckCircle size={18} className="text-emerald-500" />
                                        <span>Email Verified: <strong className="font-mono text-emerald-950">{formData.email}</strong></span>
                                    </div>
                                    <span className="text-[11px] bg-emerald-200/60 text-emerald-800 font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-wider">
                                        Verified ✓
                                    </span>
                                </div>
                            ) : otpSent ? (
                                <div className="md:col-span-2">
                                    <OtpInput
                                        email={formData.email}
                                        onOtpChange={(code) => setOtp(code)}
                                        onResend={handleSendOTP}
                                        onVerify={handleVerifyOTP}
                                        sending={sendingOtp || verifyingOtp}
                                    />
                                </div>
                            ) : null}

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Password *</label>
                                <div className="relative">
                                    <input 
                                        name="password" 
                                        type={showPassword ? 'text' : 'password'} 
                                        required 
                                        className={`${inputClass} pr-10`} 
                                        value={formData.password} 
                                        onChange={handleChange} 
                                        placeholder="Min. 6 characters" 
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                                <input name="phone" className={inputClass} value={formData.phone} onChange={handleChange} placeholder="Optional" />
                            </div>

                            {/* Student Fields */}
                            {role === 'student' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Roll Number *</label>
                                        <input name="rollNumber" required className={inputClass} value={formData.rollNumber} onChange={handleChange} placeholder="e.g. CS2024001" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Admission Number *</label>
                                        <input name="admissionNumber" required className={inputClass} value={formData.admissionNumber} onChange={handleChange} placeholder="e.g. ADM2024001" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Course *</label>
                                        <select name="course" required className={inputClass} value={formData.course} onChange={handleChange}>
                                            <option value="">Select Course</option>
                                            {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Semester *</label>
                                        <select name="semester" required className={inputClass} value={formData.semester} onChange={handleChange}>
                                            <option value="">Select Semester</option>
                                            {[1,2,3,4,5,6,7,8].map(s => (
                                                <option key={s} value={`Semester ${s}`}>Semester {s}</option>
                                            ))}
                                        </select>
                                    </div>
                                </>
                            )}

                            {/* Teacher Fields */}
                            {role === 'teacher' && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Employee ID *</label>
                                    <input name="employeeId" required className={inputClass} value={formData.employeeId} onChange={handleChange} placeholder="e.g. EMP001" />
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all mt-2 shadow-md hover:shadow-lg"
                        >
                            {loading 
                                ? 'Verifying & Registering...' 
                                : `Create ${role === 'student' ? 'Student' : 'Teacher'} Account`}
                        </button>
                    </form>

                    <p className="text-center text-sm text-slate-500 mt-6">
                        Already have an account?{' '}
                        <Link to="/login" className="text-indigo-600 font-medium hover:text-indigo-500">Sign in here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
