import { useState } from 'react';
import Hero from './components/Hero';
import Quiz from './components/Quiz';
import Dashboard from './components/Dashboard';

function App() {
  // 1: Topic Input, 2: Quiz, 3: Final Dashboard
  const [step, setStep] = useState(1);

  // Store temporary session data from backend and the final study plan
  const [sessionData, setSessionData] = useState(null);
  const [finalPlan, setFinalPlan] = useState(null);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-orange-200 theme-light gradient-primary">
      {/* Step 1: Collect details from the user */}
      {step === 1 && (
        <Hero
          setStep={setStep}
          setSessionData={setSessionData}
        />
      )}

      {/* Step 2: Show the AI-generated quiz */}
      {step === 2 && (
        <Quiz
          sessionData={sessionData}
          setStep={setStep}
          setFinalPlan={setFinalPlan}
        />
      )}

      {/* Step 3: Final Personalized Dashboard */}
      {step === 3 && (
        <Dashboard studyPlan={finalPlan} />
      )}
    </div>
  );
}

export default App;