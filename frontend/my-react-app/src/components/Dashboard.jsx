import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, CheckSquare, PlayCircle, Award, Clock, ArrowLeft, BookOpen, Sparkles, FileText, ArrowRight, ExternalLink } from 'lucide-react';

export default function Dashboard({ finalPlan, setStep }) {
    const skillLevel = finalPlan?.skill_level || 'Beginner';
    const score = Number.isFinite(finalPlan?.score) ? finalPlan.score : 0;
    const roadmap = Array.isArray(finalPlan?.roadmap) ? finalPlan.roadmap : [];
    const topic = finalPlan?.topic || 'Selected Topic';
    const totalDays = finalPlan?.duration || roadmap.length || 0;

    const [selectedDayIndex, setSelectedDayIndex] = useState(0);
    const [completedTasks, setCompletedTasks] = useState({});
    const [showRoadmap, setShowRoadmap] = useState(false);
    const [activeTab, setActiveTab] = useState('roadmap'); // 'roadmap' | 'notes'

    // නවතම State එක: දැනට Full Page එකක් විදිහට බලන Day එක track කරන්න (null නම් Dashboard එක පෙනෙයි)
    const [fullViewDayData, setFullViewDayData] = useState(null);

    const currentDayData = roadmap?.[selectedDayIndex] || null;
    const embedDay = useMemo(() => (totalDays >= 3 ? totalDays - 2 : totalDays), [totalDays]);

    const toggleTask = (dayNumber, taskIndex) => {
        const key = `${dayNumber}-${taskIndex}`;
        setCompletedTasks(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const getEmbedUrl = (resource) => {
        const url = resource?.embed_url || resource?.url || '';
        if (!url) return null;
        if (url.includes('/embed/')) return url;
        const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
    };

    if (!finalPlan) {
        return (
            <main className="p-6 md:p-12 max-w-4xl mx-auto text-center card-light mt-10">
                <h3 className="text-xl font-bold text-gray-800 mb-2">No Active Study Roadmap</h3>
                <p className="text-gray-600 mb-6">Please complete the assessment quiz first to generate your custom dashboard.</p>
                <button onClick={() => setStep(1)} className="btn-primary">Generate Plan</button>
            </main>
        );
    }

    if (!showRoadmap) {
        return (
            <main className="p-6 md:p-12 max-w-4xl mx-auto">
                <div className="card-light rounded-3xl p-8 md:p-10 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-6">
                        <Sparkles className="text-highlight-orange" size={20} />
                        <span className="text-highlight-orange font-bold tracking-widest text-sm uppercase">Assessment Complete</span>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-extrabold text-highlight-dark mb-3">
                        Your Skill Level is Ready
                    </h1>
                    <p className="text-muted text-lg mb-8">
                        We analyzed your 10 quiz answers and calculated your learning level. Click below to generate your personalized roadmap.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                        <div className="px-4 py-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
                            <Award className="w-5 h-5 text-highlight-orange" />
                            <div>
                                <p className="text-xs text-gray-400 font-medium">Skill Level</p>
                                <p className="text-sm font-bold text-highlight-dark">{skillLevel}</p>
                            </div>
                        </div>
                        <div className="px-4 py-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
                            <CheckSquare className="w-5 h-5 text-highlight-blue" />
                            <div>
                                <p className="text-xs text-gray-400 font-medium">Score</p>
                                <p className="text-sm font-bold text-highlight-dark">{score}/10</p>
                            </div>
                        </div>
                        <div className="px-4 py-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-emerald-500" />
                            <div>
                                <p className="text-xs text-gray-400 font-medium">Duration</p>
                                <p className="text-sm font-bold text-highlight-dark">{totalDays} Days</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={() => setShowRoadmap(true)}
                            className="btn-primary flex-1"
                        >
                            Generate Plan
                        </button>
                        <button
                            onClick={() => setStep(1)}
                            className="btn-secondary flex-1"
                        >
                            Start Over
                        </button>
                    </div>
                </div>
            </main>
        );
    }

    const isRevisionDay = currentDayData ? currentDayData.day > embedDay : false;

    // --- මචං, මෙතනින් තමයි අලුත් SEPARATE PAGE / FULL VIEW එක Render වෙන්නේ ---
    if (fullViewDayData) {
        const isFullRevisionDay = fullViewDayData.day > embedDay;
        return (
            <motion.main
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-4 md:p-8 max-w-5xl mx-auto text-slate-800"
            >
                {/* Back to Dashboard Button */}
                <button
                    onClick={() => setFullViewDayData(null)}
                    className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-highlight-orange transition-colors mb-6 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 w-fit"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </button>

                {/* Page Title Header */}
                <div className="bg-white border border-gray-100 p-6 md:p-8 rounded-2xl shadow-sm mb-8">
                    <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${isFullRevisionDay ? 'bg-purple-50 text-purple-700' : 'bg-orange-50 text-highlight-orange'}`}>
                        Day {fullViewDayData.day} Full Study Module
                    </span>
                    <h1 className="text-2xl md:text-4xl font-extrabold text-highlight-dark mt-3">
                        {(fullViewDayData.topics && fullViewDayData.topics.join(' • ')) || `Day ${fullViewDayData.day}`}
                    </h1>
                    <p className="text-muted mt-2 flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-gray-400" /> Estimated Study Time: <span className="font-semibold text-gray-700">{fullViewDayData.estimated_time || 'N/A'}</span>
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column: Tasks Checklist */}
                    <div className="md:col-span-1 space-y-4">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                            <CheckSquare className="w-4 h-4 text-highlight-blue" /> Tasks Checklist
                        </h3>
                        <div className="space-y-2.5">
                            {(fullViewDayData.tasks || []).map((task, tIdx) => {
                                const isChecked = !!completedTasks[`${fullViewDayData.day}-${tIdx}`];
                                return (
                                    <div
                                        key={tIdx}
                                        onClick={() => toggleTask(fullViewDayData.day, tIdx)}
                                        className={`p-3.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer bg-white ${isChecked ? 'opacity-60 border-gray-200' : 'border-gray-100 hover:border-orange-200'}`}
                                    >
                                        <div className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-colors ${isChecked ? 'bg-highlight-blue border-highlight-blue text-white' : 'border-gray-300'}`}>
                                            {isChecked && <span className="text-xs font-bold">✓</span>}
                                        </div>
                                        <span className={`text-sm leading-relaxed ${isChecked ? 'line-through text-gray-400' : 'text-gray-700 font-medium'}`}>
                                            {task}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Column: Video Resources and Extended Notes */}
                    <div className="md:col-span-2 space-y-6">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                            <BookOpen className="w-4 h-4 text-highlight-orange" /> Study Materials & Briefing
                        </h3>

                        {fullViewDayData.resources?.length > 0 ? (
                            fullViewDayData.resources.map((resource, rIdx) => {
                                const embedUrl = getEmbedUrl(resource);
                                return (
                                    <div key={rIdx} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-4">
                                        <div>
                                            <h4 className="font-bold text-highlight-dark text-base">{resource.title}</h4>
                                            <p className="text-sm text-muted mt-1 leading-relaxed">{resource.summary || 'No extensive summaries provided.'}</p>
                                        </div>

                                        {embedUrl ? (
                                            <div className="aspect-video w-full rounded-xl overflow-hidden border border-gray-200 bg-black shadow-inner">
                                                <iframe
                                                    className="w-full h-full"
                                                    src={embedUrl}
                                                    title={resource.title}
                                                    frameBorder="0"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                ></iframe>
                                            </div>
                                        ) : (
                                            <a
                                                href={resource.embed_url || resource.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn-primary text-xs inline-flex items-center gap-1"
                                            >
                                                Open External Resource <ExternalLink size={12} />
                                            </a>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="bg-gray-50 border border-gray-100 p-6 rounded-xl text-center italic text-gray-500 text-sm">
                                No specific resource materials available for this block. Use today for mock implementation challenges!
                            </div>
                        )}

                        {/* Core Architecture Section */}
                        <div className="bg-slate-50 border border-gray-100 rounded-xl p-5">
                            <h4 className="text-sm font-bold text-gray-700 mb-3">Key Structural Concepts to Retain</h4>
                            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
                                {(fullViewDayData.topics || []).map((tp, i) => (
                                    <li key={i}>Deep-dive technical patterns of <span className="font-semibold text-gray-800">{tp}</span></li>
                                ))}
                                <li>Ensure clean formatting, syntax adherence, and decoupled modular integration.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </motion.main>
        );
    }

    // --- සාමාන්‍ය DASHBOARD VIEW එක (මුකුත් Click කරලා නැති වෙලාවට) ---
    return (
        <main className="p-4 md:p-8 max-w-7xl mx-auto text-slate-800">
            {/* Header Section */}
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

                <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-3 px-4 py-2 bg-white/80 backdrop-blur-md rounded-xl border border-gray-100 shadow-sm">
                        <Award className="w-5 h-5 text-highlight-orange" />
                        <div>
                            <p className="text-xs text-gray-400 font-medium">Diagnosed Level</p>
                            <p className="text-sm font-bold text-highlight-dark">{skillLevel} ({score}/10)</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 px-4 py-2 bg-white/80 backdrop-blur-md rounded-xl border border-gray-100 shadow-sm">
                        <Calendar className="w-5 h-5 text-highlight-blue" />
                        <div>
                            <p className="text-xs text-gray-400 font-medium">Timeline</p>
                            <p className="text-sm font-bold text-highlight-dark">{totalDays} Days Track</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-gray-200 mb-6 gap-2">
                <button
                    onClick={() => setActiveTab('roadmap')}
                    className={`flex items-center gap-2 px-4 py-2.5 font-semibold text-sm transition-all border-b-2 ${activeTab === 'roadmap' ? 'border-highlight-orange text-highlight-orange' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    <Calendar className="w-4 h-4" /> Roadmap Plan
                </button>
                <button
                    onClick={() => setActiveTab('notes')}
                    className={`flex items-center gap-2 px-4 py-2.5 font-semibold text-sm transition-all border-b-2 ${activeTab === 'notes' ? 'border-highlight-orange text-highlight-orange' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    <FileText className="w-4 h-4" /> Study Notes
                </button>
            </div>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Left Side: Days List */}
                <div className="lg:col-span-4 space-y-3 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400 px-1">Your Course Schedule</p>
                    {roadmap.map((day, index) => {
                        const isSelected = selectedDayIndex === index;
                        const isDayRevision = day.day > embedDay;

                        return (
                            <motion.button
                                key={index}
                                whileHover={{ x: 4 }}
                                onClick={() => setSelectedDayIndex(index)}
                                className={`w-full p-4 rounded-xl text-left border transition-all flex items-center justify-between ${isSelected ? 'bg-gradient-to-r from-orange-50 to-orange-100/50 border-highlight-orange/50 shadow-sm' : 'bg-white border-gray-100 hover:border-orange-200'}`}
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 ${isSelected ? 'bg-highlight-orange text-white' : isDayRevision ? 'bg-purple-50 text-purple-600 border border-purple-100' : 'bg-gray-50 text-gray-600'}`}>
                                        D{day.day}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className={`text-sm font-semibold truncate ${isSelected ? 'text-highlight-dark' : 'text-gray-700'}`}>
                                            {(day.topics && day.topics[0]) || `Day ${day.day}`}
                                        </h4>
                                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                            <Clock className="w-3 h-3" /> {day.estimated_time || 'Allocated hours'}
                                        </p>
                                    </div>
                                </div>

                                {isDayRevision && (
                                    <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded-full uppercase flex-shrink-0">
                                        Revision
                                    </span>
                                )}
                            </motion.button>
                        );
                    })}
                </div>

                {/* Right Side: Dynamic Content Panel with Page Navigation Link */}
                <div className="lg:col-span-8">
                    <AnimatePresence mode="wait">
                        {currentDayData && (
                            <motion.div
                                key={`${selectedDayIndex}-${activeTab}`}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ duration: 0.2 }}
                                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
                            >
                                {/* Top info card bar */}
                                <div className="border-b border-gray-100 pb-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div>
                                        <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${isRevisionDay ? 'bg-purple-50 text-purple-700' : 'bg-orange-50 text-highlight-orange'}`}>
                                            Day {currentDayData.day} {activeTab === 'notes' ? 'Study Notes' : 'Focus'}
                                        </span>
                                        <h2 className="text-xl font-bold text-highlight-dark mt-2">
                                            {(currentDayData.topics && currentDayData.topics.join(' • ')) || `Day ${currentDayData.day}`}
                                        </h2>
                                    </div>

                                    {/* මචං, මෙන්න මේ බටන් එක ක්ලික් කරාම තමයි වෙනම ෆුල් පේජ් එකකට යන්නේ */}
                                    <button
                                        onClick={() => setFullViewDayData(currentDayData)}
                                        className="text-xs font-bold text-white bg-highlight-orange hover:bg-orange-600 px-3.5 py-2 rounded-xl flex items-center gap-1 shadow-sm transition-all self-start sm:self-auto"
                                    >
                                        Deep-dive Topic <ArrowRight size={14} />
                                    </button>
                                </div>

                                {/* TAB 1: ROADMAP VIEW */}
                                {activeTab === 'roadmap' && (
                                    <>
                                        {isRevisionDay ? (
                                            <div className="mb-6 bg-gradient-to-br from-purple-50 via-indigo-50/30 to-white border border-purple-100 rounded-xl p-5 relative overflow-hidden">
                                                <div className="absolute right-4 top-4 text-purple-200/50 pointer-events-none">
                                                    <Sparkles className="w-24 h-24 stroke-[1.5]" />
                                                </div>
                                                <div className="flex gap-3 items-start relative z-10">
                                                    <div className="p-2.5 bg-purple-600 text-white rounded-xl shadow-md flex-shrink-0">
                                                        <BookOpen className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-purple-900 text-base">🎯 Target Practice & Revision Mode Active</h3>
                                                        <p className="text-purple-700/90 text-sm mt-1 max-w-xl">
                                                            The core syllabus is complete. Use these final days for mock challenges, review, and implementation practice.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : currentDayData.resources?.length > 0 ? (
                                            <div className="mb-6 space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                                        <PlayCircle className="w-3.5 h-3.5 text-red-500" /> Core Video Resources
                                                    </p>
                                                    <button
                                                        onClick={() => setActiveTab('notes')}
                                                        className="text-xs font-semibold text-highlight-orange hover:underline flex items-center gap-1"
                                                    >
                                                        <FileText size={12} /> View Day Notes
                                                    </button>
                                                </div>
                                                <div className="grid gap-4">
                                                    {currentDayData.resources.map((resource, resourceIndex) => {
                                                        const embedUrl = getEmbedUrl(resource);
                                                        return (
                                                            <div key={resourceIndex} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                                                                <h3 className="font-semibold text-highlight-dark mb-2">{resource.title}</h3>
                                                                <p className="text-sm text-muted mb-4">{resource.summary}</p>
                                                                {embedUrl ? (
                                                                    <div className="aspect-video w-full rounded-xl overflow-hidden border border-gray-200 bg-black shadow-inner">
                                                                        <iframe
                                                                            className="w-full h-full"
                                                                            src={embedUrl}
                                                                            title={resource.title}
                                                                            frameBorder="0"
                                                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                            allowFullScreen
                                                                        ></iframe>
                                                                    </div>
                                                                ) : (
                                                                    <a
                                                                        href={resource.embed_url || resource.url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="btn-primary text-xs inline-flex whitespace-nowrap"
                                                                    >
                                                                        Open Resource →
                                                                    </a>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ) : null}

                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                                                <CheckSquare className="w-3.5 h-3.5 text-highlight-blue" /> Actionable Objectives For Today
                                            </p>
                                            <div className="space-y-2.5">
                                                {(currentDayData.tasks || []).map((task, tIdx) => {
                                                    const isChecked = !!completedTasks[`${currentDayData.day}-${tIdx}`];
                                                    return (
                                                        <div
                                                            key={tIdx}
                                                            onClick={() => toggleTask(currentDayData.day, tIdx)}
                                                            className={`p-3.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${isChecked ? 'bg-slate-50/80 border-gray-200/60 opacity-60' : 'bg-white border-gray-100 hover:border-orange-200'}`}
                                                        >
                                                            <div className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-colors ${isChecked ? 'bg-highlight-blue border-highlight-blue text-white' : 'border-gray-300'}`}>
                                                                {isChecked && <span className="text-xs font-bold">✓</span>}
                                                            </div>
                                                            <span className={`text-sm leading-relaxed ${isChecked ? 'line-through text-gray-400' : 'text-gray-700 font-medium'}`}>
                                                                {task}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* TAB 2: NOTES VIEW */}
                                {activeTab === 'notes' && (
                                    <div className="space-y-6">
                                        <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-4 flex gap-3">
                                            <BookOpen className="text-highlight-orange w-5 h-5 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <h4 className="font-bold text-gray-800 text-sm">Comprehensive Briefing</h4>
                                                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                                                    Review core concepts, summaries, and structural documentations compiled explicitly for Day {currentDayData.day}.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="prose prose-slate max-w-none">
                                            <h3 className="text-lg font-bold text-highlight-dark mb-2">Topic Summary & Key Notes</h3>
                                            {currentDayData.resources?.length > 0 ? (
                                                currentDayData.resources.map((res, rIdx) => (
                                                    <div key={rIdx} className="mb-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                                        <h5 className="font-semibold text-sm text-gray-800 mb-1">{res.title}</h5>
                                                        <p className="text-sm text-gray-600 leading-relaxed">{res.summary || 'No extensive note summaries provided for this resource.'}</p>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-sm text-gray-500 italic">No resource descriptions available for this revision day. Focus on final objectives!</p>
                                            )}

                                            <div className="mt-6 border-t border-gray-100 pt-4">
                                                <h4 className="text-sm font-bold text-gray-700 mb-2">Core Concepts To Remember</h4>
                                                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                                                    {(currentDayData.topics || []).map((tp, i) => (
                                                        <li key={i}>Deep-dive core architecture of <span className="font-semibold text-gray-800">{tp}</span></li>
                                                    ))}
                                                    <li>Implement practical hands-on patterns.</li>
                                                </ul>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => setActiveTab('roadmap')}
                                            className="mt-4 text-xs font-bold text-white bg-highlight-dark hover:bg-gray-800 px-4 py-2 rounded-lg transition-all inline-flex items-center gap-1"
                                        >
                                            ← Back To Task Checklist
                                        </button>
                                    </div>
                                )}

                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </main>
    );
}