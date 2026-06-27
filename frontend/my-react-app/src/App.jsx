import { useState, useEffect } from 'react';
import { auth } from './config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import Auth from './components/Auth';
import Landing from './components/Landing';
import Sidebar from './components/Sidebar';
import Hero from './components/Hero';
import Quiz from './components/Quiz';
import Dashboard from './components/Dashboard';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0); // 0: Landing, 1: Hero, 2: Quiz, 3: Dashboard
  const [sessionData, setSessionData] = useState(null);
  const [finalPlan, setFinalPlan] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Load a roadmap selected from the Sidebar's "Roadmap History"
  const handleSelectRoadmap = (savedRoadmap) => {
    setFinalPlan(savedRoadmap.plan || savedRoadmap);
    setStep(3);
  };

  // Premium Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen gradient-primary flex flex-col items-center justify-center gap-4 relative overflow-hidden">
        <div className="floating-orb floating-orb-orange w-96 h-96 top-10 left-10" />
        <div className="floating-orb floating-orb-blue w-80 h-80 bottom-20 right-20" />

        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
        >
          <Loader2 className="w-10 h-10 text-highlight-orange" />
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm font-semibold text-highlight-dark tracking-wide"
        >
          Initializing LearnPath AI...
        </motion.p>
      </div>
    );
  }

  // Landing Page → always shown first, regardless of login state, no sidebar
  if (step === 0) {
    return <Landing onGetStarted={() => setStep(1)} />;
  }

  // Not logged in → Full-screen Auth (no sidebar)
  if (!user) {
    return <Auth onAuthSuccess={(loggedInUser) => setUser(loggedInUser)} />;
  }

  // Logged in, Step 1+ → Sidebar + Main Content
  return (
    <div className="min-h-screen font-sans theme-light gradient-primary selection:bg-orange-200 perspective-3d flex">
      <Sidebar
        user={user}
        onSelectRoadmap={handleSelectRoadmap}
      />

      <div className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="hero"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            >
              <Hero
                userId={user.uid}
                setStep={setStep}
                setSessionData={setSessionData}
              />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            >
              <Quiz
                userId={user.uid}
                sessionData={sessionData}
                setStep={setStep}
                setFinalPlan={setFinalPlan}
              />
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            >
              <Dashboard finalPlan={finalPlan} setStep={setStep} userId={user?.uid} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;