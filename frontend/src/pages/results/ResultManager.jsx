import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { BookOpen, Users, Award, CheckCircle, XCircle, Save, RefreshCw } from 'lucide-react';

// Grade calculation helper
const getGrade = (pct) => {
    if (pct >= 90) return { grade: 'A+', pass: true, color: 'text-emerald-700 bg-emerald-100 border-emerald-200' };
    if (pct >= 80) return { grade: 'A',  pass: true, color: 'text-green-700 bg-green-100 border-green-200' };
    if (pct >= 70) return { grade: 'B',  pass: true, color: 'text-blue-700 bg-blue-100 border-blue-200' };
    if (pct >= 60) return { grade: 'C',  pass: true, color: 'text-indigo-700 bg-indigo-100 border-indigo-200' };
    if (pct >= 50) return { grade: 'D',  pass: true, color: 'text-amber-700 bg-amber-100 border-amber-200' };
    return { grade: 'F', pass: false, color: 'text-red-700 bg-red-100 border-red-200' };
};

const GradeTable = () => (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <p className="text-xs font-bold text-slate-600 mb-2">📊 Grade Scale</p>
        <div className="grid grid-cols-3 gap-1.5 text-xs">
            {[
                { range: '90–100', grade: 'A+', cls: 'text-emerald-700 bg-emerald-50' },
                { range: '80–89',  grade: 'A',  cls: 'text-green-700 bg-green-50' },
                { range: '70–79',  grade: 'B',  cls: 'text-blue-700 bg-blue-50' },
                { range: '60–69',  grade: 'C',  cls: 'text-indigo-700 bg-indigo-50' },
                { range: '50–59',  grade: 'D',  cls: 'text-amber-700 bg-amber-50' },
                { range: 'Below 50', grade: 'F / Fail', cls: 'text-red-700 bg-red-50' },
            ].map(item => (
                <div key={item.grade} className={`flex items-center justify-between px-2 py-1 rounded-lg font-semibold ${item.cls}`}>
                    <span className="opacity-70">{item.range}%</span>
                    <span>{item.grade}</span>
                </div>
            ))}
        </div>
    </div>
);

