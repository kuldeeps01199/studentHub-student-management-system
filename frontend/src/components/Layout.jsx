import React, { useContext, useState } from 'react';
import { Navigate, Outlet, Link, NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
    LayoutDashboard, Users, UserCog, BookOpen, User, Shield,
    FileText, LogOut, ClipboardList, Award, GraduationCap, Menu, X
} from 'lucide-react';
import ProfileDrawer from './ProfileDrawer';

const allNavItems = [
    { path: '/', icon: <LayoutDashboard size={20} />, name: 'Dashboard', exact: true, roles: ['admin', 'teacher', 'student'] },
    { path: '/profile', icon: <User size={20} />, name: 'My Profile', roles: ['student', 'teacher', 'admin'] },
    { path: '/report-card', icon: <FileText size={20} />, name: 'My Report Card', roles: ['student'] },
    { path: '/attendance/report', icon: <ClipboardList size={20} />, name: 'My Attendance', roles: ['student'] },
    { path: '/results/report', icon: <Award size={20} />, name: 'My Results', roles: ['student'] },
    { path: '/reports', icon: <FileText size={20} />, name: 'Reports Hub', roles: ['admin', 'teacher'] },
    { path: '/report-card', icon: <FileText size={20} />, name: 'Report Card', roles: ['admin', 'teacher'] },
    { path: '/students', icon: <Users size={20} />, name: 'Students', roles: ['admin', 'teacher'] },
    { path: '/teachers', icon: <UserCog size={20} />, name: 'Teachers', roles: ['admin'] },
    { path: '/courses', icon: <GraduationCap size={20} />, name: 'Courses', roles: ['admin'] },
    { path: '/subjects', icon: <BookOpen size={20} />, name: 'Subjects', roles: ['admin'] },
    { path: '/attendance', icon: <ClipboardList size={20} />, name: 'Mark & Edit Attendance', roles: ['admin', 'teacher'] },
    { path: '/attendance/report', icon: <FileText size={20} />, name: 'Attendance Report', roles: ['admin', 'teacher'] },
    { path: '/results', icon: <Award size={20} />, name: 'Manage Results', roles: ['admin', 'teacher'] },
    { path: '/results/report', icon: <FileText size={20} />, name: 'Results Report', roles: ['admin', 'teacher'] },
];

