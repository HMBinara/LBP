import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle, CheckCircle, ArrowLeft, BrainCircuit, Sparkles } from 'lucide-react';
import axios from 'axios';
import { db } from '../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function Quiz({ userId, sessionData, setStep, setFinalPlan }) {
    const normalizeQuestions = (rawQuiz) => {
        if (rawQuiz && Array.isArray(rawQuiz.quiz)) return rawQuiz.quiz;
        if (Array.isArray(rawQuiz)) return rawQuiz;
        if (typeof rawQuiz === 'string') {
            try {
                const parsed = JSON.parse(rawQuiz);
                if (parsed && Array.isArray(parsed.quiz)) return parsed.quiz;
                if (Array.isArray(parsed)) return parsed;
            } catch {
                return [];
            }
        }
        return [];
    };

    const quizQuestions = normalizeQuestions(sessionData?.quiz);
    const sessionId = sessionData?.session_id;

    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // No quiz data fallback
    if (quizQuestions.length === 0) {
        return (
            <main className="min-h-screen gradient-primary flex items-center justify-center p-6">
                <div className="perspective-3d">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="card-3d glass-light rounded-3xl p-10 max-w-md text-center"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-5 border border-red-100">
                            <AlertCircle className="w-7 h-7 text-red-500" />
                        </div>
                        <h3 className="text-xl font-extrabold text-highlight-dark mb-2">Quiz Data Missing</h3>
                        <p className="text-muted text-sm mb-7">Failed to load assessment questions. Please go back and try again.</p>
                        <button onClick={() => setStep(1)} className="btn-secondary w-full">
                            <ArrowLeft size={16} /> Back to Home
                        </button>
                    </motion.div>
                </div>
            </main>
        );
    }

    const handleAnswerSelect = (selectedOptionText) => {
        const newAnswers = [...answers];
        newAnswers[currentQuestion] = selectedOptionText;
        setAnswers(newAnswers);

        if (currentQuestion < quizQuestions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            submitQuizToBackend(newAnswers);
        }
    };

    const submitQuizToBackend = async (finalAnswers) => {
        setIsSubmitting(true);
        setError(null);
        try {
            const response = await axios.post('http://localhost:5000/submit-quiz', {
                session_id: sessionId,
                answers: finalAnswers
            });

            if (response.data.status === 'completed' || response.data.status === 'success') {
                const roadmap = Array.isArray(response.data.roadmap) ? response.data.roadmap : [];
                if (roadmap.length === 0) {
                    throw new Error('Study roadmap was not generated correctly.');
                }

                // Save to Firestore
                try {
                    const quizCollectionRef = collection(db, "quiz_sessions");
                    await addDoc(quizCollectionRef, {
                        userId: userId,
                        sessionId: sessionId || null,
                        topic: sessionData?.user_input?.topic || "General",
                        answers: finalAnswers,
                        score: response.data.score || null,
                        skillLevel: response.data.skill_level || null,
                        createdAt: serverTimestamp()
                    });
                    console.log("Quiz data saved to Firestore successfully for user:", userId);
                } catch (fsErr) {
                    console.error("Firestore Save Error: ", fsErr);
                }

                setFinalPlan({
                    score: response.data.score,
                    skill_level: response.data.skill_level,
                    roadmap,
                    resources: response.data.resources || sessionData?.curated_resources || [],
                    topic: sessionData?.user_input?.topic,
                    duration: sessionData?.user_input?.duration_days
                });
                setStep(3);
            } else {
                throw new Error("Failed to process the quiz results properly.");
            }
        } catch (err) {
            console.error("Error submitting quiz:", err);
            setError(err.response?.data?.message || "Something went wrong while analyzing your results.");
            setIsSubmitting(false);
        }
    };

    const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;
    const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F'];

    // ═══ SUBMITTING STATE — Premium Full-Page Loader ═══
    if (isSubmitting) {
        return (
            <main className="min-h-screen gradient-primary flex flex-col items-center justify-center p-8 relative overflow-hidden">
                <div className="floating-orb floating-orb-orange w-[500px] h-[500px] top-[10%] left-[10%]" />
                <div className="floating-orb floating-orb-blue w-[400px] h-[400px] bottom-[20%] right-[15%]" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center relative z-10"
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                        className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[var(--brand-orange)] to-[#FF6B00] flex items-center justify-center shadow-xl"
                        style={{ boxShadow: '0 12px 40px rgba(255, 140, 0, 0.3)' }}
                    >
                        <BrainCircuit className="w-10 h-10 text-white" />
                    </motion.div>

                    <h2 className="text-2xl md:text-3xl font-extrabold text-highlight-dark mb-3 tracking-tight">
                        Analyzing Your Answers...
                    </h2>
                    <p className="text-muted text-sm max-w-md mx-auto mb-6">
                        Our AI Assessor is calculating your expertise level and crafting personalized study tracks.
                    </p>

                    {/* Animated progress dots */}
                    <div className="flex items-center justify-center gap-2">
                        {[0, 1, 2].map(i => (
                            <motion.div
                                key={i}
                                className="w-2.5 h-2.5 rounded-full bg-[var(--brand-orange)]"
                                animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                                transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
                            />
                        ))}
                    </div>
                </motion.div>
            </main>
        );
    }

    // ═══ MAIN QUIZ INTERFACE ═══
    return (
        <main className="min-h-screen gradient-primary flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
            <div className="floating-orb floating-orb-orange w-[400px] h-[400px] -top-10 -right-10" />
            <div className="floating-orb floating-orb-blue w-[300px] h-[300px] bottom-20 left-10" />

            <div className="w-full max-w-3xl relative z-10">
                {/* Header Info */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Sparkles size={18} className="text-highlight-orange" />
                            <span className="text-highlight-orange font-bold tracking-widest text-xs uppercase">Diagnostic Assessment</span>
                        </div>
                        <p className="text-muted text-sm">
                            Question <span className="font-bold text-highlight-dark">{currentQuestion + 1}</span> of <span className="font-bold text-highlight-dark">{quizQuestions.length}</span>
                        </p>
                    </div>
                    <span className="badge-orange">
                        {Math.round(progress)}% Complete
                    </span>
                </motion.div>

                {/* Progress Bar */}
                <div className="progress-bar-track mb-8">
                    <motion.div
                        className="progress-bar-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                    />
                </div>

                {/* Error */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 bg-red-50 border border-red-100 text-red-700 p-4 rounded-xl flex gap-3 items-center"
                    >
                        <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
                        <p className="text-sm font-medium">{error}</p>
                    </motion.div>
                )}

                {/* Question Card */}
                <div className="perspective-3d">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentQuestion}
                            initial={{ opacity: 0, x: 30, rotateY: -5 }}
                            animate={{ opacity: 1, x: 0, rotateY: 0 }}
                            exit={{ opacity: 0, x: -30, rotateY: 5 }}
                            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                            className="glass-light rounded-3xl p-6 md:p-8 mb-6"
                        >
                            {/* Question Number Badge */}
                            <div className="flex items-start gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--brand-orange)] to-[#FF6B00] flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0 shadow-md">
                                    Q{currentQuestion + 1}
                                </div>
                                <h3 className="text-lg font-bold text-highlight-dark leading-relaxed pt-1.5">
                                    {quizQuestions[currentQuestion].question}
                                </h3>
                            </div>

                            {/* Options */}
                            <div className="space-y-3">
                                {quizQuestions[currentQuestion].options.map((option, index) => {
                                    const isSelected = answers[currentQuestion] === option;
                                    return (
                                        <motion.button
                                            key={index}
                                            whileHover={{ scale: 1.01, y: -2 }}
                                            whileTap={{ scale: 0.99 }}
                                            onClick={() => handleAnswerSelect(option)}
                                            className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 ${isSelected
                                                ? 'border-[var(--brand-orange)] bg-orange-50/80 shadow-md'
                                                : 'border-gray-100 bg-white/60 hover:border-orange-200 hover:bg-orange-50/30 hover:shadow-sm'
                                            }`}
                                            style={isSelected ? { boxShadow: '0 4px 20px rgba(255, 140, 0, 0.12)' } : {}}
                                        >
                                            <div className="flex items-center gap-3">
                                                {/* Option Label Circle */}
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-sm transition-all duration-200 ${isSelected
                                                    ? 'bg-gradient-to-br from-[var(--brand-orange)] to-[#FF6B00] text-white shadow-sm'
                                                    : 'bg-gray-50 text-gray-500 border border-gray-200'
                                                }`}>
                                                    {isSelected ? (
                                                        <CheckCircle size={16} />
                                                    ) : (
                                                        optionLabels[index]
                                                    )}
                                                </div>
                                                <span className={`text-sm leading-relaxed ${isSelected ? 'text-highlight-dark font-semibold' : 'text-gray-700'}`}>
                                                    {option}
                                                </span>
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Navigation */}
                <div className="flex gap-3 items-center">
                    <button
                        onClick={() => setStep(1)}
                        className="btn-secondary text-xs px-4 py-2.5"
                        disabled={isSubmitting}
                    >
                        <ArrowLeft size={14} /> Quit
                    </button>
                    <div className="flex-1" />
                    {currentQuestion > 0 && (
                        <button
                            onClick={() => setCurrentQuestion(currentQuestion - 1)}
                            className="btn-secondary text-xs px-4 py-2.5"
                            disabled={isSubmitting}
                        >
                            <ArrowLeft size={14} /> Previous
                        </button>
                    )}
                    {/* Question dot indicators */}
                    <div className="hidden md:flex items-center gap-1">
                        {quizQuestions.map((_, i) => (
                            <div
                                key={i}
                                className={`w-2 h-2 rounded-full transition-all duration-200 ${i === currentQuestion
                                    ? 'bg-[var(--brand-orange)] scale-125'
                                    : answers[i] !== undefined
                                        ? 'bg-orange-300'
                                        : 'bg-gray-200'
                                }`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}