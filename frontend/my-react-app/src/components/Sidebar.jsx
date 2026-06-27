import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { signOut } from 'firebase/auth';
import { collection, query, orderBy, onSnapshot, doc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import {
    Sparkles, LogIn, LogOut, FolderClock, User as UserIcon,
    ChevronRight, ChevronDown, Inbox, CheckCircle
} from 'lucide-react';

export default function Sidebar({ user, onLoginClick, onSelectRoadmap }) {
    const [roadmaps, setRoadmaps] = useState([]);
    const [isHistoryOpen, setIsHistoryOpen] = useState(true);
    const [progressMap, setProgressMap] = useState({});

    // ── Live roadmap list from Firestore ──
    useEffect(() => {
        if (!user) return;

        const roadmapsRef = collection(db, 'users', user.uid, 'roadmaps');
        const q = query(roadmapsRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
            setRoadmaps(items);
        }, (err) => {
            console.error('Failed to load roadmap history:', err);
        });

        return () => unsubscribe();
    }, [user]);

    // ── Reset when user logs out ──
    useEffect(() => {
        if (!user) {
            setRoadmaps([]);
            setProgressMap({});
        }
    }, [user]);

    // ── Real-time progress listeners — one per roadmap ──
    useEffect(() => {
        if (!user || roadmaps.length === 0) return;

        const unsubscribes = roadmaps.map((rm) => {
            const roadmapKey = rm.plan?.id || (rm.topic || '').replace(/\s+/g, '_').toLowerCase();
            if (!roadmapKey) return null;

            const progressRef = doc(db, 'users', user.uid, 'progress', roadmapKey);

            return onSnapshot(progressRef, (snap) => {
                const completedTasks = snap.exists() ? (snap.data().completedTasks || {}) : {};
                const roadmapDays = rm.plan?.roadmap || [];

                let total = 0;
                let done = 0;
                roadmapDays.forEach((day) => {
                    const dayTasks = day.tasks || [];
                    total += dayTasks.length;
                    dayTasks.forEach((_, tIdx) => {
                        if (completedTasks[`${day.day}-${tIdx}`]) done++;
                    });
                });

                // Update only this roadmap — keep others intact
                setProgressMap((prev) => ({
                    ...prev,
                    [rm.id]: { done, total },
                }));
            }, (err) => {
                console.error(`Progress listener error for ${roadmapKey}:`, err);
            });
        });

        return () => {
            unsubscribes.forEach((unsub) => unsub && unsub());
        };
    }, [user, roadmaps]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (err) {
            console.error('Logout failed:', err);
        }
    };

    return (
        <aside className="w-64 h-screen sticky top-0 flex flex-col glass-light border-r border-gray-100/80 flex-shrink-0">

            {/* Logo */}
            <div className="flex items-center gap-2.5 p-5 border-b border-gray-100/80">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--brand-orange)] to-[#FF6B00] flex items-center justify-center shadow-md">
                    <Sparkles className="text-white w-5 h-5" />
                </div>
                <span className="font-extrabold text-highlight-dark text-sm tracking-tight">LearnPath AI</span>
            </div>

            {/* Roadmap History Container */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">

                {/* Header Button to Toggle Accordion */}
                <button
                    onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                    className="w-full flex items-center justify-between mb-3 px-1 py-1 rounded-lg hover:bg-gray-50/80 transition-colors group text-left"
                >
                    <div className="flex items-center gap-1.5">
                        <FolderClock size={14} className="text-highlight-orange" />
                        <span className="text-xs font-bold text-highlight-dark uppercase tracking-wider">Roadmap History</span>
                    </div>
                    <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
                        {isHistoryOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </div>
                </button>

                {/* Animated Roadmap List Area */}
                <div className="overflow-hidden">
                    <AnimatePresence initial={false}>
                        {isHistoryOpen && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2, ease: 'easeInOut' }}
                                className="space-y-1.5"
                            >
                                {!user && (
                                    <p className="text-xs text-muted px-1 py-2">Login to see your saved roadmaps.</p>
                                )}

                                {user && roadmaps.length === 0 && (
                                    <div className="flex flex-col items-center gap-2 text-center py-8 px-2">
                                        <Inbox size={22} className="text-gray-300" />
                                        <p className="text-xs text-muted">No saved roadmaps yet.</p>
                                    </div>
                                )}

                                {user && roadmaps.map((rm) => {
                                    const progress = progressMap[rm.id];
                                    const hasProgress = progress && progress.total > 0;
                                    const isComplete = hasProgress && progress.done === progress.total;
                                    const pct = hasProgress
                                        ? Math.round((progress.done / progress.total) * 100)
                                        : 0;

                                    // SVG circle math
                                    const radius = 16;
                                    const circumference = 2 * Math.PI * radius;
                                    const strokeDashoffset = circumference - (pct / 100) * circumference;
                                    const circleColor = isComplete ? '#10B981' : '#F97316';

                                    return (
                                        <motion.button
                                            key={rm.id}
                                            whileHover={{ x: 2 }}
                                            onClick={() => onSelectRoadmap && onSelectRoadmap(rm)}
                                            className="w-full text-left p-3 rounded-xl bg-white/60 hover:bg-white border border-gray-100/80 hover:border-orange-200/60 transition-all duration-200 flex items-center gap-3 group"
                                        >
                                            {/* Circle Progress — left side */}
                                            <div className="relative flex-shrink-0 w-10 h-10">
                                                <svg width="40" height="40" viewBox="0 0 40 40" className="-rotate-90">
                                                    {/* Track */}
                                                    <circle
                                                        cx="20" cy="20" r={radius}
                                                        fill="none"
                                                        stroke="#F3F4F6"
                                                        strokeWidth="3.5"
                                                    />
                                                    {/* Progress arc */}
                                                    {hasProgress && (
                                                        <motion.circle
                                                            cx="20" cy="20" r={radius}
                                                            fill="none"
                                                            stroke={circleColor}
                                                            strokeWidth="3.5"
                                                            strokeLinecap="round"
                                                            strokeDasharray={circumference}
                                                            initial={{ strokeDashoffset: circumference }}
                                                            animate={{ strokeDashoffset }}
                                                            transition={{ duration: 0.6, ease: 'easeOut' }}
                                                        />
                                                    )}
                                                </svg>
                                                {/* Center label */}
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    {isComplete ? (
                                                        <CheckCircle size={13} className="text-emerald-500" />
                                                    ) : (
                                                        <span className={`text-[9px] font-extrabold tabular-nums leading-none ${hasProgress ? 'text-orange-500' : 'text-gray-300'}`}>
                                                            {hasProgress ? `${pct}%` : '–'}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Text info — middle */}
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-bold text-highlight-dark truncate group-hover:text-[var(--brand-orange)] transition-colors">
                                                    {rm.name || rm.topic || 'Untitled Roadmap'}
                                                </p>
                                                <p className="text-[10px] text-muted truncate mt-0.5">
                                                    {hasProgress
                                                        ? `${progress.done}/${progress.total} tasks`
                                                        : rm.topic}
                                                </p>
                                            </div>

                                            {/* Arrow — right */}
                                            <ChevronRight size={14} className="text-gray-300 group-hover:text-highlight-orange flex-shrink-0 transition-colors" />
                                        </motion.button>
                                    );
                                })}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* User Profile / Login */}
            <div className="p-4 border-t border-gray-100/80">
                {user ? (
                    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/60 border border-gray-100/80">
                        {user.photoURL ? (
                            <img
                                src={user.photoURL}
                                alt={user.displayName || 'User'}
                                className="w-9 h-9 rounded-full object-cover border border-gray-200"
                            />
                        ) : (
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--brand-dark)] to-[#1A365D] flex items-center justify-center flex-shrink-0">
                                <UserIcon className="w-4 h-4 text-white" />
                            </div>
                        )}
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-highlight-dark truncate">
                                {user.displayName || 'Learner'}
                            </p>
                            <p className="text-[10px] text-muted truncate">{user.email}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            title="Logout"
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                        >
                            <LogOut size={15} />
                        </button>
                    </div>
                ) : (
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onLoginClick}
                        className="btn-primary w-full py-3 text-xs"
                    >
                        <LogIn size={15} />
                        <span>Login</span>
                    </motion.button>
                )}
            </div>
        </aside>
    );
}