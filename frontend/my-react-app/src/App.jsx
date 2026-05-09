import { useState } from 'react';
import Hero from './components/Hero';
import Quiz from './components/Quiz';
import Dashboard from './components/Dashboard';

function App() {
  // 1: Topic Input, 2: Quiz, 3: Final Dashboard
  const [step, setStep] = useState(1);

  // Backend එකෙන් ලැබෙන තාවකාලික දත්ත සහ Final Syllabus එක තියාගන්න
  const [sessionData, setSessionData] = useState(null);
  const [finalPlan, setFinalPlan] = useState(null);

  return (
    <div className="min-h-screen bg-brand-dark text-white font-sans selection:bg-brand-orange/30">
      {/* Step 1: User ගෙන් විස්තර ගන්නා තැන */}
      {step === 1 && (
        <Hero
          setStep={setStep}
          setSessionData={setSessionData}
        />
      )}

      {/* Step 2: AI එක හදපු Quiz එක පෙන්වන තැන */}
      {step === 2 && (
        <Quiz
          sessionData={sessionData}
          setStep={setStep}
          setFinalPlan={setFinalPlan}
        />
      )}

      {/* Step 3: Final Personalized Dashboard එක */}
      {step === 3 && (
        <Dashboard studyPlan={finalPlan} />
      )}
    </div>
  );
}

export default App;