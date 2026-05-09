import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Target, Clock } from 'lucide-react';
import axios from 'axios';

const Hero = ({ setStep, setSessionData }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        topic: '',
        sub_topics: '',
        goal: 'Mid Exam',
        duration_days: 7,
        daily_hours: 2
    });

    const handleStart = async () => {
        if (!formData.topic) return alert("Please enter a topic!");

        setLoading(true);
        try {
            // Connect to backend and start the journey
            const response = await axios.post('http://localhost:5000/start-journey', {
                ...formData,
                sub_topics: formData.sub_topics.split(',').map(s => s.trim())
            });

            setSessionData(response.data);
            setStep(2); // Next step: Quiz
        } catch (error) {
            console.error("Error starting journey:", error);
            alert("Failed to connect to backend. Please ensure the backend server is running.");
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

                <div className="space-y-6">
                    {/* Topic Input */}
                    <div>
                        <label className="block text-highlight-dark font-semibold text-sm mb-2">What will you learn today?</label>
                        <input
                            type="text"
                            placeholder="e.g. Quantum Computing, React, Python..."
                            className="input-light"
                            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Goal Selector */}
                        <div className="card-light bg-orange-50">
                            <div className="flex items-center gap-2 text-highlight-orange mb-3">
                                <Target size={20} />
                                <span className="text-sm font-bold">Your Target</span>
                            </div>
                            <select
                                className="w-full bg-white border-2 border-orange-300 text-highlight-dark rounded-lg px-3 py-2 outline-none focus:border-orange-500 transition-all font-medium"
                                onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                            >
                                <option value="Mid Exam">Mid Exam</option>
                                <option value="End Exam">End Exam</option>
                                <option value="Job Interview">Job Interview</option>
                                <option value="Personal Project">Personal Project</option>
                            </select>
                        </div>

                        {/* Duration */}
                        <div className="card-light bg-blue-50">
                            <div className="flex items-center gap-2 text-highlight-dark mb-3">
                                <Clock size={20} />
                                <span className="text-sm font-bold">Duration (days)</span>
                            </div>
                            <input
                                type="number"
                                defaultValue={7}
                                min={1}
                                max={90}
                                className="w-full bg-white border-2 border-blue-300 text-highlight-dark rounded-lg px-3 py-2 outline-none focus:border-blue-500 transition-all font-medium"
                                onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Sub-topics Input */}
                    <div>
                        <label className="block text-highlight-dark font-semibold text-sm mb-2">Sub-topics (comma separated)</label>
                        <input
                            type="text"
                            placeholder="e.g. Basics, Advanced, Best Practices..."
                            className="input-light"
                            onChange={(e) => setFormData({ ...formData, sub_topics: e.target.value })}
                        />
                    </div>

                    {/* Action Button - Orange Highlights */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleStart}
                        disabled={loading}
                        className="w-full bg-gradient-accent hover:shadow-lg text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        <span>{loading ? "🤖 AI is Thinking..." : "🚀 Generate My Roadmap"}</span>
                        {!loading && <ArrowRight size={20} />}
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
};

export default Hero;