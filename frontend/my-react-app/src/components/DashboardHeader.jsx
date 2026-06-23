import { ArrowLeft, Award, Calendar, FolderOpen, Loader2, Save } from 'lucide-react';

export default function DashboardHeader({
    topic,
    skillLevel,
    score,
    totalDays,
    setStep,
    handleSaveRoadmap,
    handleViewHistory,
    isSaving
}) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
                <button
                    onClick={() => setStep(1)}
                    className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-highlight-orange transition-colors mb-2"
                >
                    <ArrowLeft className="w-4 h-4" /> Reset & Start New
                </button>
                <h1 className="text-3xl font-extrabold text-highlight-dark bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    {`${topic} Learning Roadmap`}
                </h1>
                <p className="text-muted">Mastering <span className="font-semibold text-gray-700">{topic}</span> dynamically</p>
            </div>

            {/* Save, History & Analytics Section */}
            <div className="flex flex-wrap gap-2 items-center">
                <button
                    onClick={handleSaveRoadmap}
                    disabled={isSaving}
                    className="px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                >
                    {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    {isSaving ? 'Saving...' : 'Save Plan'}
                </button>
                <button
                    onClick={handleViewHistory}
                    className="px-3.5 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
                >
                    <FolderOpen size={14} className="text-highlight-orange" /> History
                </button>

                <div className="h-6 w-[1px] bg-gray-200 mx-1 hidden sm:block"></div>

                <div className="flex items-center gap-3 px-4 py-2 bg-white/80 backdrop-blur-md rounded-xl border border-gray-100 shadow-sm">
                    <Award className="w-5 h-5 text-highlight-orange" />
                    <div>
                        <p className="text-xs text-gray-400 font-medium">Diagnosed Level</p>
                        <p className="text-sm font-bold text-highlight-dark">{skillLevel} ({score}/10)</p>
                    </div>
                </div>
            </div>
        </div>
    );
}