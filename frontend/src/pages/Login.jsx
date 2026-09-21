import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar';
import OtpInput from '../components/OtpInput';
import { Eye, EyeOff, Mail, Lock, Key, X, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../services/api';

const Login = () => {
    const [selectedRole, setSelectedRole] = useState('student');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { login, user, loading } = useContext(AuthContext);

    // Forgot Password OTP Modal State
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [sendingOtp, setSendingOtp] = useState(false);
    const [resetting, setResetting] = useState(false);
    const [forgotSuccess, setForgotSuccess] = useState('');
    const [forgotError, setForgotError] = useState('');
    const [debugOtp, setDebugOtp] = useState('');

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (user) {
        return <Navigate to="/" replace />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        const result = await login(email, password, selectedRole);
        if (!result.success) {
            setError(result.message || 'Login failed. Please check your credentials.');
        }
        setSubmitting(false);
    };

    const handleSendOTP = async (e) => {
        if (e) e.preventDefault();
        setForgotError('');
        setForgotSuccess('');
        setSendingOtp(true);

        try {
            const { data } = await api.post('/auth/send-otp', {
                email: forgotEmail.trim()
            });
            setOtpSent(true);
            setForgotSuccess(data.message || 'OTP sent successfully to your registered email address!');
            if (data.debugOTP) {
                setDebugOtp(data.debugOTP);
            }
        } catch (err) {
            setForgotError(err.response?.data?.message || 'Failed to send OTP. Please check your email.');
        } finally {
            setSendingOtp(false);
        }
    };

    const handleVerifyOTPAndResetPassword = async (e) => {
        e.preventDefault();
        setForgotError('');
        setForgotSuccess('');
        setResetting(true);

        try {
            const { data } = await api.post('/auth/verify-otp-reset-password', {
                email: forgotEmail.trim(),
                otp: otpCode.trim(),
                newPassword: newPassword
            });
            setForgotSuccess(data.message || 'Password reset successfully!');
            setTimeout(() => {
                setShowForgotModal(false);
                setForgotSuccess('');
                setForgotEmail('');
                setOtpCode('');
                setNewPassword('');
                setOtpSent(false);
                setDebugOtp('');
            }, 2500);
        } catch (err) {
            setForgotError(err.response?.data?.message || 'Failed to verify OTP or reset password.');
        } finally {
            setResetting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <PublicNavbar />
            <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-2xl shadow-lg border border-slate-100 relative">
                    <div className="text-center">
                        <Link to="/home" className="inline-block group mb-3" title="StudentHub - Go to Home">
                            <img 
                                src="/logo.jpg" 
                                alt="StudentHub Logo" 
                                className="w-16 h-16 rounded-2xl object-contain mx-auto bg-slate-50 p-1 border border-slate-200 shadow-md group-hover:scale-105 transition-transform"
                            />
                        </Link>
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                            Welcome to StudentHub
                        </h2>
                        <p className="mt-1 text-xs text-slate-500 font-medium">
                            Select your role and sign in to access your portal
                        </p>
                    </div>

                    {/* Role Selector Tabs */}
                    <div className="bg-slate-100 p-1.5 rounded-xl flex space-x-1">
                        <button
                            type="button"
                            onClick={() => setSelectedRole('student')}
                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                                selectedRole === 'student'
                                    ? 'bg-white text-indigo-700 shadow-xs'
                                    : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            👨‍🎓 Student
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedRole('teacher')}
                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                                selectedRole === 'teacher'
                                    ? 'bg-white text-emerald-700 shadow-xs'
                                    : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            👨‍🏫 Teacher
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedRole('admin')}
                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                                selectedRole === 'admin'
                                    ? 'bg-white text-purple-700 shadow-xs'
                                    : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            🛡️ Admin
                        </button>
                    </div>

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 p-3.5 rounded-xl text-xs font-semibold text-center leading-relaxed">
                                {error}
                            </div>
                        )}
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        id="email-address"
                                        name="email"
                                        type="email"
                                        required
                                        className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-colors"
                                        placeholder={`Enter your ${selectedRole} email`}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block text-sm font-medium text-slate-700">Password</label>
                                    <button
                                        type="button"
                                        onClick={() => { 
                                            setShowForgotModal(true); 
                                            setForgotEmail(email); 
                                            setOtpSent(false); 
                                            setForgotError(''); 
                                            setForgotSuccess(''); 
                                            setDebugOtp('');
                                        }}
                                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                                    >
                                        Forgot password?
                                    </button>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        className="w-full pl-10 pr-11 py-2.5 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-colors"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors shadow-sm mt-2"
                        >
                            {submitting ? 'Signing in...' : `Sign in as ${selectedRole.toUpperCase()}`}
                        </button>
                    </form>

                    <p className="text-center text-sm text-slate-500">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-indigo-600 font-semibold hover:text-indigo-500">
                            Register now
                        </Link>
                    </p>
                </div>
            </div>

            {/* Forgot Password OTP Modal */}
            {showForgotModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-100 relative">
                        <button 
                            onClick={() => setShowForgotModal(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                <Key size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Reset Password via OTP</h3>
                                <p className="text-xs text-slate-500">We send a 6-digit OTP code to your registered email</p>
                            </div>
                        </div>

                        {forgotSuccess && (
                            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center gap-2">
                                <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
                                <span className="font-medium">{forgotSuccess}</span>
                            </div>
                        )}

                        {forgotError && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs flex items-center gap-2">
                                <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
                                <span className="font-medium">{forgotError}</span>
                            </div>
                        )}

                        {debugOtp && (
                            <div className="mb-4 p-2.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-mono text-center">
                                💡 <strong>Dev OTP:</strong> {debugOtp}
                            </div>
                        )}

                        {!otpSent ? (
                            <form onSubmit={handleSendOTP} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Account Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        placeholder="Enter your registered email"
                                        className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        value={forgotEmail}
                                        onChange={(e) => setForgotEmail(e.target.value)}
                                    />
                                </div>

                                <div className="flex justify-end space-x-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowForgotModal(false)}
                                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={sendingOtp}
                                        className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-50 flex items-center space-x-1.5"
                                    >
                                        <span>{sendingOtp ? 'Sending OTP...' : 'Send OTP to Email'}</span>
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={handleVerifyOTPAndResetPassword} className="space-y-4">
                                <OtpInput
                                    email={forgotEmail}
                                    onOtpChange={(code) => setOtpCode(code)}
                                    onResend={handleSendOTP}
                                    sending={sendingOtp}
                                />

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">New Password (min 6 chars) *</label>
                                    <input
                                        type="password"
                                        required
                                        placeholder="Enter new password"
                                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                </div>

                                <div className="flex justify-end space-x-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowForgotModal(false)}
                                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={resetting}
                                        className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-50"
                                    >
                                        {resetting ? 'Verifying...' : 'Verify OTP & Reset Password'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;
