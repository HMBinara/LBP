export default function Quiz({ sessionData, setStep, setFinalPlan }) {
    const handleFinish = () => {
        // If backend returned a study plan, promote it; otherwise create a placeholder
        const plan = sessionData?.studyPlan || { message: 'Auto-generated placeholder plan', timestamp: Date.now() };
        setFinalPlan(plan);
        setStep(3);
    };

    return (
        <main className="p-6 md:p-12 max-w-4xl mx-auto">
            <h2 className="heading-secondary text-highlight-orange mb-6">Quick Quiz / Preview</h2>

            {!sessionData && (
                <div className="card-light bg-orange-50 border-2 border-orange-200 mb-6">
                    <p className="text-gray-700 text-sm">No session data available. Please return and start a journey.</p>
                </div>
            )}

            {sessionData && (
                <section className="card-light mb-6 lift">
                    <h3 className="text-sm font-semibold text-highlight-dark mb-3">Session Data</h3>
                    <pre className="whitespace-pre-wrap text-xs bg-gray-50 p-4 rounded overflow-auto max-h-64">{JSON.stringify(sessionData, null, 2)}</pre>
                </section>
            )}

            <div className="flex gap-4 pt-6 border-t border-gray-200">
                <button onClick={() => setStep(1)} className="btn-secondary">
                    ← Back
                </button>
                <button onClick={handleFinish} className="btn-primary">
                    Finish & View Dashboard →
                </button>
            </div>
        </main>
    );
}
