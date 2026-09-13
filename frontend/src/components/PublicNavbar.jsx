import React from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const PublicNavbar = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <nav className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm sticky top-0 z-50 transition-colors duration-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <Link to="/home" className="flex items-center space-x-3 group" title="StudentHub - Home">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/60 p-1 border border-indigo-100 dark:border-indigo-800/60 shadow-2xs flex items-center justify-center group-hover:border-indigo-300 group-hover:bg-indigo-100/60 transition-all flex-shrink-0">
                            <img 
                                src="/logo.jpg" 
                                alt="StudentHub Logo" 
                                className="w-full h-full object-contain rounded-lg group-hover:scale-105 transition-transform"
                            />
                        </div>
                        <div className="flex flex-col justify-center">
                            <div className="flex items-center gap-2">
                                <span className="text-lg font-black text-slate-900 dark:text-white tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight">
                                    StudentHub
                                </span>
                                <span className="hidden md:inline-block text-[10px] font-extrabold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200/80 dark:border-indigo-800/80 px-2 py-0.5 rounded-md uppercase tracking-wider shadow-2xs">
                                    Portal
                                </span>
                            </div>
                            <p className="hidden sm:block text-[11px] font-semibold text-slate-400 dark:text-slate-400 tracking-wide leading-none mt-0.5">
                                Student Management System
                            </p>
                        </div>
                    </Link>

                    <div className="flex items-center space-x-3">
                        {/* Theme Toggle Button */}
                        <button
                            onClick={toggleTheme}
                            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-all focus:outline-none"
                            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
                            aria-label="Toggle Theme"
                        >
                            {theme === 'dark' ? (
                                <Sun size={18} className="text-amber-400 animate-spin-slow" />
                            ) : (
                                <Moon size={18} className="text-indigo-600" />
                            )}
                        </button>

                        <Link to="/login" className="text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 px-4 py-2 rounded-xl text-sm font-semibold transition-colors border border-slate-200 dark:border-slate-700 hover:border-indigo-300">
                            Sign In
                        </Link>
                        <Link to="/signup" className="bg-indigo-600 text-white hover:bg-indigo-500 px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm">
                            Get Started
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default PublicNavbar;
