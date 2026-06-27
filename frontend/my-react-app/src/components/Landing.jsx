import { motion } from 'framer-motion';
import {
    Sparkles, ArrowRight, Target, BookOpen,
    Rocket, BrainCircuit, Zap, GraduationCap, BarChart3, CheckCircle
} from 'lucide-react';

// Landing.jsx — First screen the user sees (before login/form).
// Pure marketing/intro content. "Get Started" button moves the app
// forward to the next step (Auth if not logged in, Form if logged in).
const Landing = ({ onGetStarted }) => {

    const featureChips = [
        { icon: BrainCircuit, label: 'AI Powered', color: 'badge-orange' },
        { icon: Target, label: 'Personalized', color: 'badge-dark' },
        { icon: Zap, label: 'Adaptive', color: 'badge-emerald' },
    ];

    return (
        <div className="min-h-screen flex items-center justify-center gradient-primary p-4 md:p-8 overflow-hidden relative">

            {/* Floating Background Orbs */}
            <div className="floating-orb floating-orb-orange w-[600px] h-[600px] -top-20 -left-20" />
            <div className="floating-orb floating-orb-blue w-[500px] h-[500px] bottom-10 right-0" />
            <div className="floating-orb floating-orb-purple w-[350px] h-[350px] top-[50%] left-[40%]" />

            <div className="w-full max-w-3xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                    className="text-center mb-8"
                >
                    {/* Feature Chips */}
                    <div className="flex flex-wrap gap-2 justify-center mb-6">
                        {featureChips.map((chip, i) => (
                            <motion.span
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + i * 0.1 }}
                                className={chip.color}
                            >
                                <chip.icon size={12} /> {chip.label}
                            </motion.span>
                        ))}
                    </div>

                    <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight mb-4">
                        <span className="gradient-text">A Smarter Way</span>
                        <br />
                        <span className="text-highlight-dark">to Learn </span>
                        <span className="gradient-text-orange">Anything</span>
                    </h1>
                    <p className="text-muted text-base md:text-lg max-w-xl mx-auto">
                        Our AI diagnoses your skill level, curates the best resources, and builds a day-by-day study roadmap tailored just for you.
                    </p>
                </motion.div>

                {/* Showcase Card */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
                    className="perspective-3d"
                >
                    <motion.div
                        className="card-3d glass-light rounded-3xl p-7 md:p-9 relative overflow-hidden"
                        whileHover={{ rotateX: 2, rotateY: -2, translateY: -4 }}
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--brand-dark)] to-[#1A365D] flex items-center justify-center shadow-md">
                                <BrainCircuit className="text-white w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-highlight-dark">How It Works</p>
                                <p className="text-xs text-muted">Three intelligent AI agents collaborate</p>
                            </div>
                        </div>

                        {/* Step indicators */}
                        <div className="space-y-3 mb-6">
                            {[
                                { icon: BarChart3, title: 'Diagnostic Quiz', desc: 'AI assesses your current knowledge level', color: 'text-highlight-orange' },
                                { icon: BookOpen, title: 'Resource Curation', desc: 'Best videos & materials selected for you', color: 'text-blue-500' },
                                { icon: GraduationCap, title: 'Adaptive Roadmap', desc: 'Day-by-day study plan built to your pace', color: 'text-emerald-500' },
                            ].map((step, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.35 + i * 0.12 }}
                                    className="flex items-start gap-3 p-3 rounded-xl bg-white/60 border border-gray-100/80 hover:border-orange-200/60 transition-all duration-200"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 border border-gray-100">
                                        <step.icon size={16} className={step.color} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-highlight-dark flex items-center gap-1.5">
                                            {step.title}
                                            <CheckCircle size={12} className="text-emerald-400" />
                                        </p>
                                        <p className="text-xs text-muted mt-0.5">{step.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Stats Row */}
                        <div className="grid grid-cols-3 gap-2 mb-7 pt-4 border-t border-gray-100/80">
                            {[
                                { value: '10', label: 'Quiz Qs' },
                                { value: '7+', label: 'Resources' },
                                { value: 'AI', label: 'Adaptive' },
                            ].map((stat, i) => (
                                <div key={i} className="text-center p-2 rounded-lg bg-white/50">
                                    <p className="text-lg font-extrabold text-highlight-orange">{stat.value}</p>
                                    <p className="text-[10px] text-muted font-semibold uppercase tracking-wider">{stat.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Get Started CTA */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onGetStarted}
                            className="btn-primary w-full py-4 text-sm"
                        >
                            <Rocket size={18} />
                            <span>Get Started</span>
                            <ArrowRight size={16} />
                        </motion.button>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default Landing;