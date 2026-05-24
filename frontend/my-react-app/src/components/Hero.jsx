import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Target, Clock, BookOpen, Calendar, Loader2 } from 'lucide-react';
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

    // හැම input එකකම අගයන් නිවැරදිව state එකට එකතු කරගන්නා ශ්‍රිතය (Function)
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleStart = async (e) => {
        if (e) e.preventDefault();
        if (!formData.topic.trim()) return alert("Please enter a topic!");

        setLoading(true);
        setError(null);

        // Sub-topics ටික කමාවලින් වෙන් කරලා array එකක් බවට පත් කිරීම
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
            // Backend එකේ /start-journey endpoint එකට සම්බන්ධ වීම
            const response = await axios.post('http://localhost:5000/start-journey', payload);

            if (response.data.status === 'success') {
                // Backend එකෙන් ලැබෙන session_id සහ quiz data ටික parent state එකට දානවා
                setSessionData({
                    session_id: response.data.session_id,
                    quiz: response.data.quiz,
                    user_input: payload // පස්සේ planner එකට පාවිච්චි කරන්න සුරැකීම
                });

                // කෙලින්ම Quiz Phase (Step 2) එකට මාරු කිරීම
                setStep(2);
            }
        } catch (error) {
            console.error("Error starting journey:", error);
            setError(error.response?.data?.message || "Failed to connect to backend. Please ensure the server is running.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-primary p-6 overflow-hidden relative">

            {/* Background Decor - Light floating elements */}
            <div className="absolute top-20 left-20 w-96 h-96 bg-orange-100/30 rounded-full blur-[120px]" />
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-100/30 rounded-full blur-[120px]" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="card-3d glass-light w-full max-w-2xl p-8 md:p-12 rounded-3xl z-10 shadow-2xl"
            >
                {/* Header - Orange Accent */}
                <div className="flex items-center gap-2 mb-6 justify-center md:justify-start">
                    <Sparkles className="text-highlight-orange" size={24} />
                    <span className="text-highlight-orange font-bold tracking-widest text-sm uppercase">AI Powered Learning</span>
                </div>

                <h1 className="text-4xl md:text-5xl font-bold text-highlight-dark mb-3 text-center md:text-left leading-tight">
                    A Smart Roadmap for Your <span className="text-highlight-orange">Learning Goals</span>
                </h1>
                <p className="text-muted text-lg mb-8">Get personalized study plans powered by AI</p>

                <div className="space-y-5">
                    {/* Topic Input */}
                    <div>
                        <label className="block text-highlight-dark font-semibold text-sm mb-2 flex items-center gap-1.5">
                            <BookOpen size={16} className="text-highlight-orange" /> What will you learn today?
                        </label>
                        <input
                            type="text"
                            name="topic"
                            required
                            value={formData.topic}
                            placeholder="e.g. Quantum Computing, React, Python..."
                            className="input-light w-full px-4 py-3 bg-white/90 border border-gray-200 rounded-xl focus:outline-none focus:border-highlight-orange transition-all text-sm"
                            onChange={handleChange}
                        />
                    </div>

                    {/* Target Goal Selector */}
                    <div>
                        <label className="block text-highlight-dark font-semibold text-sm mb-2 flex items-center gap-1.5">
                            <Target size={16} className="text-red-500" /> Your Target / Goal
                        </label>
                        <select
                            name="goal"
                            value={formData.goal}
                            className="w-full bg-white/90 border-2 border-gray-200 text-highlight-dark rounded-xl px-4 py-3 outline-none focus:border-orange-400 transition-all font-medium text-sm"
                            onChange={handleChange}
                        >
                            <option value="Mid Exam">Mid Exam</option>
                            <option value="End Exam">End Exam</option>
                            <option value="Job Interview">Job Interview</option>
                            <option value="Personal Project">Personal Project</option>
                        </select>
                    </div>

                    {/* Duration & Daily Hours Grid Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Duration input */}
                        <div className="card-light bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                            <label className="flex items-center gap-2 text-highlight-dark font-bold text-sm mb-2">
                                <Calendar size={18} className="text-highlight-blue" /> Duration (Days)
                            </label>
                            <input
                                type="number"
                                name="duration_days"
                                value={formData.duration_days}
                                min={3}
                                max={90}
                                className="w-full bg-white border border-blue-200 text-highlight-dark rounded-lg px-3 py-2 outline-none focus:border-blue-400 transition-all font-medium text-sm"
                                onChange={handleChange}
                            />
                        </div>

                        {/* Daily Hours input */}
                        <div className="card-light bg-emerald-50/40 p-4 rounded-xl border border-emerald-100">
                            <label className="flex items-center gap-2 text-highlight-dark font-bold text-sm mb-2">
                                <Clock size={18} className="text-emerald-500" /> Daily Hours Available
                            </label>
                            <input
                                type="number"
                                name="daily_hours"
                                value={formData.daily_hours}
                                min={1}
                                max={24}
                                className="w-full bg-white border border-emerald-200 text-highlight-dark rounded-lg px-3 py-2 outline-none focus:border-emerald-400 transition-all font-medium text-sm"
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Sub-topics Input */}
                    <div>
                        <label className="block text-highlight-dark font-semibold text-sm mb-2 flex items-center gap-1.5">
                            <Sparkles size={16} className="text-purple-500" /> Sub-topics (comma separated)
                        </label>
                        <input
                            type="text"
                            name="sub_topics"
                            value={formData.sub_topics}
                            placeholder="e.g. Basics, Advanced, Best Practices..."
                            className="input-light w-full px-4 py-3 bg-white/90 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-400 transition-all text-sm"
                            onChange={handleChange}
                        />
                    </div>

                    {error && (
                        <p className="text-xs text-red-600 font-semibold bg-red-50 p-3 rounded-lg border border-red-100">
                            ⚠️ {error}
                        </p>
                    )}

                    {/* Action Button - Orange Highlights */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleStart}
                        disabled={loading}
                        className="w-full bg-gradient-accent hover:shadow-lg text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed text-sm mt-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>🤖 Harvesting Resources & Creating Quiz...</span>
                            </>
                        ) : (
                            <>
                                <span>🚀 Generate My Assessment Quiz</span>
                                <ArrowRight size={18} />
                            </>
                        )}
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
};

export default Hero;