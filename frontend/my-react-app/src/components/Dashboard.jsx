import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, addDoc, serverTimestamp, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import {
    Calendar, CheckSquare, PlayCircle, Award, Clock, ArrowLeft, BookOpen,
    Sparkles, FileText, ArrowRight, ExternalLink, CheckCircle, Target,
    GraduationCap, BarChart3, Zap, Save, Loader2, X
} from 'lucide-react';

export default function Dashboard({ finalPlan, setStep, userId }) {
    const skillLevel = finalPlan?.skill_level || 'Beginner';
    const score = Number.isFinite(finalPlan?.score) ? finalPlan.score : 0;
    const roadmap = Array.isArray(finalPlan?.roadmap) ? finalPlan.roadmap : [];
    const topic = finalPlan?.topic || 'Selected Topic';
    const totalDays = finalPlan?.duration || roadmap.length || 0;

    const [selectedDayIndex, setSelectedDayIndex] = useState(0);
    const [completedTasks, setCompletedTasks] = useState({});
    const [showRoadmap, setShowRoadmap] = useState(false);
    const [activeTab, setActiveTab] = useState('roadmap');
    const [fullViewDayData, setFullViewDayData] = useState(null);

    // Save Roadmap modal state
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [saveName, setSaveName] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // ─── Load completed tasks from Firebase on mount ───
    useEffect(() => {
        if (!userId || !finalPlan) return;

        // Use roadmap id or topic as unique key for this roadmap's progress
        const roadmapKey = finalPlan?.id || topic.replace(/\s+/g, '_').toLowerCase();

        const loadProgress = async () => {
            try {
                const progressRef = doc(db, 'users', userId, 'progress', roadmapKey);
                const snap = await getDoc(progressRef);
                if (snap.exists()) {
                    setCompletedTasks(snap.data().completedTasks || {});
                }
            } catch (err) {
                console.error('Failed to load progress:', err);
            }
        };

        loadProgress();
    }, [userId, finalPlan, topic]);

    // ─── Save completed tasks to Firebase whenever they change ───
    useEffect(() => {
        if (!userId || !finalPlan || Object.keys(completedTasks).length === 0) return;

        const roadmapKey = finalPlan?.id || topic.replace(/\s+/g, '_').toLowerCase();

        const saveProgress = async () => {
            try {
                const progressRef = doc(db, 'users', userId, 'progress', roadmapKey);
                await setDoc(progressRef, {
                    completedTasks,
                    topic,
                    updatedAt: serverTimestamp()
                }, { merge: true });
            } catch (err) {
                console.error('Failed to save progress:', err);
            }
        };

        // Debounce - 800ms delay to avoid too many writes
        const timer = setTimeout(saveProgress, 800);
        return () => clearTimeout(timer);
    }, [completedTasks, userId, finalPlan, topic]);

    const handleSaveRoadmap = async () => {
        if (!saveName.trim() || !userId) return;
        setIsSaving(true);
        try {
            await addDoc(collection(db, 'users', userId, 'roadmaps'), {
                name: saveName.trim(),
                topic,
                plan: finalPlan,
                createdAt: serverTimestamp()
            });
            setSaveSuccess(true);
            setTimeout(() => {
                setShowSaveModal(false);
                setSaveSuccess(false);
                setSaveName('');
            }, 1200);
        } catch (err) {
            console.error('Failed to save roadmap:', err);
        } finally {
            setIsSaving(false);
        }
    };

    const currentDayData = roadmap?.[selectedDayIndex] || null;
    const embedDay = useMemo(() => (totalDays >= 3 ? totalDays - 2 : totalDays), [totalDays]);

    const toggleTask = (dayNumber, taskIndex) => {
        const key = `${dayNumber}-${taskIndex}`;
        setCompletedTasks(prev => ({ ...prev, [key]: !prev[key] }));
    };

    // ─── Helper: get completed task count for a given day ───
    const getDayCompletedCount = (day) => {
        const tasks = day.tasks || [];
        return tasks.filter((_, tIdx) => !!completedTasks[`${day.day}-${tIdx}`]).length;
    };

    // ─── Helper: total completed tasks across ALL days ───
    const totalCompletedTasks = useMemo(() => {
        return roadmap.reduce((sum, day) => sum + getDayCompletedCount(day), 0);
    }, [completedTasks, roadmap]);

    const totalTasks = useMemo(() => {
        return roadmap.reduce((sum, day) => sum + (day.tasks?.length || 0), 0);
    }, [roadmap]);

    const getEmbedUrl = (resource) => {
        const url = resource?.embed_url || resource?.url || '';
        if (!url) return null;
        if (url.includes('/embed/')) return url;
        const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
    };

    // ═══ NO PLAN FALLBACK ═══
    if (!finalPlan) {
        return (
            <main className="min-h-screen gradient-primary flex items-center justify-center p-6">
                <div className="perspective-3d">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="card-3d glass-light rounded-3xl p-10 max-w-md text-center"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-5 border border-orange-100">
                            <GraduationCap className="w-7 h-7 text-highlight-orange" />
                        </div>
                        <h3 className="text-xl font-extrabold text-highlight-dark mb-2">No Active Study Plan</h3>
                        <p className="text-muted text-sm mb-7">Complete the assessment quiz first to generate your custom dashboard.</p>
                        <button onClick={() => setStep(1)} className="btn-primary w-full">
                            <Zap size={16} /> Generate Plan
                        </button>
                    </motion.div>
                </div>
            </main>
        );
    }

    // ═══ ASSESSMENT SUMMARY (Before Roadmap) ═══
    if (!showRoadmap) {
        const summaryCards = [
            {
                icon: Award,
                label: 'Skill Level',
                value: skillLevel,
                color: 'from-orange-500 to-orange-600',
                shadowColor: 'rgba(255, 140, 0, 0.2)',
                bg: 'bg-orange-50',
                borderColor: 'border-orange-100'
            },
            {
                icon: BarChart3,
                label: 'Quiz Score',
                value: `${score}/10`,
                color: 'from-blue-500 to-blue-600',
                shadowColor: 'rgba(59, 130, 246, 0.2)',
                bg: 'bg-blue-50',
                borderColor: 'border-blue-100'
            },
            {
                icon: Calendar,
                label: 'Duration',
                value: `${totalDays} Days`,
                color: 'from-emerald-500 to-emerald-600',
                shadowColor: 'rgba(16, 185, 129, 0.2)',
                bg: 'bg-emerald-50',
                borderColor: 'border-emerald-100'
            },
        ];

        return (
            <main className="min-h-screen gradient-primary flex items-center justify-center p-6 relative overflow-hidden">
                <div className="floating-orb floating-orb-orange w-[500px] h-[500px] top-[5%] right-[10%]" />
                <div className="floating-orb floating-orb-blue w-[400px] h-[400px] bottom-[10%] left-[5%]" />

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-2xl relative z-10"
                >
                    <div className="glass-light rounded-3xl p-8 md:p-10 text-center relative overflow-hidden">
                        {/* Top accent */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--brand-orange)] to-transparent opacity-50" />

                        <div className="flex items-center gap-2 justify-center mb-5">
                            <Sparkles className="text-highlight-orange" size={20} />
                            <span className="text-highlight-orange font-bold tracking-widest text-xs uppercase">Assessment Complete</span>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-extrabold text-highlight-dark mb-3 tracking-tight">
                            Your Skill Level is <span className="gradient-text-orange">Ready</span>
                        </h1>
                        <p className="text-muted text-sm mb-8 max-w-md mx-auto">
                            We analyzed your 10 quiz answers and calculated your learning level. Click below to generate your personalized roadmap.
                        </p>

                        {/* 3D Metric Cards */}
                        <div className="perspective-3d">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                                {summaryCards.map((card, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 + i * 0.1 }}
                                        whileHover={{ rotateX: 5, rotateY: -5, translateY: -5 }}
                                        className={`p-4 rounded-2xl border ${card.borderColor} ${card.bg} transition-all duration-300 flex items-center gap-3`}
                                        style={{ transformStyle: 'preserve-3d', boxShadow: `0 8px 25px ${card.shadowColor}` }}
                                    >
                                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-md flex-shrink-0`}>
                                            <card.icon className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[10px] text-muted font-semibold uppercase tracking-wider">{card.label}</p>
                                            <p className="text-sm font-extrabold text-highlight-dark">{card.value}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setShowRoadmap(true)}
                                className="btn-primary flex-1"
                            >
                                <Rocket size={16} /> View My Roadmap
                            </motion.button>
                            <button
                                onClick={() => setStep(1)}
                                className="btn-secondary flex-1"
                            >
                                <ArrowLeft size={16} /> Start Over
                            </button>
                        </div>
                    </div>
                </motion.div>
            </main>
        );
    }

    const isRevisionDay = currentDayData ? currentDayData.day > embedDay : false;

    // ═══ FULL-VIEW / DEEP-DIVE PAGE ═══
    if (fullViewDayData) {
        const isFullRevisionDay = fullViewDayData.day > embedDay;
        return (
            <motion.main
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="min-h-screen gradient-primary p-4 md:p-8"
            >
                <div className="max-w-5xl mx-auto">
                    {/* Breadcrumb Back */}
                    <button
                        onClick={() => setFullViewDayData(null)}
                        className="btn-secondary text-xs px-4 py-2.5 mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                    </button>

                    {/* Page Header */}
                    <div className="glass-light rounded-2xl p-6 md:p-8 mb-8 relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--brand-orange)] to-transparent opacity-40" />
                        <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg inline-block mb-3 ${isFullRevisionDay ? 'badge-purple' : 'badge-orange'}`}>
                            Day {fullViewDayData.day} Full Study Module
                        </span>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-highlight-dark tracking-tight">
                            {(fullViewDayData.topics && fullViewDayData.topics.join(' • ')) || `Day ${fullViewDayData.day}`}
                        </h1>
                        <p className="text-muted mt-2 flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-gray-400" />
                            Estimated Study Time: <span className="font-bold text-highlight-dark">{fullViewDayData.estimated_time || 'N/A'}</span>
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Left: Tasks Checklist */}
                        <div className="md:col-span-1 space-y-3">
                            <h3 className="text-xs font-bold text-muted uppercase tracking-wider flex items-center gap-1.5 mb-1">
                                <CheckSquare className="w-4 h-4 text-blue-500" /> Tasks Checklist
                            </h3>
                            <div className="space-y-2">
                                {(fullViewDayData.tasks || []).map((task, tIdx) => {
                                    const isChecked = !!completedTasks[`${fullViewDayData.day}-${tIdx}`];
                                    return (
                                        <motion.div
                                            key={tIdx}
                                            whileHover={{ x: 3 }}
                                            onClick={() => toggleTask(fullViewDayData.day, tIdx)}
                                            className="p-3.5 rounded-xl border border-gray-100 bg-white hover:border-orange-200 hover:shadow-sm transition-all duration-200 flex items-start gap-3 cursor-pointer"
                                        >
                                            <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${isChecked
                                                ? 'bg-blue-500 border-blue-500 text-white'
                                                : 'border-gray-300'
                                                }`}>
                                                {isChecked && <CheckCircle size={12} />}
                                            </div>
                                            <span className="text-sm leading-relaxed text-gray-700 font-medium">
                                                {task}
                                            </span>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Right: Resources */}
                        <div className="md:col-span-2 space-y-5">
                            {!isFullRevisionDay && fullViewDayData.resources?.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-bold text-muted uppercase tracking-wider flex items-center gap-1.5 mb-3">
                                        <PlayCircle className="w-4 h-4 text-red-500" /> Video Resources
                                    </h3>
                                    <div className="space-y-4">
                                        {fullViewDayData.resources.map((resource, rIdx) => {
                                            const embedUrl = getEmbedUrl(resource);
                                            return (
                                                <div key={rIdx} className="rounded-xl border border-gray-100 bg-white/80 p-4 shadow-sm">
                                                    <h4 className="font-bold text-highlight-dark text-sm mb-1">{resource.title}</h4>
                                                    <p className="text-xs text-muted mb-3">{resource.summary}</p>
                                                    {embedUrl ? (
                                                        <div className="aspect-video w-full rounded-xl overflow-hidden border border-gray-200 bg-black shadow-inner">
                                                            <iframe className="w-full h-full" src={embedUrl} title={resource.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                                                        </div>
                                                    ) : (
                                                        <a href={resource.embed_url || resource.url} target="_blank" rel="noopener noreferrer" className="btn-primary text-xs inline-flex">
                                                            Open Resource <ExternalLink size={12} />
                                                        </a>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <div>
                                <h3 className="text-xs font-bold text-muted uppercase tracking-wider flex items-center gap-1.5 mb-3">
                                    <BookOpen className="w-4 h-4 text-highlight-orange" /> Core Concepts
                                </h3>
                                <ul className="space-y-2">
                                    {(fullViewDayData.topics || []).map((tp, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                            <CheckCircle size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                                            Deep-dive architecture of <span className="font-semibold text-highlight-dark">{tp}</span>
                                        </li>
                                    ))}
                                    <li className="flex items-start gap-2 text-sm text-gray-600">
                                        <CheckCircle size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                                        Implement practical hands-on patterns.
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.main>
        );
    }

    // ═══ MAIN DASHBOARD VIEW — TIMELINE ROADMAP ═══
    return (
        <main className="min-h-screen gradient-primary p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <button
                            onClick={() => setStep(1)}
                            className="flex items-center gap-2 text-xs font-semibold text-muted hover:text-highlight-orange transition-all duration-200 mb-2 group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Reset & Start New
                        </button>
                        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-1">
                            <span className="gradient-text">{topic}</span>
                            <span className="text-highlight-dark"> Learning Roadmap</span>
                        </h1>
                        <p className="text-muted text-sm flex items-center gap-1.5">
                            <Sparkles size={14} className="text-highlight-orange" />
                            Mastering <span className="font-semibold text-highlight-dark">{topic}</span> with AI guidance
                        </p>
                    </div>

                    {/* Metric Cards + Save Button */}
                    <div className="perspective-3d">
                        <div className="flex flex-wrap gap-2.5 items-center">
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => setShowSaveModal(true)}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition-all"
                                style={{ background: 'linear-gradient(135deg, #10B981, #059669)', boxShadow: '0 6px 20px rgba(16, 185, 129, 0.25)' }}
                            >
                                <Save size={14} /> Save Roadmap
                            </motion.button>

                            <motion.div
                                whileHover={{ rotateX: 4, rotateY: -4, translateY: -3 }}
                                className="flex items-center gap-2.5 px-4 py-2.5 glass-light rounded-xl"
                                style={{ transformStyle: 'preserve-3d' }}
                            >
                                <Award className="w-5 h-5 text-highlight-orange" />
                                <div>
                                    <p className="text-[10px] text-muted font-semibold uppercase tracking-wider">Level</p>
                                    <p className="text-xs font-extrabold text-highlight-dark">{skillLevel} ({score}/10)</p>
                                </div>
                            </motion.div>
                            <motion.div
                                whileHover={{ rotateX: 4, rotateY: -4, translateY: -3 }}
                                className="flex items-center gap-2.5 px-4 py-2.5 glass-light rounded-xl"
                                style={{ transformStyle: 'preserve-3d' }}
                            >
                                <Calendar className="w-5 h-5 text-blue-500" />
                                <div>
                                    <p className="text-[10px] text-muted font-semibold uppercase tracking-wider">Timeline</p>
                                    <p className="text-xs font-extrabold text-highlight-dark">{totalDays} Days</p>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* ─── SAVE ROADMAP MODAL ─── */}
                <AnimatePresence>
                    {showSaveModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4"
                            style={{ background: 'rgba(15, 23, 42, 0.35)', backdropFilter: 'blur(6px)' }}
                            onClick={() => !isSaving && setShowSaveModal(false)}
                        >
                            <motion.div
                                initial={{ opacity: 0, y: 20, scale: 0.96 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.96 }}
                                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                                onClick={(e) => e.stopPropagation()}
                                className="glass-light rounded-3xl p-7 md:p-8 w-full max-w-sm relative overflow-hidden"
                                style={{ background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(20px)' }}
                            >
                                <button
                                    onClick={() => !isSaving && setShowSaveModal(false)}
                                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X size={18} />
                                </button>

                                {saveSuccess ? (
                                    <div className="text-center py-6">
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-3 border border-emerald-100">
                                            <CheckCircle className="w-6 h-6 text-emerald-500" />
                                        </div>
                                        <p className="font-bold text-highlight-dark text-sm">Roadmap Saved!</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>
                                            <Save className="w-5 h-5 text-white" />
                                        </div>
                                        <h3 className="text-lg font-extrabold text-highlight-dark mb-1">Save This Roadmap</h3>
                                        <p className="text-xs text-muted mb-5">Give it a name so you can find it later in your history.</p>

                                        <input
                                            type="text"
                                            autoFocus
                                            value={saveName}
                                            onChange={(e) => setSaveName(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSaveRoadmap()}
                                            placeholder={`e.g. ${topic} Plan`}
                                            className="input-light mb-5"
                                        />

                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleSaveRoadmap}
                                            disabled={isSaving || !saveName.trim()}
                                            className="w-full py-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                                            style={{ background: 'linear-gradient(135deg, #10B981, #059669)', boxShadow: '0 6px 20px rgba(16, 185, 129, 0.25)' }}
                                        >
                                            {isSaving ? (
                                                <>
                                                    <Loader2 size={16} className="animate-spin" /> Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Save size={16} /> Save Roadmap
                                                </>
                                            )}
                                        </motion.button>
                                    </>
                                )}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Tab Navigation */}
                <div className="flex border-b border-gray-200/60 mb-6 gap-1">
                    {[
                        { id: 'roadmap', icon: Calendar, label: 'Roadmap Plan' },
                        { id: 'notes', icon: FileText, label: 'Study Notes' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm transition-all border-b-2 ${activeTab === tab.id
                                ? 'border-[var(--brand-orange)] text-highlight-orange'
                                : 'border-transparent text-muted hover:text-gray-700'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" /> {tab.label}
                        </button>
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* ─── LEFT: Timeline Day List ─── */}
                    <div className="lg:col-span-4 relative">
                        <div className="flex items-center justify-between px-1 mb-3">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Your Course Schedule</p>
                            {/* ── Overall progress pill ── */}
                            {totalTasks > 0 && (
                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" />
                                    {totalCompletedTasks}/{totalTasks} done
                                </span>
                            )}
                        </div>

                        {/* Timeline container */}
                        <div className="relative max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                            {/* Vertical timeline line */}
                            <div className="timeline-line" />

                            <div className="space-y-2 pl-2">
                                {roadmap.map((day, index) => {
                                    const isSelected = selectedDayIndex === index;
                                    const isDayRevision = day.day > embedDay;
                                    const dayTotal = day.tasks?.length || 0;
                                    const dayDone = getDayCompletedCount(day);
                                    const dayAllDone = dayTotal > 0 && dayDone === dayTotal;

                                    return (
                                        <motion.button
                                            key={index}
                                            whileHover={{ x: 4 }}
                                            onClick={() => setSelectedDayIndex(index)}
                                            className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 ${isSelected
                                                ? 'bg-orange-50/80 border border-orange-200/60 shadow-sm'
                                                : 'bg-white/60 border border-transparent hover:border-orange-100 hover:bg-white/80'
                                                }`}
                                        >
                                            {/* Timeline Node */}
                                            <div className={`timeline-node flex-shrink-0 ${dayAllDone
                                                ? 'timeline-node-done'
                                                : isSelected
                                                    ? 'timeline-node-active'
                                                    : isDayRevision
                                                        ? 'timeline-node-revision'
                                                        : 'timeline-node-default'
                                                }`}>
                                                {dayAllDone ? <CheckCircle size={12} /> : `D${day.day}`}
                                            </div>

                                            {/* Day Info */}
                                            <div className="min-w-0 flex-1">
                                                <h4 className={`text-sm font-semibold truncate ${isSelected ? 'text-highlight-dark' : 'text-gray-700'}`}>
                                                    {(day.topics && day.topics[0]) || `Day ${day.day}`}
                                                </h4>
                                                <p className="text-[11px] text-muted flex items-center gap-1 mt-0.5">
                                                    <Clock className="w-3 h-3" /> {day.estimated_time || 'Allocated hours'}
                                                </p>
                                            </div>

                                            {/* Right side: progress badge OR revision badge */}
                                            <div className="flex-shrink-0 flex flex-col items-end gap-1">
                                                {isDayRevision && (
                                                    <span className="badge-purple text-[9px] px-2 py-0.5">
                                                        Revision
                                                    </span>
                                                )}
                                                {dayTotal > 0 && (
                                                    <div className="flex items-center gap-1">
                                                        {/* Mini progress bar */}
                                                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                            <motion.div
                                                                className={`h-full rounded-full ${dayAllDone ? 'bg-emerald-500' : 'bg-orange-400'}`}
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${(dayDone / dayTotal) * 100}%` }}
                                                                transition={{ duration: 0.4 }}
                                                            />
                                                        </div>
                                                        <span className={`text-[10px] font-bold tabular-nums ${dayAllDone ? 'text-emerald-600' : 'text-gray-500'}`}>
                                                            {dayDone}/{dayTotal}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* ─── RIGHT: Dynamic Content Panel ─── */}
                    <div className="lg:col-span-8">
                        <AnimatePresence mode="wait">
                            {currentDayData && (
                                <motion.div
                                    key={`${selectedDayIndex}-${activeTab}`}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -15 }}
                                    transition={{ duration: 0.25 }}
                                    className="glass-light rounded-2xl p-6 relative overflow-hidden"
                                >
                                    {/* Top accent */}
                                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[var(--brand-orange)] to-transparent opacity-30" />

                                    {/* Info Header */}
                                    <div className="border-b border-gray-100 pb-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div>
                                            <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg inline-block mb-2 ${isRevisionDay ? 'badge-purple' : 'badge-orange'}`}>
                                                Day {currentDayData.day} {activeTab === 'notes' ? 'Notes' : 'Focus'}
                                            </span>
                                            <h2 className="text-xl font-extrabold text-highlight-dark tracking-tight">
                                                {(currentDayData.topics && currentDayData.topics.join(' • ')) || `Day ${currentDayData.day}`}
                                            </h2>
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.03 }}
                                            whileTap={{ scale: 0.97 }}
                                            onClick={() => setFullViewDayData(currentDayData)}
                                            className="btn-primary text-xs px-4 py-2.5 self-start sm:self-auto"
                                        >
                                            Deep-dive <ArrowRight size={14} />
                                        </motion.button>
                                    </div>

                                    {/* TAB: ROADMAP */}
                                    {activeTab === 'roadmap' && (
                                        <>
                                            {isRevisionDay ? (
                                                <div className="mb-6 bg-gradient-to-br from-purple-50/80 via-indigo-50/30 to-white border border-purple-100 rounded-xl p-5 relative overflow-hidden">
                                                    <div className="absolute right-4 top-4 text-purple-200/30 pointer-events-none">
                                                        <Sparkles className="w-20 h-20 stroke-[1.5]" />
                                                    </div>
                                                    <div className="flex gap-3 items-start relative z-10">
                                                        <div className="p-2.5 bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-xl shadow-md flex-shrink-0">
                                                            <Target className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-purple-900 text-sm">Revision & Practice Mode</h3>
                                                            <p className="text-purple-700/90 text-xs mt-1 max-w-xl leading-relaxed">
                                                                Core syllabus complete. Use these final days for mock challenges, review, and implementation practice.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : currentDayData.resources?.length > 0 ? (
                                                <div className="mb-6 space-y-3">
                                                    <div className="flex justify-between items-center">
                                                        <p className="text-[10px] font-bold text-muted uppercase tracking-widest flex items-center gap-1.5">
                                                            <PlayCircle className="w-3.5 h-3.5 text-red-500" /> Core Video Resources
                                                        </p>
                                                        <button
                                                            onClick={() => setActiveTab('notes')}
                                                            className="text-xs font-bold text-highlight-orange hover:underline flex items-center gap-1"
                                                        >
                                                            <FileText size={12} /> View Notes
                                                        </button>
                                                    </div>
                                                    <div className="grid gap-4">
                                                        {currentDayData.resources.map((resource, resourceIndex) => {
                                                            const embedUrl = getEmbedUrl(resource);
                                                            return (
                                                                <div key={resourceIndex} className="rounded-xl border border-gray-100 bg-white/80 p-4 shadow-sm hover:shadow-md transition-shadow">
                                                                    <h3 className="font-bold text-highlight-dark text-sm mb-1.5">{resource.title}</h3>
                                                                    <p className="text-xs text-muted mb-3 leading-relaxed">{resource.summary}</p>
                                                                    {embedUrl ? (
                                                                        <div className="aspect-video w-full rounded-xl overflow-hidden border border-gray-200 bg-black shadow-inner">
                                                                            <iframe
                                                                                className="w-full h-full"
                                                                                src={embedUrl}
                                                                                title={resource.title}
                                                                                frameBorder="0"
                                                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                                allowFullScreen
                                                                            />
                                                                        </div>
                                                                    ) : (
                                                                        <a
                                                                            href={resource.embed_url || resource.url}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="btn-primary text-xs inline-flex"
                                                                        >
                                                                            Open Resource <ExternalLink size={12} />
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ) : null}

                                            {/* Task Checklist */}
                                            <div>
                                                <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                                    <CheckSquare className="w-3.5 h-3.5 text-blue-500" /> Actionable Objectives
                                                </p>
                                                <div className="space-y-2">
                                                    {(currentDayData.tasks || []).map((task, tIdx) => {
                                                        const isChecked = !!completedTasks[`${currentDayData.day}-${tIdx}`];
                                                        return (
                                                            <motion.div
                                                                key={tIdx}
                                                                whileHover={{ x: 3 }}
                                                                onClick={() => toggleTask(currentDayData.day, tIdx)}
                                                                className="p-3.5 rounded-xl border border-gray-100 bg-white/60 hover:border-orange-200 hover:shadow-sm transition-all duration-200 flex items-start gap-3 cursor-pointer"
                                                            >
                                                                <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${isChecked
                                                                    ? 'bg-blue-500 border-blue-500 text-white'
                                                                    : 'border-gray-300'
                                                                    }`}>
                                                                    {isChecked && <CheckCircle size={12} />}
                                                                </div>
                                                                <span className="text-sm leading-relaxed text-gray-700 font-medium">
                                                                    {task}
                                                                </span>
                                                            </motion.div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* TAB: NOTES */}
                                    {activeTab === 'notes' && (
                                        <div className="space-y-5">
                                            <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-4 flex gap-3">
                                                <BookOpen className="text-highlight-orange w-5 h-5 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <h4 className="font-bold text-highlight-dark text-sm">Comprehensive Briefing</h4>
                                                    <p className="text-xs text-muted mt-1 leading-relaxed">
                                                        Review core concepts and documentations compiled for Day {currentDayData.day}.
                                                    </p>
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="text-base font-bold text-highlight-dark mb-3">Topic Summary & Key Notes</h3>
                                                {currentDayData.resources?.length > 0 ? (
                                                    currentDayData.resources.map((res, rIdx) => (
                                                        <div key={rIdx} className="mb-3 bg-white/60 p-4 rounded-xl border border-gray-100">
                                                            <h5 className="font-semibold text-sm text-highlight-dark mb-1">{res.title}</h5>
                                                            <p className="text-sm text-muted leading-relaxed">{res.summary || 'No extended notes available.'}</p>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-sm text-muted italic">No resource notes for this revision day. Focus on objectives!</p>
                                                )}

                                                <div className="mt-5 border-t border-gray-100 pt-4">
                                                    <h4 className="text-xs font-bold text-highlight-dark mb-3 uppercase tracking-wider">Core Concepts</h4>
                                                    <ul className="space-y-2">
                                                        {(currentDayData.topics || []).map((tp, i) => (
                                                            <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                                                <CheckCircle size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                                                                Deep-dive architecture of <span className="font-semibold text-highlight-dark">{tp}</span>
                                                            </li>
                                                        ))}
                                                        <li className="flex items-start gap-2 text-sm text-gray-600">
                                                            <CheckCircle size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                                                            Implement practical hands-on patterns.
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => setActiveTab('roadmap')}
                                                className="btn-secondary text-xs"
                                            >
                                                <ArrowLeft size={14} /> Back to Checklist
                                            </button>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </main>
    );
}

// Helper component used by the summary page button
function Rocket({ size = 16, ...props }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
            <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
            <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
            <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
        </svg>
    );
}