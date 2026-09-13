import React from 'react';
import { Link } from 'react-router-dom';
import {
    GraduationCap, Users, ClipboardList, Award,
    BookOpen, UserCog, ArrowRight, CheckCircle, Shield, Zap
} from 'lucide-react';
import PublicNavbar from '../components/PublicNavbar';

const features = [
    {
        icon: <Users size={24} className="text-indigo-600" />,
        title: 'Student Management',
        desc: 'Manage student records, enrollment, personal details, and academic history all in one place.'
    },
    {
        icon: <UserCog size={24} className="text-emerald-600" />,
        title: 'Teacher Management',
        desc: 'Organize faculty profiles, assign subjects, and maintain comprehensive staff records.'
    },
    {
        icon: <ClipboardList size={24} className="text-amber-600" />,
        title: 'Attendance Tracking',
        desc: 'Mark and monitor daily attendance for each class. Get instant absence summaries.'
    },
    {
        icon: <Award size={24} className="text-rose-600" />,
        title: 'Exam Results',
        desc: 'Enter and view exam results per subject. Generate digital report cards instantly.'
    },
    {
        icon: <BookOpen size={24} className="text-violet-600" />,
        title: 'Course & Subjects',
        desc: 'Organize courses and map subjects to them. Keep academics structured and clear.'
    },
    {
        icon: <Shield size={24} className="text-cyan-600" />,
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

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-white flex flex-col">
            <PublicNavbar />

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-900 text-white py-24 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center space-x-2 bg-indigo-700/50 text-indigo-200 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-indigo-600">
                        <Zap size={14} />
                        <span>Fully Digital · Real-time · MongoDB Powered</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
                        The Smart Way to Manage
                        <span className="text-indigo-300 block mt-1">Your Institution</span>
                    </h1>
                    <p className="text-lg sm:text-xl text-indigo-200 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Replace paper registers and Excel sheets with a powerful, centralized platform
                        for students, teachers, attendance, results, and more.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/signup" className="bg-white text-indigo-700 hover:bg-indigo-50 px-8 py-3.5 rounded-lg font-semibold flex items-center space-x-2 transition-colors shadow-lg text-lg">
                            <span>Get Started Free</span>
                            <ArrowRight size={20} />
                        </Link>
                        <Link to="/login" className="border border-indigo-400 text-indigo-100 hover:bg-indigo-700/50 px-8 py-3.5 rounded-lg font-semibold transition-colors text-lg">
                            Sign In
                        </Link>
                    </div>
                </div>
            </section>

            {/* Stats Bar */}
            <section className="bg-indigo-950 py-8 px-4">
                <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
                    {stats.map((stat, i) => (
                        <div key={i} className="text-center">
                            <p className="text-3xl font-bold text-white">{stat.value}</p>
                            <p className="text-indigo-300 text-sm mt-1">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features */}
            <section className="py-20 px-4 bg-slate-50">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl font-bold text-slate-800 mb-4">Everything You Need</h2>
                        <p className="text-slate-500 max-w-xl mx-auto">
                            One powerful platform that handles every aspect of institutional management.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feat, i) => (
                            <div key={i} className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="bg-slate-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                                    {feat.icon}
                                </div>
                                <h3 className="font-semibold text-slate-800 text-lg mb-2">{feat.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">{feat.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Who is it for */}
            <section className="py-20 px-4 bg-white">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl font-bold text-slate-800 mb-4">Built for Everyone</h2>
                        <p className="text-slate-500">Different roles, seamless experience for all.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                role: 'Admin',
                                color: 'bg-indigo-600',
                                points: ['Full system access', 'Manage all users', 'View all reports', 'Configure courses & subjects']
                            },
                            {
                                role: 'Teacher',
                                color: 'bg-emerald-600',
                                points: ['Mark attendance', 'Enter exam results', 'View class list', 'Manage assigned subjects']
                            },
                            {
                                role: 'Student',
                                color: 'bg-amber-500',
                                points: ['View own profile', 'Check attendance', 'View results', 'Access course info']
                            }
                        ].map((card, i) => (
                            <div key={i} className="rounded-xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                <div className={`${card.color} py-5 px-6`}>
                                    <h3 className="text-white font-bold text-xl">{card.role}</h3>
                                </div>
                                <div className="p-6 bg-white space-y-3">
                                    {card.points.map((pt, j) => (
                                        <div key={j} className="flex items-center space-x-2 text-slate-600 text-sm">
                                            <CheckCircle size={15} className="text-green-500 flex-shrink-0" />
                                            <span>{pt}</span>
                                        </div>
                                    ))}
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
            <footer className="bg-slate-900 text-slate-400 py-8 px-4">
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between">
                    <div className="flex items-center space-x-2 mb-4 sm:mb-0">
                        <GraduationCap size={20} className="text-indigo-400" />
                        <span className="text-white font-semibold">Smart SMS</span>
                    </div>
                    <p className="text-sm">© 2026 Smart Student Management System. Built with MERN Stack.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