const Sidebar = ({ mobileOpen, setMobileOpen, onOpenProfile }) => {
    const { user, logout } = useContext(AuthContext);

    const visibleNavItems = allNavItems.filter(item => 
        !item.roles || item.roles.includes(user?.role || 'student')
    );

    return (
        <>
            {/* Overlay for mobile & tablet */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 lg:hidden transition-opacity"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 sm:w-72 lg:w-64 bg-gradient-to-b from-indigo-900 via-indigo-900 to-indigo-950 text-white flex flex-col h-screen transform transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none
                ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>

                {/* Logo - Clickable to Home */}
                <div className="p-4 sm:p-5 border-b border-indigo-800/80 flex items-center justify-between">
                    <Link 
                        to="/" 
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center space-x-3 group transition-transform active:scale-95"
                        title="StudentHub - Go to Home / Dashboard"
                    >
                        <img 
                            src="/logo.jpg" 
                            alt="StudentHub Logo" 
                            className="w-10 h-10 rounded-xl object-contain bg-white p-0.5 shadow-md group-hover:scale-105 transition-transform"
                        />
                        <div>
                            <h1 className="text-lg font-black tracking-tight text-white group-hover:text-indigo-200 transition-colors">
                                StudentHub
                            </h1>
                            <p className="text-indigo-300 text-[11px] font-medium leading-none mt-0.5">Management System</p>
                        </div>
                    </Link>

                    {/* Close button for mobile */}
                    <button 
                        onClick={() => setMobileOpen(false)}
                        className="lg:hidden p-1.5 rounded-lg text-indigo-300 hover:text-white hover:bg-indigo-800"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* User Info - Clickable to Open Full Profile Page */}
                <div className="px-4 py-3.5 border-b border-indigo-800/80">
                    <Link 
                        to="/profile"
                        onClick={() => setMobileOpen(false)}
                        className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl bg-indigo-800/40 hover:bg-indigo-800/80 transition-all text-left group border border-indigo-700/30 hover:border-indigo-600"
                        title="Click to open my profile page"
                    >
                        <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm ring-2 ring-indigo-400/40 group-hover:scale-105 transition-transform">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-white truncate group-hover:text-indigo-200 transition-colors">{user?.name}</p>
                            <p className="text-xs text-indigo-300 capitalize flex items-center gap-1">
                                <span>{user?.role || 'User'}</span>
                                <span className="text-[10px] text-indigo-400">• View Profile</span>
                            </p>
                        </div>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
                    <p className="text-[11px] font-bold text-indigo-400 uppercase px-3 mb-2 tracking-wider">
                        {user?.role === 'admin' ? '⚡ COMMAND CENTER' : user?.role === 'teacher' ? '📋 FACULTY PANEL' : '🎓 STUDENT PORTAL'}
                    </p>
                    {visibleNavItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            end={item.exact}
                            onClick={() => setMobileOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all duration-150 text-sm font-medium
                                ${isActive
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/40 font-semibold'
                                    : 'text-indigo-200 hover:bg-indigo-800/60 hover:text-white'
                                }`
                            }
                        >
                            {item.icon}
                            <span>{item.name}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Logout */}
                <div className="p-3.5 border-t border-indigo-800/80">
                    <button
                        onClick={logout}
                        className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl hover:bg-red-500/20 w-full transition-colors text-indigo-300 hover:text-red-300 text-sm font-medium"
                    >
                        <LogOut size={18} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

const Header = ({ setMobileOpen, onOpenProfile }) => {
    const { user } = useContext(AuthContext);

    return (
        <header className="bg-white shadow-xs h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-slate-200/80 sticky top-0 z-20">
            {/* Left: Mobile hamburger & Full Project Name */}
            <div className="flex items-center space-x-3 sm:space-x-4">
                <button
                    onClick={() => setMobileOpen(prev => !prev)}
                    className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none"
                    aria-label="Toggle Navigation Menu"
                >
                    <Menu size={22} />
                </button>
                
                {/* Full Project Name (Clickable to Home) */}
                <Link 
                    to="/" 
                    className="flex items-center space-x-3 group transition-transform active:scale-98"
                    title="StudentHub - Go to Home / Dashboard"
                >
                    <div className="w-10 h-10 rounded-xl bg-indigo-50/80 p-1 border border-indigo-100 shadow-2xs flex items-center justify-center group-hover:border-indigo-300 group-hover:bg-indigo-100/60 transition-all flex-shrink-0">
                        <img 
                            src="/logo.jpg" 
                            alt="StudentHub Logo" 
                            className="w-full h-full object-contain rounded-lg group-hover:scale-105 transition-transform"
                        />
                    </div>
                    <div className="flex flex-col justify-center">
                        <div className="flex items-center gap-2">
                            <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors leading-tight">
                                StudentHub
                            </span>
                            <span className="hidden md:inline-block text-[10px] font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-md uppercase tracking-wider shadow-2xs">
                                Portal
                            </span>
                        </div>
                        <p className="hidden sm:block text-[11px] font-semibold text-slate-400 tracking-wide leading-none mt-0.5">
                            Student Management System
                        </p>
                    </div>
                </Link>
            </div>

            {/* Right: Role Badge & Profile Avatar */}
            <div className="flex items-center space-x-3">
                {/* Role Pill Badge */}
                <div className="hidden xs:flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-2xs capitalize">
                    {user?.role === 'admin' ? (
                        <span className="flex items-center gap-1 text-purple-700 bg-purple-50 border border-purple-200/80 px-2.5 py-0.5 rounded-full">
                            <Shield size={13} className="text-purple-600" /> Admin
                        </span>
                    ) : user?.role === 'teacher' ? (
                        <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full">
                            <UserCog size={13} className="text-emerald-600" /> Teacher
                        </span>
                    ) : (
                        <span className="flex items-center gap-1 text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2.5 py-0.5 rounded-full">
                            <GraduationCap size={13} className="text-indigo-600" /> Student
                        </span>
                    )}
                </div>

                <button
                    onClick={onOpenProfile}
                    className="relative group p-1 rounded-full hover:ring-4 hover:ring-indigo-100 transition-all focus:outline-none"
                    title="Open Profile Settings"
                    aria-label="User Profile"
                >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-700 flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-indigo-200 group-hover:scale-105 transition-transform">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    {/* Status green dot */}
                    <span className="absolute bottom-1 right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                </button>
            </div>
        </header>
    );
};

const Layout = () => {
    const { user, loading } = useContext(AuthContext);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center space-y-4">
                <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 text-sm font-medium">Loading portal...</p>
            </div>
        </div>
    );

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {/* Sidebar */}
            <Sidebar 
                mobileOpen={mobileOpen} 
                setMobileOpen={setMobileOpen} 
                onOpenProfile={() => setProfileOpen(true)}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                <Header 
                    setMobileOpen={setMobileOpen} 
                    onOpenProfile={() => setProfileOpen(true)}
                />
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>

            {/* Profile Drawer / Sidebar */}
            <ProfileDrawer 
                isOpen={profileOpen} 
                onClose={() => setProfileOpen(false)} 
            />
        </div>
    );
};

export default Layout;