const ResultManager = () => {
    const { user } = useContext(AuthContext);

    const [courses, setCourses] = useState([]);
    const [allSubjects, setAllSubjects] = useState([]);
    const [allStudents, setAllStudents] = useState([]);

    const [courseId, setCourseId] = useState('');
    const [semester, setSemester] = useState('');
    const [examType, setExamType] = useState('Final');

    // students for selected course+semester
    const [students, setStudents] = useState([]);
    // selected student
    const [selectedStudentId, setSelectedStudentId] = useState('');
    // subjects for selected course
    const [subjects, setSubjects] = useState([]);

    // marks[subjectId] = { obtained: '', total: 100, resultId: null }
    const [marks, setMarks] = useState({});

    const [fetching, setFetching] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // load dropdown data on mount
    useEffect(() => {
        Promise.all([
            api.get('/courses'),
            api.get('/subjects'),
            api.get('/students'),
        ]).then(([c, s, st]) => {
            setCourses(c.data);
            setAllSubjects(s.data);
            setAllStudents(st.data);
        }).catch(console.error);
    }, []);

    // when course changes — filter students + subjects
    useEffect(() => {
        if (courseId && semester) {
            const filtered = allStudents.filter(
                s => (s.course?._id || s.course) === courseId && s.semester === semester
            );
            setStudents(filtered);
        } else {
            setStudents([]);
        }
        setSelectedStudentId('');
        setMarks({});
        setError('');
        setSuccess('');
    }, [courseId, semester, allStudents]);

    useEffect(() => {
        if (courseId && semester) {
            const subs = allSubjects.filter(
                sub => (sub.course?._id || sub.course) === courseId && sub.semester === semester
            );
            setSubjects(subs);
        } else {
            setSubjects([]);
        }
    }, [courseId, semester, allSubjects]);

    // load existing results when student is selected
    const loadStudentResults = async (studId) => {
        if (!studId || !courseId || !semester) return;
        setFetching(true);
        setError('');
        setSuccess('');
        try {
            const { data } = await api.get(
                `/results?student=${studId}&course=${courseId}&semester=${semester}&examType=${examType}`
            );
            // Build marks map keyed by subjectId
            const existingMap = {};
            data.forEach(r => {
                existingMap[r.subject?._id || r.subject] = {
                    obtained: r.marksObtained,
                    total: r.totalMarks,
                    resultId: r._id,
                };
            });
            // Init marks for all subjects
            const init = {};
            subjects.forEach(sub => {
                init[sub._id] = existingMap[sub._id] || { obtained: '', total: 100, resultId: null };
            });
            setMarks(init);
        } catch (err) {
            setError('Failed to load existing results.');
        } finally {
            setFetching(false);
        }
    };

    const handleStudentChange = (e) => {
        const id = e.target.value;
        setSelectedStudentId(id);
        setMarks({});
        if (id) loadStudentResults(id);
    };

    const handleMarkChange = (subId, field, value) => {
        setMarks(prev => ({
            ...prev,
            [subId]: { ...prev[subId], [field]: value }
        }));
    };

    // ── Submit all subject marks ──────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedStudentId || subjects.length === 0) return;
        setSaving(true);
        setError('');
        setSuccess('');
        let hasError = false;

        for (const sub of subjects) {
            const m = marks[sub._id];
            if (!m || m.obtained === '') continue; // skip blanks

            const payload = {
                student: selectedStudentId,
                course: courseId,
                semester,
                subject: sub._id,
                examType,
                marksObtained: Number(m.obtained),
                totalMarks: Number(m.total) || 100,
            };
            try {
                if (m.resultId) {
                    await api.put(`/results/${m.resultId}`, payload);
                } else {
                    const res = await api.post('/results', payload);
                    setMarks(prev => ({
                        ...prev,
                        [sub._id]: { ...prev[sub._id], resultId: res.data._id }
                    }));
                }
            } catch {
                hasError = true;
            }
        }

        setSaving(false);
        if (hasError) setError('Some results failed to save. Others may have been saved.');
        else setSuccess('✅ All marks saved successfully!');
    };

    // ── Derived totals for summary bar ───────────────────────────
    const enteredRows = subjects.filter(sub => {
        const m = marks[sub._id];
        return m && m.obtained !== '' && !isNaN(Number(m.obtained));
    });

    const totalObtained = enteredRows.reduce((acc, sub) => acc + Number(marks[sub._id].obtained), 0);
    const totalMax      = enteredRows.reduce((acc, sub) => acc + (Number(marks[sub._id].total) || 100), 0);
    const overallPct    = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : null;
    const overallGrade  = overallPct !== null ? getGrade(overallPct) : null;

    const selectedStudent = students.find(s => s._id === selectedStudentId);
    const courseName = courses.find(c => c._id === courseId)?.name || '';

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Award className="text-indigo-600" size={26} />
                    Manage Results / Marks Entry
                </h1>
                <p className="text-slate-500 text-sm mt-0.5">
                    Select course, semester and student — enter marks subject-wise with automatic grade calculation
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Filter + Grade Table */}
                <div className="lg:col-span-1 space-y-4">
                    {/* Step 1 — Select class */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
                        <h2 className="text-sm font-bold text-slate-700">Step 1 — Select Class</h2>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Course Program *</label>
                            <select
                                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={courseId}
                                onChange={e => { setCourseId(e.target.value); setSelectedStudentId(''); setMarks({}); }}
                            >
                                <option value="">Select Course...</option>
                                {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Semester *</label>
                            <select
                                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={semester}
                                onChange={e => setSemester(e.target.value)}
                            >
                                <option value="">Select Semester...</option>
                                {[1,2,3,4,5,6,7,8].map(s => (
                                    <option key={s} value={`Semester ${s}`}>Semester {s}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Exam Type *</label>
                            <select
                                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={examType}
                                onChange={e => { setExamType(e.target.value); setMarks({}); setSelectedStudentId(''); }}
                            >
                                <option value="Final">Final Exam</option>
                                <option value="Midterm">Midterm Exam</option>
                                <option value="Assignment">Assignment</option>
                                <option value="Quiz">Quiz</option>
                            </select>
                        </div>
                    </div>

                    {/* Step 2 — Select Student */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
                        <h2 className="text-sm font-bold text-slate-700">Step 2 — Select Student</h2>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Student *</label>
                            <select
                                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={selectedStudentId}
                                onChange={handleStudentChange}
                                disabled={!courseId || !semester}
                            >
                                <option value="">
                                    {!courseId || !semester ? 'Select course & semester first' : `Select Student (${students.length} enrolled)...`}
                                </option>
                                {students.map(s => (
                                    <option key={s._id} value={s._id}>{s.fullName} — {s.rollNumber}</option>
                                ))}
                            </select>
                        </div>

                        {selectedStudent && (
                            <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold text-sm flex items-center justify-center flex-shrink-0">
                                    {selectedStudent.fullName?.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800 text-sm">{selectedStudent.fullName}</p>
                                    <p className="text-xs text-slate-500">{selectedStudent.rollNumber} • {courseName} • {semester}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Grade Scale Reference */}
                    <GradeTable />
                </div>

                {/* Right: Marks Entry Form */}
                <div className="lg:col-span-2">
                    {!selectedStudentId && (
                        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-16 text-center text-slate-400">
                            <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
                            <p className="font-semibold text-slate-500">Select a student to enter marks</p>
                            <p className="text-sm mt-1">All subjects for the selected course will appear here</p>
                        </div>
                    )}

                    {fetching && (
                        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
                            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                            <p className="text-slate-500 text-sm">Loading existing results...</p>
                        </div>
                    )}

                    {selectedStudentId && !fetching && (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Alerts */}
                            {error && (
                                <div className="p-3.5 bg-red-50 text-red-700 rounded-xl border border-red-200 text-sm font-medium">⚠️ {error}</div>
                            )}
                            {success && (
                                <div className="p-3.5 bg-green-50 text-green-700 rounded-xl border border-green-200 text-sm font-medium">{success}</div>
                            )}

                            {/* Step 3 — Marks entry table */}
                            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                                <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-sm font-bold text-slate-700">Step 3 — Enter Marks Subject-wise</h2>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            {subjects.length} subjects • {examType} Exam • {semester}
                                        </p>
                                    </div>
                                    {enteredRows.some(sub => marks[sub._id]?.resultId) && (
                                        <span className="px-2.5 py-1 bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold rounded-full">
                                            ✏️ Editing Existing Marks
                                        </span>
                                    )}
                                </div>

                                {subjects.length === 0 ? (
                                    <div className="p-12 text-center text-slate-400">
                                        <BookOpen size={32} className="mx-auto mb-2 opacity-30" />
                                        <p className="text-sm">No subjects found for this course. Add subjects in Subject Management first.</p>
                                    </div>
                                ) : (
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                                                <th className="p-4">#</th>
                                                <th className="p-4">Subject</th>
                                                <th className="p-4 w-32 text-center">Out of</th>
                                                <th className="p-4 w-32 text-center">Marks</th>
                                                <th className="p-4 w-16 text-center">%</th>
                                                <th className="p-4 w-20 text-center">Grade</th>
                                                <th className="p-4 w-20 text-center">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {subjects.map((sub, idx) => {
                                                const m = marks[sub._id] || { obtained: '', total: 100, resultId: null };
                                                const obtained = Number(m.obtained);
                                                const total = Number(m.total) || 100;
                                                const pct = m.obtained !== '' && !isNaN(obtained)
                                                    ? Math.round((obtained / total) * 100)
                                                    : null;
                                                const gradeInfo = pct !== null ? getGrade(pct) : null;
                                                const isOver = obtained > total;

                                                return (
                                                    <tr key={sub._id} className={`transition-colors ${
                                                        gradeInfo?.pass === false ? 'bg-red-50/30' :
                                                        gradeInfo?.pass === true ? 'bg-green-50/20' : ''
                                                    }`}>
                                                        <td className="p-4 text-slate-400 text-sm font-medium">{idx + 1}</td>
                                                        <td className="p-4">
                                                            <p className="font-semibold text-slate-800 text-sm">{sub.name}</p>
                                                            <p className="text-xs text-slate-400">{sub.code}</p>
                                                        </td>
                                                        <td className="p-4 text-center">
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                className="w-20 text-center px-2 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-slate-50"
                                                                value={m.total}
                                                                onChange={e => handleMarkChange(sub._id, 'total', e.target.value)}
                                                            />
                                                        </td>
                                                        <td className="p-4 text-center">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max={m.total}
                                                                placeholder="—"
                                                                className={`w-20 text-center px-2 py-1.5 border rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                                                                    isOver ? 'border-red-400 bg-red-50 text-red-700' :
                                                                    m.obtained !== '' ? 'border-indigo-300 bg-indigo-50/50 text-indigo-700' :
                                                                    'border-slate-200 bg-white text-slate-700'
                                                                }`}
                                                                value={m.obtained}
                                                                onChange={e => handleMarkChange(sub._id, 'obtained', e.target.value)}
                                                            />
                                                            {isOver && <p className="text-[10px] text-red-500 mt-0.5">Exceeds max</p>}
                                                        </td>
                                                        <td className="p-4 text-center text-sm font-bold text-slate-700">
                                                            {pct !== null ? `${pct}%` : '—'}
                                                        </td>
                                                        <td className="p-4 text-center">
                                                            {gradeInfo ? (
                                                                <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold border ${gradeInfo.color}`}>
                                                                    {gradeInfo.grade}
                                                                </span>
                                                            ) : (
                                                                <span className="text-slate-300 text-xs">—</span>
                                                            )}
                                                        </td>
                                                        <td className="p-4 text-center">
                                                            {gradeInfo ? (
                                                                gradeInfo.pass ? (
                                                                    <span className="flex items-center justify-center gap-1 text-green-600 text-xs font-bold">
                                                                        <CheckCircle size={14}/> Pass
                                                                    </span>
                                                                ) : (
                                                                    <span className="flex items-center justify-center gap-1 text-red-600 text-xs font-bold">
                                                                        <XCircle size={14}/> Fail
                                                                    </span>
                                                                )
                                                            ) : (
                                                                <span className="text-slate-300 text-xs">—</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                )}

                                {/* Summary Footer */}
                                {enteredRows.length > 0 && (
                                    <div className={`p-4 border-t flex items-center justify-between flex-wrap gap-3 ${
                                        overallGrade?.pass ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'
                                    }`}>
                                        <div className="flex items-center gap-4 text-sm">
                                            <span className="text-slate-600 font-medium">
                                                Total: <strong>{totalObtained}/{totalMax}</strong>
                                            </span>
                                            <span className="text-slate-600 font-medium">
                                                Overall: <strong>{overallPct}%</strong>
                                            </span>
                                            {overallGrade && (
                                                <>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${overallGrade.color}`}>
                                                        Grade {overallGrade.grade}
                                                    </span>
                                                    <span className={`flex items-center gap-1 font-bold text-xs ${overallGrade.pass ? 'text-green-700' : 'text-red-700'}`}>
                                                        {overallGrade.pass ? <><CheckCircle size={14}/> PASS</> : <><XCircle size={14}/> FAIL</>}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={saving || subjects.length === 0}
                                            className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl hover:bg-emerald-700 font-bold text-sm disabled:opacity-50 transition-colors flex items-center gap-2 shadow-sm"
                                        >
                                            {saving
                                                ? <><RefreshCw size={16} className="animate-spin"/> Saving...</>
                                                : <><Save size={16}/> Save All Marks</>
                                            }
                                        </button>
                                    </div>
                                )}

                                {enteredRows.length === 0 && subjects.length > 0 && (
                                    <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50">
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl hover:bg-emerald-700 font-bold text-sm disabled:opacity-50 transition-colors flex items-center gap-2"
                                        >
                                            <Save size={16}/> Save All Marks
                                        </button>
                                    </div>
                                )}
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResultManager;
