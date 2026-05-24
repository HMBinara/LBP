import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, CheckSquare, PlayCircle, Award, Clock, ArrowLeft, BookOpen, Sparkles } from 'lucide-react';

export default function Dashboard({ finalPlan, setStep }) {
    // Backend එකෙන් Quiz එක ඉවර වුණාම ලැබෙන data වෙන් කර ගැනීම
    const skillLevel = finalPlan?.skill_level || 'Beginner';
    const score = finalPlan?.score ?? 0;
    const roadmap = Array.isArray(finalPlan?.roadmap) ? finalPlan.roadmap : [];
    const resources = Array.isArray(finalPlan?.resources) ? finalPlan.resources : [];
    const topic = finalPlan?.topic || 'Selected Topic';
    const totalDays = finalPlan?.duration || roadmap.length || 0;

    const [selectedDayIndex, setSelectedDayIndex] = useState(0);
    const [completedTasks, setCompletedTasks] = useState({});

    const currentDayData = roadmap?.[selectedDayIndex] || null;

    // Task එකක් check / uncheck කරන කොට state එක update කිරීම
    const toggleTask = (dayNumber, taskIndex) => {
        const key = `${dayNumber}-${taskIndex}`;
        setCompletedTasks(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    // YouTube URL එක embed URL එකකට හරවා ගැනීම (Player එක ඇතුළේ ප්ලේ වෙන්න)
    const getEmbedUrl = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
    };

    // ආරක්ෂිත පියවරක්: කිසියම් හේතුවකින් plan එක load වී නොමැති නම්
    if (!studyPlan || !studyPlan.days || studyPlan.days.length === 0) {
        return (
            <main className="p-6 md:p-12 max-w-4xl mx-auto text-center card-light mt-10">
                <h3 className="text-xl font-bold text-gray-800 mb-2">No Active Study Roadmap</h3>
                <p className="text-gray-600 mb-6">Please complete the assessment quiz first to generate your custom dashboard.</p>
                <button onClick={() => setStep(1)} className="btn-primary">Generate Plan</button>
            </main>
        );
    }

    // අන්තිම දවස් 2 Revision ද කියලා check කරන ලොජික් එක
    const isRevisionDay = currentDayData ? (currentDayData.day > (totalDays - 2)) : false;

    return (
        <main className="p-4 md:p-8 max-w-7xl mx-auto text-slate-800">
            {/* Header Area */}
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

                {/* Top Status Badges */}
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

            {/* Main Content Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Left Sidebar: Timeline Days Navigation (4 Cols) */}
                <div className="lg:col-span-4 space-y-3 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400 px-1">Your Roadmap Plan</p>
                    {roadmap.map((day, index) => {
                        const isSelected = selectedDayIndex === index;
                        const isDayRevision = day.day > (totalDays - 2);

                        return (
                            <motion.button
                                key={index}
                                whileHover={{ x: 4 }}
                                onClick={() => setSelectedDayIndex(index)}
                                className={`w-full p-4 rounded-xl text-left border transition-all flex items-center justify-between ${isSelected
                                    ? 'bg-gradient-to-r from-orange-50 to-orange-100/50 border-highlight-orange/50 shadow-sm'
                                    : 'bg-white border-gray-100 hover:border-orange-200'
                                    }`}
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 ${isSelected
                                        ? 'bg-highlight-orange text-white'
                                        : isDayRevision ? 'bg-purple-50 text-purple-600 border border-purple-100' : 'bg-gray-50 text-gray-600'
                                        }`}>
                                        D{day.day}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className={`text-sm font-semibold truncate ${isSelected ? 'text-highlight-dark' : 'text-gray-700'}`}>
                                            {day.focus}
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

                {/* Right Area: Main Dynamic Workplace Screen (8 Cols) */}
                <div className="lg:col-span-8">
                    <AnimatePresence mode="wait">
                        {currentDayData && (
                            <motion.div
                                key={selectedDayIndex}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ duration: 0.2 }}
                                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
                            >
                                {/* Header of Content Card */}
                                <div className="border-b border-gray-100 pb-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div>
                                        <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${isRevisionDay ? 'bg-purple-50 text-purple-700' : 'bg-orange-50 text-highlight-orange'
                                            }`}>
                                            Day {currentDayData.day} Focus
                                        </span>
                                        <h2 className="text-xl font-bold text-highlight-dark mt-2">{currentDayData.focus}</h2>
                                    </div>
                                    <div className="text-sm text-gray-400 font-medium flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg self-start sm:self-auto">
                                        <Clock className="w-4 h-4 text-gray-400" /> {currentDayData.estimated_time} Expected
                                    </div>
                                </div>

                                {/* Dynamic Learning Block (Video vs Revision Alert) */}
                                {isRevisionDay ? (
                                    /* Revision Buffer View (For Last 2 Days) */
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
                                                    මචං, අපි මුළු core syllabus එකම කලින් ඉවර කරපු නිසා මේ අන්තිම දවස් 2 වෙන් කරලා තියෙන්නේ ඔයාගේ ඉලක්කය වෙනුවෙන්මයි.
                                                    පහත සඳහන් Mock Challenges සහ Revision Tasks ටික සම්පූර්ණ කරලා ඔයාගේ target එක 100%ක්ම ෂුවර් කරගන්න!
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* Regular Core Syllabus Learning View (YouTube Player) */
                                    currentDayData.video_url && (
                                        <div className="mb-6">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                                <PlayCircle className="w-3.5 h-3.5 text-red-500" /> Core Video Resource
                                            </p>
                                            {getEmbedUrl(currentDayData.video_url) ? (
                                                <div className="aspect-video w-full rounded-xl overflow-hidden border border-gray-200 bg-black shadow-inner">
                                                    <iframe
                                                        className="w-full h-full"
                                                        src={getEmbedUrl(currentDayData.video_url)}
                                                        title={currentDayData.focus}
                                                        frameBorder="0"
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        allowFullScreen
                                                    ></iframe>
                                                </div>
                                            ) : (
                                                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between">
                                                    <span className="text-sm font-medium text-gray-600 truncate mr-2">{currentDayData.video_url}</span>
                                                    <a
                                                        href={currentDayData.video_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="btn-primary text-xs whitespace-nowrap"
                                                    >
                                                        Open Video External →
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    )
                                )}

                                {/* Actionable Tasks Checkbox List */}
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                                        <CheckSquare className="w-3.5 h-3.5 text-highlight-blue" /> Actionable Objectives For Today
                                    </p>
                                    <div className="space-y-2.5">
                                        {currentDayData.tasks?.map((task, tIdx) => {
                                            const isChecked = !!completedTasks[`${currentDayData.day}-${tIdx}`];
                                            return (
                                                <div
                                                    key={tIdx}
                                                    onClick={() => toggleTask(currentDayData.day, tIdx)}
                                                    className={`p-3.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${isChecked
                                                        ? 'bg-slate-50/80 border-gray-200/60 opacity-60'
                                                        : isRevisionDay ? 'bg-white border-purple-100 hover:border-purple-300' : 'bg-white border-gray-100 hover:border-orange-200'
                                                        }`}
                                                >
                                                    <div className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-colors ${isChecked
                                                        ? 'bg-highlight-blue border-highlight-blue text-white'
                                                        : isRevisionDay ? 'border-purple-300' : 'border-gray-300'
                                                        }`}>
                                                        {isChecked && <span className="text-xs font-bold">✓</span>}
                                                    </div>
                                                    <span className={`text-sm leading-relaxed ${isChecked ? 'line-through text-gray-400' : 'text-gray-700 font-medium'
                                                        }`}>
                                                        {task}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

            </div>

            {resources.length > 0 && (
                <section className="mt-8 card-light">
                    <h3 className="text-xl font-bold text-highlight-dark mb-4">Curated Resources</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                        {resources.map((resource, index) => (
                            <a
                                key={index}
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block p-4 rounded-xl border border-gray-200 hover:border-orange-300 bg-white transition-all"
                            >
                                <h4 className="font-semibold text-highlight-dark mb-1">{resource.title}</h4>
                                <p className="text-sm text-muted">{resource.reason_for_picking}</p>
                            </a>
                        ))}
                    </div>
                </section>
            )}
        </main>
    );
}