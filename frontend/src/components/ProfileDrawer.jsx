import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
    X, User, Mail, Shield, CheckCircle, 
    LogOut, Edit3, UserCheck, Phone, BookOpen
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfileDrawer = ({ isOpen, onClose }) => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    if (!isOpen) return null;

    const getRoleBadgeColor = (role) => {
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

    const handleOpenEditPage = () => {
        onClose();
        navigate('/profile', { state: { defaultTab: 'edit' } });
    };

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
                onClick={onClose}
            />

            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
                <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col transform transition-transform ease-in-out duration-300">
                    
                    {/* Header */}
                    <div className="p-5 sm:p-6 bg-gradient-to-r from-indigo-900 to-indigo-950 text-white flex items-center justify-between border-b border-indigo-800">
                        <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 rounded-xl bg-indigo-600/80 flex items-center justify-center text-white shadow-xs">
                                <User size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-base text-white">User Profile</h3>
                                <p className="text-xs text-indigo-300">Account settings & information</p>
                            </div>
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-2 rounded-lg text-indigo-300 hover:text-white hover:bg-indigo-800/60 transition-colors focus:outline-none"
                            aria-label="Close profile drawer"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
                        
                        {/* User Card */}
                        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 text-center relative overflow-hidden">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-white font-bold text-2xl flex items-center justify-center mx-auto shadow-md ring-4 ring-white">
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <h4 className="font-bold text-slate-900 text-lg mt-3">{user?.name}</h4>
                            <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
                            
                            <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border uppercase tracking-wider capitalize shadow-xs">
                                <span className={`px-2.5 py-0.5 rounded-full ${getRoleBadgeColor(user?.role)}`}>
                                    {user?.role || 'Student'}
                                </span>
                            </div>
                        </div>

                        {/* View Details Card */}
                        <div className="space-y-4">
                            <div className="space-y-3 bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs">
                                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                                    <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                                        <User size={14} /> Full Name
                                    </span>
                                    <span className="text-sm font-semibold text-slate-800">{user?.name}</span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                                    <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                                        <Mail size={14} /> Email Address
                                    </span>
                                    <span className="text-sm font-medium text-slate-700 truncate max-w-[200px]">{user?.email}</span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                                    <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                                        <Shield size={14} /> Account Role
                                    </span>
                                    <span className="text-xs font-bold text-indigo-600 uppercase">{user?.role}</span>
                                </div>
                                <div className="flex items-center justify-between py-2">
                                    <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                                        <CheckCircle size={14} /> Account Status
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Active
                                    </span>
                                </div>
                            </div>

                            {/* Edit My Profile Button - Loads full Profile Page */}
                            <button
                                onClick={handleOpenEditPage}
                                className="w-full py-3 px-4 bg-indigo-50 hover:bg-indigo-100/90 text-indigo-700 rounded-xl font-semibold text-sm flex items-center justify-center space-x-2 transition-all border border-indigo-200 shadow-xs group"
                            >
                                <Edit3 size={16} className="group-hover:scale-110 transition-transform text-indigo-600" />
                                <span>Edit My Profile</span>
                            </button>
                        </div>
                    </div>

                    {/* Footer / Sign out */}
                    <div className="p-5 bg-slate-50 border-t border-slate-200">
                        <button
                            onClick={() => {
                                onClose();
                                logout();
                            }}
                            className="w-full py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl font-semibold text-xs flex items-center justify-center space-x-2 transition-colors"
                        >
                            <LogOut size={16} />
                            <span>Sign Out from Account</span>
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ProfileDrawer;
