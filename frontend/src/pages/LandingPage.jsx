import React from 'react';
import { Link } from 'react-router-dom';
import {
    GraduationCap, Users, ClipboardList, Award,
    BookOpen, UserCog, ArrowRight, CheckCircle2, Shield, Zap,
    ShieldCheck, UserCheck, Sparkles, Check
} from 'lucide-react';
import PublicNavbar from '../components/PublicNavbar';

const features = [
    {
        icon: <Users size={24} className="text-indigo-600" />,
        bg: 'bg-indigo-50/80 border-indigo-100 text-indigo-600',
        title: 'Student Management',
        desc: 'Manage student records, enrollment, personal details, and academic history all in one place.'
    },
    {
        icon: <UserCog size={24} className="text-emerald-600" />,
        bg: 'bg-emerald-50/80 border-emerald-100 text-emerald-600',
        title: 'Teacher Management',
        desc: 'Organize faculty profiles, assign subjects, and maintain comprehensive staff records.'
    },
    {
        icon: <ClipboardList size={24} className="text-amber-600" />,
        bg: 'bg-amber-50/80 border-amber-100 text-amber-600',
        title: 'Attendance Tracking',
        desc: 'Mark and monitor daily attendance for each class. Get instant absence summaries.'
    },
    {
        icon: <Award size={24} className="text-rose-600" />,
        bg: 'bg-rose-50/80 border-rose-100 text-rose-600',
        title: 'Exam Results',
        desc: 'Enter and view exam results per subject. Generate digital report cards instantly.'
    },
    {
        icon: <BookOpen size={24} className="text-violet-600" />,
        bg: 'bg-violet-50/80 border-violet-100 text-violet-600',
        title: 'Course & Subjects',
        desc: 'Organize courses and map subjects to them. Keep academics structured and clear.'
    },
    {
        icon: <Shield size={24} className="text-cyan-600" />,
        bg: 'bg-cyan-50/80 border-cyan-100 text-cyan-600',
        title: 'Role-based Access',
        desc: 'Secure login for Admins, Teachers, and Students — each with the right level of access.'
    }
];

const stats = [
    { value: '100%', label: 'Digital Records' },
    { value: '3', label: 'User Roles' },
    { value: '6+', label: 'Modules' },
    { value: '24/7', label: 'Accessibility' },
];

