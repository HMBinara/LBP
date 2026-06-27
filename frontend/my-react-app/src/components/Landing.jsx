import { motion } from 'framer-motion';
import {
    Sparkles, ArrowRight, Target, BookOpen,
    Rocket, BrainCircuit, Zap, GraduationCap, BarChart3, CheckCircle,
    Users, Star, Clock, TrendingUp, ShieldCheck, PlayCircle, Calendar
} from 'lucide-react';

// Landing.jsx — First screen the user sees (before login/form).
// Full marketing/intro page: navbar, hero + illustration, stats,
// "how it works", feature grid, social proof, footer.
const Landing = ({ onGetStarted }) => {

    const featureChips = [
        { icon: BrainCircuit, label: 'AI Powered', color: 'badge-orange' },
        { icon: Target, label: 'Personalized', color: 'badge-dark' },
        { icon: Zap, label: 'Adaptive', color: 'badge-emerald' },
    ];

    const stats = [
        { icon: Users, value: '12,000+', label: 'Learners Guided' },
        { icon: BookOpen, value: '50,000+', label: 'Resources Curated' },
        { icon: TrendingUp, value: '94%', label: 'Goal Completion' },
        { icon: Star, value: '4.9/5', label: 'Average Rating' },
    ];

    const features = [
        {
            icon: BarChart3,
            title: 'Diagnostic Quiz',
            desc: 'A quick AI-generated assessment pinpoints exactly where you stand — no guesswork, no wasted time on content you already know.',
            color: 'text-highlight-orange',
            bg: 'bg-orange-50',
            border: 'border-orange-100'
        },
        {
            icon: BookOpen,
            title: 'Resource Curation',
            desc: 'Our agents scan the web and hand-pick the best videos, articles and docs for your exact skill level and topic.',
            color: 'text-blue-500',
            bg: 'bg-blue-50',
            border: 'border-blue-100'
        },
        {
            icon: GraduationCap,
            title: 'Adaptive Roadmap',
            desc: 'A day-by-day plan that fits your schedule and deadline — whether it\'s a mid-exam, a job interview, or a personal project.',
            color: 'text-emerald-500',
            bg: 'bg-emerald-50',
            border: 'border-emerald-100'
        },
        {
            icon: Clock,
            title: 'Time-Boxed Learning',
            desc: 'Tell us how many days you have and how many hours a day you can study — the plan adjusts itself to fit your real life.',
            color: 'text-purple-500',
            bg: 'bg-purple-50',
            border: 'border-purple-100'
        },
        {
            icon: CheckCircle,
            title: 'Progress Tracking',
            desc: 'Mark daily tasks as complete, track your streak, and watch your roadmap fill up as you move toward your goal.',
            color: 'text-rose-500',
            bg: 'bg-rose-50',
            border: 'border-rose-100'
        },
        {
            icon: ShieldCheck,
            title: 'Save & Revisit',
            desc: 'Save any generated roadmap to your account and pick up exactly where you left off, on any device, anytime.',
            color: 'text-cyan-500',
            bg: 'bg-cyan-50',
            border: 'border-cyan-100'
        },
    ];

    return (
        <div className="min-h-screen gradient-primary font-sans overflow-x-hidden">

            {/* ═══ NAVBAR ═══ */}
            <nav className="sticky top-0 z-30 backdrop-blur-xl bg-white/70 border-b border-gray-100/80">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--brand-orange)] to-[#FF6B00] flex items-center justify-center shadow-md">
                            <Sparkles className="text-white w-5 h-5" />
                        </div>
                        <span className="font-extrabold text-highlight-dark text-base tracking-tight">LearnPath AI</span>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={onGetStarted}
                        className="btn-primary px-5 py-2.5 text-xs"
                    >
                        <Rocket size={14} /> Get Started
                    </motion.button>
                </div>
            </nav>

            {/* ═══ HERO ═══ */}
            <section className="relative px-4 md:px-8 pt-14 pb-20 overflow-hidden">
                <div className="floating-orb floating-orb-orange w-[600px] h-[600px] -top-40 -left-32" />
                <div className="floating-orb floating-orb-blue w-[500px] h-[500px] top-0 right-0" />

                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
                    {/* Left: Copy */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                    >
                        <div className="flex flex-wrap gap-2 mb-6">
                            {featureChips.map((chip, i) => (
                                <motion.span
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.15 + i * 0.1 }}
                                    className={chip.color}
                                >
                                    <chip.icon size={12} /> {chip.label}
                                </motion.span>
                            ))}
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-5">
                            <span className="gradient-text">A Smarter Way</span>
                            <br />
                            <span className="text-highlight-dark">to Learn </span>
                            <span className="gradient-text-orange">Anything</span>
                        </h1>
                        <p className="text-muted text-base md:text-lg max-w-lg mb-8">
                            LearnPath AI diagnoses your current skill level, curates the best resources from across the web, and builds a realistic day-by-day study roadmap — tailored to your goal, your topic, and your schedule.
                        </p>

                        <div className="flex flex-wrap gap-3 mb-10">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={onGetStarted}
                                className="btn-primary px-7 py-3.5 text-sm"
                            >
                                <Rocket size={16} /> Get Started Free <ArrowRight size={15} />
                            </motion.button>
                            <button className="btn-secondary px-7 py-3.5 text-sm">
                                <PlayCircle size={16} /> See How It Works
                            </button>
                        </div>

                        {/* Mini trust row */}
                        <div className="flex items-center gap-3">
                            <div className="flex -space-x-2">
                                {['#FF8C00', '#0A192F', '#10B981', '#3B82F6'].map((c, i) => (
                                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white" style={{ background: c }}>
                                        {['DM', 'BN', 'SK', 'TR'][i]}
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-muted font-medium">
                                Joined by <span className="font-bold text-highlight-dark">12,000+</span> learners worldwide
                            </p>
                        </div>
                    </motion.div>

                    {/* Right: Illustration + Showcase Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
                        className="perspective-3d relative"
                    >
                        {/* Custom illustration */}
                        <svg viewBox="0 0 480 360" className="w-full max-w-md mx-auto mb-[-40px] relative z-10" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <linearGradient id="gradOrange" x1="0" y1="0" x2="1" y2="1">
                                    <stop offset="0%" stopColor="#FF8C00" />
                                    <stop offset="100%" stopColor="#FF6B00" />
                                </linearGradient>
                                <linearGradient id="gradDark" x1="0" y1="0" x2="1" y2="1">
                                    <stop offset="0%" stopColor="#112240" />
                                    <stop offset="100%" stopColor="#0A192F" />
                                </linearGradient>
                            </defs>
                            {/* floating platform */}
                            <ellipse cx="240" cy="320" rx="170" ry="18" fill="#0A192F" opacity="0.06" />
                            {/* main laptop/monitor */}
                            <rect x="110" y="70" width="260" height="170" rx="14" fill="white" stroke="#E2E8F0" strokeWidth="2" />
                            <rect x="125" y="85" width="230" height="20" rx="6" fill="#F1F5F9" />
                            <circle cx="135" cy="95" r="3" fill="#FF8C00" />
                            <circle cx="146" cy="95" r="3" fill="#10B981" />
                            <circle cx="157" cy="95" r="3" fill="#3B82F6" />
                            {/* bars chart inside screen */}
                            <rect x="135" y="190" width="18" height="35" rx="3" fill="url(#gradOrange)" />
                            <rect x="160" y="170" width="18" height="55" rx="3" fill="#3B82F6" opacity="0.85" />
                            <rect x="185" y="150" width="18" height="75" rx="3" fill="#10B981" opacity="0.85" />
                            <rect x="210" y="180" width="18" height="45" rx="3" fill="url(#gradDark)" />
                            {/* roadmap line + nodes on right of screen */}
                            <path d="M250 200 C 270 160, 300 230, 340 150" stroke="#FF8C00" strokeWidth="3" fill="none" strokeDasharray="6 6" opacity="0.6" />
                            <circle cx="250" cy="200" r="6" fill="#FF8C00" />
                            <circle cx="295" cy="190" r="6" fill="#3B82F6" />
                            <circle cx="340" cy="150" r="7" fill="#10B981" />
                            {/* laptop base */}
                            <path d="M95 245 L385 245 L365 268 L115 268 Z" fill="#CBD5E1" />
                            {/* floating cards */}
                            <motion.g initial={{ y: 0 }} animate={{ y: [-4, 4, -4] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
                                <rect x="20" y="40" width="86" height="56" rx="12" fill="white" stroke="#FED7AA" strokeWidth="2" />
                                <circle cx="42" cy="64" r="10" fill="#FFF3E0" />
                                <path d="M37 64 l4 4 l8 -10" stroke="#FF8C00" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                                <rect x="58" y="56" width="38" height="6" rx="3" fill="#FED7AA" />
                                <rect x="58" y="68" width="28" height="5" rx="2.5" fill="#FED7AA" opacity="0.6" />
                            </motion.g>
                            <motion.g initial={{ y: 0 }} animate={{ y: [4, -4, 4] }} transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}>
                                <rect x="370" y="250" width="92" height="56" rx="12" fill="white" stroke="#A7F3D0" strokeWidth="2" />
                                <circle cx="394" cy="278" r="10" fill="#ECFDF5" />
                                <path d="M389 278 l4 4 l8 -10" stroke="#10B981" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                                <rect x="410" y="270" width="42" height="6" rx="3" fill="#A7F3D0" />
                                <rect x="410" y="282" width="30" height="5" rx="2.5" fill="#A7F3D0" opacity="0.6" />
                            </motion.g>
                        </svg>

                        <motion.div
                            className="card-3d glass-light rounded-3xl p-6 relative overflow-hidden"
                            whileHover={{ rotateX: 3, rotateY: -3, translateY: -6 }}
                        >
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--brand-dark)] to-[#1A365D] flex items-center justify-center shadow-md">
                                    <BrainCircuit className="text-white w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-highlight-dark">How It Works</p>
                                    <p className="text-[11px] text-muted">Three intelligent AI agents collaborate</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {[
                                    { icon: BarChart3, title: 'Diagnostic Quiz', desc: 'AI assesses your current knowledge level', color: 'text-highlight-orange' },
                                    { icon: BookOpen, title: 'Resource Curation', desc: 'Best videos & materials selected for you', color: 'text-blue-500' },
                                    { icon: GraduationCap, title: 'Adaptive Roadmap', desc: 'Day-by-day study plan built to your pace', color: 'text-emerald-500' },
                                ].map((step, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 + i * 0.12 }}
                                        className="flex items-start gap-3 p-3 rounded-xl bg-white/60 border border-gray-100/80 hover:border-orange-200/60 transition-all duration-200"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 border border-gray-100">
                                            <step.icon size={16} className={step.color} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-highlight-dark flex items-center gap-1.5">
                                                {step.title}
                                                <CheckCircle size={12} className="text-emerald-400" />
                                            </p>
                                            <p className="text-[11px] text-muted mt-0.5">{step.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* ═══ STATS BAR ═══ */}
            <section className="px-4 md:px-8 py-10 border-y border-gray-100/80 bg-white/60 backdrop-blur-sm relative z-10">
                <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
                    {stats.map((s, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.08 }}
                            className="text-center"
                        >
                            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center mx-auto mb-2.5">
                                <s.icon size={18} className="text-highlight-orange" />
                            </div>
                            <p className="text-2xl font-extrabold text-highlight-dark">{s.value}</p>
                            <p className="text-xs text-muted font-medium">{s.label}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ═══ FEATURES GRID ═══ */}
            <section className="px-4 md:px-8 py-20 max-w-7xl mx-auto relative z-10">
                <div className="text-center max-w-2xl mx-auto mb-14">
                    <span className="badge-orange mb-4 inline-flex"><Sparkles size={12} /> Why LearnPath AI</span>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-highlight-dark tracking-tight mb-4">
                        Everything you need to <span className="gradient-text-orange">actually finish</span> what you start
                    </h2>
                    <p className="text-muted text-base">
                        Most learning plans fail because they're generic. Ours adapts to who you are, what you know, and how much time you actually have.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {features.map((f, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.06 }}
                            className="card-light rounded-2xl p-6"
                        >
                            <div className={`w-11 h-11 rounded-xl ${f.bg} border ${f.border} flex items-center justify-center mb-4`}>
                                <f.icon size={20} className={f.color} />
                            </div>
                            <h3 className="font-bold text-highlight-dark text-sm mb-2">{f.title}</h3>
                            <p className="text-xs text-muted leading-relaxed">{f.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ═══ FINAL CTA ═══ */}
            <section className="px-4 md:px-8 pb-20 max-w-5xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="rounded-3xl p-10 md:p-14 text-center relative overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, #0A192F, #112240)' }}
                >
                    <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-orange-500/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl" />
                    <Calendar className="w-10 h-10 text-highlight-orange mx-auto mb-5 relative z-10" />
                    <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3 relative z-10">
                        Your personalized roadmap is one click away
                    </h2>
                    <p className="text-gray-300 text-sm md:text-base mb-8 max-w-xl mx-auto relative z-10">
                        Tell us what you want to learn, your goal, and how much time you've got. We'll handle the rest.
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={onGetStarted}
                        className="btn-primary px-8 py-4 text-sm relative z-10"
                    >
                        <Rocket size={16} /> Get Started Now <ArrowRight size={15} />
                    </motion.button>
                </motion.div>
            </section>

            {/* ═══ FOOTER ═══ */}
            <footer className="px-4 md:px-8 py-8 border-t border-gray-100/80">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[var(--brand-orange)] to-[#FF6B00] flex items-center justify-center">
                            <Sparkles className="text-white w-4 h-4" />
                        </div>
                        <span className="font-bold text-highlight-dark text-sm">LearnPath AI</span>
                    </div>
                    <p className="text-xs text-muted">© 2026 LearnPath AI. Built for learners who finish what they start.</p>
                </div>
            </footer>
        </div>
    );
};

export default Landing;