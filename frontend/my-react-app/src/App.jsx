import { useState, useEffect } from 'react';
import { auth } from './config/firebase'; // firebase.js තියෙන නිවැරදි path එක
import { onAuthStateChanged } from 'firebase/auth';
import Auth from './components/Auth';
import Hero from './components/Hero';
import Quiz from './components/Quiz';
import Dashboard from './components/Dashboard';

function App() {
  // Authentication States
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1: Topic Input (Hero), 2: Quiz, 3: Final Dashboard
  const [step, setStep] = useState(1);

  // Store temporary session data from backend and the final study plan
  const [sessionData, setSessionData] = useState(null);
  const [finalPlan, setFinalPlan] = useState(null);

  // Listen for Firebase Auth State changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Show a loading spinner while Firebase checks the login session
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Rule 1: If the user is NOT logged in, show the Glassmorphic Auth Screen
  if (!user) {
    return <Auth onAuthSuccess={(loggedInUser) => setUser(loggedInUser)} />;
  }

  // Rule 2: If the user IS logged in, show the core application flow
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-orange-200 theme-light gradient-primary">

      {/* Step 1: Collect details from the user */}
      {step === 1 && (
        <Hero
          userId={user.uid} // 🎯 ශිෂ්‍යයාගේ UID එක Hero එකට පාස් කරනවා (History එකක් ගන්න ඕන වුණොත් පාවිච්චි කරන්න)
          setStep={setStep}
          setSessionData={setSessionData}
        />
      )}

      {/* Step 2: Show the AI-generated quiz */}
      {step === 2 && (
        <Quiz
          userId={user.uid} // 🎯 ශිෂ්‍යයාගේ UID එක Quiz එකට පාස් කරනවා (Firestore එකේ වෙන වෙනම සේව් කරන්න)
          sessionData={sessionData}
          setStep={setStep}
          setFinalPlan={setFinalPlan}
        />
      )}

      {/* Step 3: Final Personalized Dashboard */}
      {step === 3 && (
        <Dashboard finalPlan={finalPlan} setStep={setStep} />
      )}

    </div>
  );
}

export default App;