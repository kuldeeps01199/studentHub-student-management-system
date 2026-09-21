import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const PublicNavbar = () => {
    const location = useLocation();
    const isLoginPage = location.pathname === '/login';
    const isSignupPage = location.pathname === '/signup';

    return (
        <nav className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <Link to="/home" className="flex items-center space-x-3 group" title="StudentHub - Home">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50/80 p-1 border border-indigo-100 shadow-2xs flex items-center justify-center group-hover:border-indigo-300 group-hover:bg-indigo-100/60 transition-all flex-shrink-0">
                            <img 
                                src="/logo.jpg" 
                                alt="StudentHub Logo" 
                                className="w-full h-full object-contain rounded-lg group-hover:scale-105 transition-transform"
                            />
                        </div>
                        <div className="flex flex-col justify-center">
                            <div className="flex items-center gap-2">
                                <span className="text-lg font-black text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors leading-tight">
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

                    <div className="flex items-center space-x-3">
                        {!isLoginPage && (
                            <Link to="/login" className="text-slate-600 hover:text-indigo-600 px-4 py-2 rounded-xl text-sm font-semibold transition-colors border border-slate-200 hover:border-indigo-300">
                                Sign In
                            </Link>
                        )}
                        {!isSignupPage && (
                            <Link to="/signup" className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm">
                                Get Started
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default PublicNavbar;
