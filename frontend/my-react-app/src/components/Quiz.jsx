import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';

export default function Quiz({ sessionData, setStep, setFinalPlan }) {
    // Backend එකෙන් ලැබුණු ප්‍රශ්න 10 වෙන් කර ගැනීම
    const quizQuestions = sessionData?.quiz?.quiz || [];
    const sessionId = sessionData?.session_id;

    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // ආරක්ෂිත පියවරක්: කිසියම් හේතුවකින් ප්‍රශ්න ලැබී නොමැති නම්
    if (quizQuestions.length === 0) {
        return (
            <main className="p-6 md:p-12 max-w-xl mx-auto text-center card-light mt-10">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">Quiz Data Missing</h3>
                <p className="text-gray-600 mb-6">Failed to load assessment questions. Please go back and try again.</p>
                <button onClick={() => setStep(1)} className="btn-secondary w-full">← Back to Home</button>
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
            // ප්‍රශ්න 10ම ඉවරයි නම් ස්වයංක්‍රීයව Backend එකට Submit කරනවා
            submitQuizToBackend(newAnswers);
        }
    };

    const submitQuizToBackend = async (finalAnswers) => {
        setIsSubmitting(true);
        setError(null);
        try {
            // Backend එකේ /submit-quiz endpoint එකට දත්ත යැවීම
            const response = await axios.post('http://localhost:5000/submit-quiz', {
                session_id: sessionId,
                answers: finalAnswers
            });

            if (response.data.status === 'completed') {
                // Backend එකෙන් ලැබෙන assessment result සහ final study plan එක state එකට දමනවා
                setFinalPlan({
                    assessment: response.data.assessment,
                    studyPlan: response.data.study_plan,
                    topic: sessionData?.user_input?.topic,
                    duration: sessionData?.user_input?.duration_days
                });
                // කෙලින්ම Glassmorphic Dashboard (Step 3) එකට පරිශීලකයා රැගෙන යාම
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

    // AI එක අපේ ලකුණු විග්‍රහ කර Roadmap එක සාදන තෙක් පෙන්වන Loading Screen එක
    if (isSubmitting) {
        return (
            <main className="flex flex-col items-center justify-center p-12 min-h-[60vh] max-w-xl mx-auto text-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    className="mb-6"
                >
                    <Loader2 className="w-16 h-16 text-highlight-orange" />
                </motion.div>
                <h2 className="text-2xl font-bold text-highlight-dark mb-2">Analyzing Your Answers...</h2>
                <p className="text-muted max-w-md">
                    Our AI Assessor is calculating your expertise level and crafting your customized study tracks. Please wait.
                </p>
            </main>
        );
    }

    return (
        <main className="p-6 md:p-12 max-w-4xl mx-auto">
            <div>
                <h2 className="heading-secondary text-highlight-orange mb-2">Diagnostic Assessment</h2>
                <p className="text-muted mb-6">
                    Question {currentQuestion + 1} of {quizQuestions.length}
                </p>

                {/* Progress Bar */}
                <div className="mb-8 bg-gray-200 rounded-full h-2">
                    <motion.div
                        className="bg-gradient-to-r from-highlight-orange to-highlight-blue h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex gap-3 items-center">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                {/* Question Card */}
                <motion.div
                    key={currentQuestion}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="card-light lift mb-8"
                >
                    <h3 className="text-lg font-semibold text-highlight-dark mb-6">
                        {quizQuestions[currentQuestion].question}
                    </h3>

                    <div className="space-y-3">
                        {quizQuestions[currentQuestion].options.map((option, index) => {
                            const isSelected = answers[currentQuestion] === option;
                            return (
                                <motion.button
                                    key={index}
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    onClick={() => handleAnswerSelect(option)}
                                    className={`w-full p-4 text-left rounded-lg border-2 transition-all ${isSelected
                                        ? 'border-highlight-orange bg-orange-50'
                                        : 'border-gray-200 bg-gray-50 hover:border-orange-300'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected
                                            ? 'border-highlight-orange bg-highlight-orange'
                                            : 'border-gray-400'
                                            }`}>
                                            {isSelected && <span className="text-white text-xs">✓</span>}
                                        </div>
                                        <span className={isSelected ? 'text-highlight-dark font-semibold' : 'text-gray-700'}>
                                            {option}
                                        </span>
                                    </div>
                                </motion.button>
                            );
                        })}
                    </div>
                </motion.div>

                <div className="flex gap-4 pt-6 border-t border-gray-200">
                    <button
                        onClick={() => setStep(1)}
                        className="btn-secondary"
                        disabled={isSubmitting}
                    >
                        ← Quit Quiz
                    </button>
                    <div className="flex-1" />
                    {currentQuestion > 0 && (
                        <button
                            onClick={() => setCurrentQuestion(currentQuestion - 1)}
                            className="btn-secondary"
                            disabled={isSubmitting}
                        >
                            ← Previous
                        </button>
                    )}
                </div>
            </div>
        </main>
    );
}