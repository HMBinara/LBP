
export default function Dashboard({ studyPlan }) {
    return (
        <main className="p-6 md:p-12 max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="heading-primary text-highlight-orange">Your Study Dashboard</h1>
                <p className="text-muted text-lg">Personalized learning plan tailored to your goals</p>
            </div>

            {!studyPlan && (
                <div className="card-light bg-gradient-to-r from-orange-50 to-blue-50 border-2 border-orange-300">
                    <div className="text-center py-8">
                        <p className="text-gray-700 text-base font-medium">📋 No study plan available yet.</p>
                        <p className="text-gray-600 text-sm mt-2">Complete the quiz to generate your personalized roadmap.</p>
                    </div>
                </div>
            )}

            {studyPlan && (
                <div className="space-y-6">
                    {/* Plan Overview Card */}
                    <div className="card-light lift">
                        <h2 className="heading-secondary text-highlight-dark mb-4 flex items-center gap-2">
                            <span className="text-2xl">📚</span> Learning Plan
                        </h2>
                        <div className="bg-gradient-primary p-6 rounded-lg border border-gray-200">
                            <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono overflow-auto max-h-96">
                                {JSON.stringify(studyPlan, null, 2)}
                            </pre>
                        </div>
                    </div>

                    {/* Progress Visualization */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="card-light bg-gradient-to-br from-orange-50 to-orange-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-highlight-black text-2xl font-bold">100%</p>
                                    <p className="text-muted text-sm">Completion Rate</p>
                                </div>
                                <span className="text-4xl">✨</span>
                            </div>
                        </div>

                        <div className="card-light bg-gradient-to-br from-blue-50 to-blue-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-highlight-dark text-2xl font-bold">7</p>
                                    <p className="text-muted text-sm">Days Allocated</p>
                                </div>
                                <span className="text-4xl">📅</span>
                            </div>
                        </div>

                        <div className="card-light bg-gradient-to-br from-gray-50 to-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-highlight-black text-2xl font-bold">2h</p>
                                    <p className="text-muted text-sm">Daily Commitment</p>
                                </div>
                                <span className="text-4xl">⏰</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-4">
                        <button className="btn-primary">
                            📖 Start Learning
                        </button>
                        <button className="btn-secondary">
                            💾 Save Plan
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
}
