import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Bell, Plus, Trash2, Megaphone, Calendar, Tag, X } from 'lucide-react';

const NoticeBoard = () => {
    const { user } = useContext(AuthContext);
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('General');
    const [content, setContent] = useState('');
    const [posting, setPosting] = useState(false);

    const canPost = user?.role === 'admin' || user?.role === 'teacher';

    useEffect(() => {
        fetchNotices();
    }, []);

    const fetchNotices = async () => {
        try {
            const { data } = await api.get('/notices');
            setNotices(data);
        } catch (err) {
            console.error('Error fetching notices', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setPosting(true);
        try {
            const { data } = await api.post('/notices', { title, category, content });
            setNotices([data, ...notices]);
            setTitle('');
            setCategory('General');
            setContent('');
            setShowModal(false);
        } catch (err) {
            console.error('Error posting notice', err);
        } finally {
            setPosting(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this notice announcement?')) {
            try {
                await api.delete(`/notices/${id}`);
                setNotices(notices.filter(n => n._id !== id));
            } catch (err) {
                console.error('Error deleting notice', err);
            }
        }
    };

    const getBadgeClass = (cat) => {
        switch (cat) {
            case 'Exam': return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'Academic': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
            case 'Event': return 'bg-purple-100 text-purple-800 border-purple-200';
            default: return 'bg-emerald-100 text-emerald-800 border-emerald-200';
        }
    };

    return (
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                        <Bell size={20} />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-slate-800">Campus Notice Board</h2>
                        <p className="text-xs text-slate-400">Important announcements & academic updates</p>
                    </div>
                </div>

                {canPost && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-2xs"
                    >
                        <Plus size={15} />
                        <span>Post Notice</span>
                    </button>
                )}
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[1, 2].map(i => (
                        <div key={i} className="h-16 bg-slate-50 rounded-xl animate-pulse"></div>
                    ))}
                </div>
            ) : notices.length === 0 ? (
                <div className="p-8 text-center bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
                    <Megaphone size={32} className="mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-semibold text-slate-600">No Announcements Posted</p>
                    <p className="text-xs text-slate-400 mt-0.5">Check back later for campus notices</p>
                </div>
            ) : (
                <div className="space-y-3.5 max-h-80 overflow-y-auto pr-1">
                    {notices.map(notice => (
                        <div key={notice._id} className="p-4 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-white transition-all">
                            <div className="flex items-start justify-between gap-3 mb-1.5">
                                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getBadgeClass(notice.category)}`}>
                                        {notice.category}
                                    </span>
                                    <h3 className="font-bold text-slate-800 text-sm">{notice.title}</h3>
                                </div>
                                {canPost && (
                                    <button onClick={() => handleDelete(notice._id)} className="text-slate-400 hover:text-red-500 p-1 transition-colors" title="Delete notice">
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed mb-2.5">{notice.content}</p>
                            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100/80">
                                <span className="flex items-center gap-1 font-medium text-slate-500">
                                    <span>Posted by:</span> <strong className="text-slate-700 font-semibold">{notice.postedBy?.name || 'Staff'}</strong>
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar size={12} />
                                    {new Date(notice.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Post Notice Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-slate-100 relative">
                        <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                            <X size={20} />
                        </button>
                        
                        <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Megaphone size={18} className="text-indigo-600" />
                            Post Campus Announcement
                        </h3>

                        <form onSubmit={handleCreate} className="space-y-4 text-sm">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Notice Title *</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Midterm Examination Schedule"
                                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                                <select
                                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                                    value={category}
                                    onChange={e => setCategory(e.target.value)}
                                >
                                    <option value="General">General</option>
                                    <option value="Academic">Academic</option>
                                    <option value="Exam">Exam</option>
                                    <option value="Event">Event</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Announcement Details *</label>
                                <textarea
                                    required
                                    rows="4"
                                    placeholder="Enter full notice description..."
                                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                                    value={content}
                                    onChange={e => setContent(e.target.value)}
                                />
                            </div>

                            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl">
                                    Cancel
                                </button>
                                <button type="submit" disabled={posting} className="px-4 py-2 text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl disabled:opacity-50">
                                    {posting ? 'Posting...' : 'Publish Notice'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NoticeBoard;