const roleCards = [
    {
        role: 'Admin',
        badge: 'Full Access',
        subtitle: 'Complete System Oversight & Management',
        icon: <ShieldCheck size={26} className="text-white" />,
        gradient: 'from-indigo-600 to-indigo-800',
        borderColor: 'hover:border-indigo-300',
        glowColor: 'hover:shadow-indigo-500/10',
        checkBg: 'bg-indigo-50 text-indigo-600',
        points: [
            'Full system access & administrative controls',
            'Manage all student and teacher accounts',
            'Generate & view institutional reports',
            'Configure courses, subjects & academic structure'
        ]
    },
    {
        role: 'Teacher',
        badge: 'Faculty Portal',
        subtitle: 'Classroom & Academic Operations',
        icon: <UserCheck size={26} className="text-white" />,
        gradient: 'from-emerald-600 to-teal-700',
        borderColor: 'hover:border-emerald-300',
        glowColor: 'hover:shadow-emerald-500/10',
        checkBg: 'bg-emerald-50 text-emerald-600',
        points: [
            'Mark & track daily class attendance',
            'Enter & update student exam marks',
            'View assigned class rosters & profiles',
            'Manage assigned subject curricula & notices'
        ]
    },
    {
        role: 'Student',
        badge: 'Learner Portal',
        subtitle: 'Self-Service Academic Dashboard',
        icon: <GraduationCap size={26} className="text-white" />,
        gradient: 'from-amber-500 to-orange-600',
        borderColor: 'hover:border-amber-300',
        glowColor: 'hover:shadow-amber-500/10',
        checkBg: 'bg-amber-50 text-amber-600',
        points: [
            'View personal & academic profile details',
            'Check real-time attendance percentage',
            'View exam results & digital report cards',
            'Access enrolled course info & notice board'
        ]
    }
];

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <PublicNavbar />

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-indigo-700 via-indigo-800 to-indigo-900 dark:from-slate-950 dark:via-indigo-950 dark:to-slate-900 text-white py-24 px-4 relative overflow-hidden transition-colors duration-200">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:16px_16px]"></div>
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center space-x-2 bg-white/10 dark:bg-indigo-500/10 text-indigo-100 dark:text-indigo-300 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-white/20 dark:border-indigo-500/20 backdrop-blur-sm">
                        <Zap size={14} className="text-amber-300 dark:text-indigo-400 animate-pulse" />
                        <span>Fully Digital · Real-time · MongoDB Powered</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
                        The Smart Way to Manage
                        <span className="bg-gradient-to-r from-indigo-200 via-white to-indigo-200 dark:from-indigo-300 dark:via-indigo-200 dark:to-indigo-400 bg-clip-text text-transparent block mt-1">
                            Your Institution
                        </span>
                    </h1>
                    <p className="text-lg sm:text-xl text-indigo-100/90 dark:text-indigo-200/90 mb-10 max-w-2xl mx-auto leading-relaxed font-light">
                        Replace paper registers and complex spreadsheets with a modern, centralized platform
                        for students, teachers, attendance, results, and administrative oversight.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/signup" className="bg-white text-indigo-700 hover:bg-indigo-50 px-8 py-3.5 rounded-xl font-semibold flex items-center space-x-2 transition-all duration-200 shadow-lg hover:shadow-xl text-lg hover:-translate-y-0.5">
                            <span>Get Started Free</span>
                            <ArrowRight size={20} />
                        </Link>
                        <Link to="/login" className="border border-white/40 dark:border-indigo-400/40 text-white dark:text-indigo-100 hover:bg-white/10 px-8 py-3.5 rounded-xl font-semibold transition-all duration-200 backdrop-blur-sm text-lg">
                            Sign In
                        </Link>
                    </div>
                </div>
            </section>

            {/* Stats Bar */}
            <section className="bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800 py-8 px-4 transition-colors duration-200">
                <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
                    {stats.map((stat, i) => (
                        <div key={i} className="text-center">
                            <p className="text-3xl sm:text-4xl font-extrabold text-indigo-600 dark:text-white tracking-tight">{stat.value}</p>
                            <p className="text-slate-600 dark:text-indigo-300/80 text-sm mt-1 font-medium">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features */}
            <section className="py-24 px-4 bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-indigo-600 dark:text-indigo-400 font-semibold text-xs uppercase tracking-widest bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-100 dark:border-indigo-800/80 px-3.5 py-1.5 rounded-full inline-block mb-3 shadow-xs">
                            Powerful Modules
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight mb-4">
                            Everything You Need
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-base">
                            One comprehensive platform designed to streamline every operation across your institution.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feat, i) => (
                            <div
                                key={i}
                                className="group bg-white dark:bg-slate-900 rounded-2xl p-7 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-300 hover:-translate-y-2 hover:scale-[1.01] relative overflow-hidden cursor-pointer"
                            >
                                {/* Top animated gradient accent line */}
                                <div className="absolute top-0 left-0 w-0 group-hover:w-full h-1 bg-gradient-to-r from-indigo-500 via-indigo-400 to-indigo-600 transition-all duration-500 ease-out" />
                                
                                <div className={`w-13 h-13 rounded-2xl flex items-center justify-center mb-5 border ${feat.bg} dark:bg-slate-800 dark:border-slate-700 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3 shadow-xs`}>
                                    {feat.icon}
                                </div>
                                <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center justify-between">
                                    <span>{feat.title}</span>
                                    <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300 text-indigo-600 dark:text-indigo-400" />
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                                    {feat.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Role-Based Access Cards */}
            <section className="py-24 px-4 bg-white dark:bg-slate-900 border-t border-slate-200/60 dark:border-slate-800 transition-colors duration-200">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-xs uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-100 dark:border-emerald-800/80 px-3.5 py-1.5 rounded-full inline-block mb-3 shadow-xs">
                            Tailored Experience
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight mb-4">
                            Built for Everyone
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 max-w-lg mx-auto text-base">
                            Dedicated views and permissions custom-tailored for each stakeholder.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {roleCards.map((card, i) => (
                            <div
                                key={i}
                                className={`group bg-white dark:bg-slate-950 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-2xl ${card.glowColor} ${card.borderColor} transition-all duration-300 hover:-translate-y-2 hover:scale-[1.015] flex flex-col cursor-pointer`}
                            >
                                {/* Header */}
                                <div className={`bg-gradient-to-br ${card.gradient} p-7 text-white relative overflow-hidden`}>
                                    {/* Watermark Icon background with hover spin/scale */}
                                    <div className="absolute -right-4 -bottom-4 opacity-15 transform rotate-12 scale-125 group-hover:scale-150 group-hover:opacity-25 group-hover:rotate-45 transition-all duration-500 ease-out">
                                        {card.icon}
                                    </div>
                                    <div className="flex items-center justify-between mb-3 relative z-10">
                                        <div className="p-2.5 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 shadow-sm">
                                            {card.icon}
                                        </div>
                                        <span className="text-xs font-semibold bg-white/20 backdrop-blur-md px-3 py-1 rounded-full uppercase tracking-wider text-white border border-white/25 group-hover:bg-white/30 transition-colors">
                                            {card.badge}
                                        </span>
                                    </div>
                                    <h3 className="text-2xl font-bold tracking-tight group-hover:translate-x-1 transition-transform duration-300 relative z-10">{card.role}</h3>
                                    <p className="text-white/80 text-xs font-medium mt-1 relative z-10">{card.subtitle}</p>
                                </div>

                                {/* Body */}
                                <div className="p-7 bg-white dark:bg-slate-950 flex-1 flex flex-col justify-between space-y-4 group-hover:bg-slate-50/60 dark:group-hover:bg-slate-900/60 transition-colors duration-300">
                                    <div className="space-y-2.5">
                                        {card.points.map((pt, j) => (
                                            <div
                                                key={j}
                                                className="flex items-start space-x-3 text-slate-700 dark:text-slate-300 text-sm leading-snug p-1.5 rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-colors duration-150"
                                            >
                                                <div className={`p-1 rounded-full ${card.checkBg} dark:bg-slate-800 dark:text-indigo-400 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform duration-200`}>
                                                    <Check size={13} strokeWidth={3} />
                                                </div>
                                                <span className="font-medium text-slate-700 dark:text-slate-300">{pt}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-indigo-600 py-16 px-4">
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">Ready to get started?</h2>
                    <p className="text-indigo-100 mb-8">Join your institution's digital management system today.</p>
                    <Link to="/signup" className="bg-white text-indigo-700 hover:bg-indigo-50 px-10 py-3.5 rounded-lg font-semibold inline-flex items-center space-x-2 transition-colors text-lg shadow-lg">
                        <span>Register Now</span>
                        <ArrowRight size={20} />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 py-8 px-4 transition-colors duration-200">
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between">
                    <div className="flex items-center space-x-2 mb-4 sm:mb-0">
                        <GraduationCap size={20} className="text-indigo-600 dark:text-indigo-400" />
                        <span className="text-slate-900 dark:text-white font-semibold">Smart SMS</span>
                    </div>
                    <p className="text-sm">© 2026 Smart Student Management System. Built with MERN Stack.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
