import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Sparkles, ArrowRight, Target, Clock, BookOpen, Calendar,
    Loader2, Rocket
} from 'lucide-react';
import axios from 'axios';

const Hero = ({ setStep, setSessionData }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        topic: '',
        sub_topics: '',
        goal: 'Mid Exam',
        duration_days: 7,
        daily_hours: 2
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleStart = async (e) => {
        if (e) e.preventDefault();
        if (!formData.topic.trim()) return alert("Please enter a topic!");

        setLoading(true);
        setError(null);

        const subTopicsArray = formData.sub_topics
            ? formData.sub_topics.split(',').map(s => s.trim()).filter(Boolean)
            : [];

        const payload = {
            topic: formData.topic,
            sub_topics: subTopicsArray,
            duration_days: parseInt(formData.duration_days) || 7,
            daily_hours: parseInt(formData.daily_hours) || 2,
            goal: formData.goal
        };

        try {
            const response = await axios.post('http://localhost:5000/start-journey', payload);

            const normalizeQuiz = (rawQuiz) => {
                if (rawQuiz && Array.isArray(rawQuiz.quiz) && rawQuiz.quiz.length > 0) return rawQuiz;
                if (Array.isArray(rawQuiz) && rawQuiz.length > 0) return { quiz: rawQuiz };
                if (typeof rawQuiz === 'string') {
                    try {
                        const parsed = JSON.parse(rawQuiz);
                        if (parsed && Array.isArray(parsed.quiz) && parsed.quiz.length > 0) return parsed;
                        if (Array.isArray(parsed) && parsed.length > 0) return { quiz: parsed };
                    } catch {
                        return null;
                    }
                }
                return null;
            };

            if (response.data.status === 'success') {
                const normalizedQuiz = normalizeQuiz(response.data.quiz);
                if (!normalizedQuiz) {
                    setError('Quiz generation failed. Please try again in a few moments.');
                    return;
                }
                setSessionData({
                    session_id: response.data.session_id,
                    quiz: normalizedQuiz,
                    user_input: payload
                });
                setStep(2);
            } else {
                setError(response.data?.message || 'Failed to start quiz journey.');
            }
        } catch (error) {
            console.error("Error starting journey:", error);
            setError(error.response?.data?.message || "Failed to connect to backend. Please ensure the server is running.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center gradient-primary p-4 md:p-8 overflow-hidden relative">

            {/* Floating Background Orbs */}
            <div className="floating-orb floating-orb-orange w-[600px] h-[600px] -top-20 -left-20" />
            <div className="floating-orb floating-orb-blue w-[500px] h-[500px] bottom-10 right-0" />
            <div className="floating-orb floating-orb-purple w-[350px] h-[350px] top-[50%] left-[40%]" />

            {/* ═══ SINGLE CENTERED FORM CARD ═══ */}
            <div className="w-full max-w-xl mx-auto relative z-10 perspective-3d">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                    className="card-3d glass-light rounded-3xl p-7 md:p-10 relative overflow-hidden"
                >
                    {/* Top Gradient Bar */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--brand-orange)] to-transparent opacity-50" />

                    {/* Header */}
                    <div className="flex items-center gap-2 mb-5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--brand-orange)] to-[#FF6B00] flex items-center justify-center shadow-md" style={{ boxShadow: '0 6px 20px rgba(255,140,0,0.25)' }}>
                            <Sparkles className="text-white w-5 h-5" />
                        </div>
                        <span className="text-highlight-orange font-bold tracking-widest text-xs uppercase">AI Powered Learning</span>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-extrabold text-highlight-dark mb-2 leading-tight tracking-tight">
                        Build Your <span className="gradient-text-orange">Smart Roadmap</span>
                    </h1>
                    <p className="text-muted text-sm mb-7">Define your learning goals and let our AI craft a personalized plan.</p>

                    {/* Form Fields */}
                    <div className="space-y-4">
                        {/* Topic */}
                        <div>
                            <label className="block text-xs font-bold text-highlight-dark mb-1.5 flex items-center gap-1.5">
                                <BookOpen size={14} className="text-highlight-orange" /> What will you learn?
                            </label>
                            <input
                                type="text"
                                name="topic"
                                required
                                value={formData.topic}
                                placeholder="e.g. Quantum Computing, React, Python..."
                                className="input-light"
                                onChange={handleChange}
                            />
                        </div>

                        {/* Goal */}
                        <div>
                            <label className="block text-xs font-bold text-highlight-dark mb-1.5 flex items-center gap-1.5">
                                <Target size={14} className="text-red-500" /> Your Target Goal
                            </label>
                            <select
                                name="goal"
                                value={formData.goal}
                                className="input-light cursor-pointer"
                                onChange={handleChange}
                            >
                                <option value="Mid Exam">Mid Exam</option>
                                <option value="End Exam">End Exam</option>
                                <option value="Job Interview">Job Interview</option>
                                <option value="Personal Project">Personal Project</option>
                            </select>
                        </div>

                        {/* Duration & Hours Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-blue-50/50 p-3.5 rounded-xl border border-blue-100/80">
                                <label className="flex items-center gap-1.5 text-xs font-bold text-highlight-dark mb-1.5">
                                    <Calendar size={14} className="text-blue-500" /> Days
                                </label>
                                <input
                                    type="number"
                                    name="duration_days"
                                    value={formData.duration_days}
                                    min={3}
                                    max={90}
                                    className="input-light text-center font-bold"
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100/80">
                                <label className="flex items-center gap-1.5 text-xs font-bold text-highlight-dark mb-1.5">
                                    <Clock size={14} className="text-emerald-500" /> Hours/Day
                                </label>
                                <input
                                    type="number"
                                    name="daily_hours"
                                    value={formData.daily_hours}
                                    min={1}
                                    max={24}
                                    className="input-light text-center font-bold"
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Sub-topics */}
                        <div>
                            <label className="block text-xs font-bold text-highlight-dark mb-1.5 flex items-center gap-1.5">
                                <Sparkles size={14} className="text-purple-500" /> Sub-topics (comma separated)
                            </label>
                            <input
                                type="text"
                                name="sub_topics"
                                value={formData.sub_topics}
                                placeholder="e.g. Basics, Advanced, Best Practices..."
                                className="input-light"
                                onChange={handleChange}
                            />
                        </div>

                        {/* Error */}
                        {error && (
                            <motion.p
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-xs text-red-600 font-semibold bg-red-50 p-3 rounded-xl border border-red-100 flex items-center gap-2"
                            >
                                <Target size={14} className="flex-shrink-0 text-red-500" />
                                {error}
                            </motion.p>
                        )}

                        {/* CTA Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleStart}
                            disabled={loading}
                            className="btn-primary w-full py-4 text-sm mt-1"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Harvesting Resources & Creating Quiz...</span>
                                </>
                            ) : (
                                <>
                                    <Rocket size={18} />
                                    <span>Generate My Assessment Quiz</span>
                                    <ArrowRight size={16} />
                                </>
                            )}
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Hero;