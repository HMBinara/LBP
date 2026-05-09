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
            // Backend එකත් එක්ක සම්බන්ධ වෙන තැන
            const response = await axios.post('http://localhost:5000/start-journey', {
                ...formData,
                sub_topics: formData.sub_topics.split(',').map(s => s.trim())
            });

            setSessionData(response.data);
            setStep(2); // Next step: Quiz
        } catch (error) {
            console.error("Error starting journey:", error);
            alert("Backend එකට සම්බන්ධ වෙන්න බැරි වුණා. ප්ලීස් Backend එක run කරලා තියෙන්නේ කියලා චෙක් කරන්න.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-dark via-[#0d213f] to-brand-dark p-6 overflow-hidden relative">

            {/* Background Decor - ලස්සනට 3D ගතිය එන්න දාන කෑලි */}
            <div className="absolute top-20 left-20 w-64 h-64 bg-brand-light/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-20 right-20 w-64 h-64 bg-brand-orange/10 rounded-full blur-[100px]" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="glass-card w-full max-w-2xl p-8 md:p-12 rounded-[40px] z-10"
            >
                {/* Header - Light Blue */}
                <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
                    <Sparkles className="text-brand-orange" size={20} />
                    <span className="text-brand-orange font-semibold tracking-widest text-sm uppercase">AI Powered Learning</span>
                </div>

                <h1 className="text-4xl md:text-5xl font-bold text-brand-light mb-6 text-center md:text-left leading-tight">
                    ඔයාගේ සිහිනයට <br /> <span className="text-white">Smart Roadmap එකක්.</span>
                </h1>

                <div className="space-y-6">
                    {/* Topic Input */}
                    <div>
                        <label className="block text-white/50 text-sm mb-2 ml-1">මොකක්ද අද ඉගෙන ගන්නේ?</label>
                        <input
                            type="text"
                            placeholder="e.g. Quantum Computing, React, Python..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-brand-light transition-all"
                            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Goal Selector */}
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                            <div className="flex items-center gap-2 text-brand-light mb-2">
                                <Target size={18} />
                                <span className="text-sm font-medium">Target එක</span>
                            </div>
                            <select
                                className="bg-transparent text-white outline-none w-full cursor-pointer"
                                onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                            >
                                <option className="bg-brand-dark" value="Mid Exam">Mid Exam</option>
                                <option className="bg-brand-dark" value="End Exam">End Exam</option>
                                <option className="bg-brand-dark" value="Job Interview">Job Interview</option>
                                <option className="bg-brand-dark" value="Personal Project">Personal Project</option>
                            </select>
                        </div>

                        {/* Duration */}
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                            <div className="flex items-center gap-2 text-brand-light mb-2">
                                <Clock size={18} />
                                <span className="text-sm font-medium">දවස් ගණන</span>
                            </div>
                            <input
                                type="number"
                                defaultValue={7}
                                className="bg-transparent text-white outline-none w-full"
                                onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Action Button - Orange Highlights */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleStart}
                        disabled={loading}
                        className="w-full bg-brand-orange hover:bg-orange-500 text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-orange-600/20 transition-all disabled:opacity-50"
                    >
                        {loading ? "AI is Thinking..." : "Generate My Roadmap"}
                        {!loading && <ArrowRight size={20} />}
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
};

export default Hero;