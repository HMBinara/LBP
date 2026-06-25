import { motion } from 'framer-motion';
import { ArrowLeft, Award, Calendar, FolderOpen, Loader2, Save, Sparkles } from 'lucide-react';

export default function DashboardHeader({
    topic,
    skillLevel,
    score,
    totalDays,
    setStep,
    handleSaveRoadmap,
    handleViewHistory,
    isSaving
}) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-8">
            {/* Left: Title & Navigation */}
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
                    Mastering <span className="font-semibold text-highlight-dark">{topic}</span> with AI-powered guidance
                </p>
            </div>

            {/* Right: Actions & Metrics */}
            <div className="flex flex-wrap gap-2.5 items-center">
                {/* Save Button */}
                {handleSaveRoadmap && (
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleSaveRoadmap}
                        disabled={isSaving}
                        className="px-4 py-2.5 text-xs font-bold text-white rounded-xl flex items-center gap-1.5 shadow-md transition-all disabled:opacity-50"
                        style={{ background: 'linear-gradient(135deg, #10B981, #059669)', boxShadow: '0 6px 20px rgba(16, 185, 129, 0.2)' }}
                    >
                        {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        {isSaving ? 'Saving...' : 'Save Plan'}
                    </motion.button>
                )}

                {/* History Button */}
                {handleViewHistory && (
                    <button
                        onClick={handleViewHistory}
                        className="btn-secondary text-xs px-4 py-2.5"
                    >
                        <FolderOpen size={14} className="text-highlight-orange" /> History
                    </button>
                )}

                <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block" />

                {/* 3D Metric Cards */}
                <div className="perspective-3d">
                    <div className="flex items-center gap-2">
                        <motion.div
                            whileHover={{ rotateX: 4, rotateY: -4, translateY: -3 }}
                            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border transition-all duration-300"
                            style={{
                                background: 'rgba(255, 255, 255, 0.8)',
                                backdropFilter: 'blur(12px)',
                                borderColor: 'var(--border-light)',
                                boxShadow: 'var(--shadow-sm)',
                                transformStyle: 'preserve-3d'
                            }}
                        >
                            <Award className="w-5 h-5 text-highlight-orange" />
                            <div>
                                <p className="text-[10px] text-muted font-semibold uppercase tracking-wider">Level</p>
                                <p className="text-xs font-extrabold text-highlight-dark">{skillLevel} ({score}/10)</p>
                            </div>
                        </motion.div>

                        <motion.div
                            whileHover={{ rotateX: 4, rotateY: -4, translateY: -3 }}
                            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border transition-all duration-300"
                            style={{
                                background: 'rgba(255, 255, 255, 0.8)',
                                backdropFilter: 'blur(12px)',
                                borderColor: 'var(--border-light)',
                                boxShadow: 'var(--shadow-sm)',
                                transformStyle: 'preserve-3d'
                            }}
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
        </div>
    );
}