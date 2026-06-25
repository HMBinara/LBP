import { useState } from 'react';
import { auth, googleProvider } from '../config/firebase'; // googleProvider එක නිවැරදිව import කරගෙන ඇත
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, signInWithPopup } from 'firebase/auth';
import { motion } from 'framer-motion';
import { Lock, Mail, User, LogIn, UserPlus, Loader2, Sparkles } from 'lucide-react';

export default function Auth({ onAuthSuccess }) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // --- Email & Password Handler ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (isLogin) {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                // 🎯 මෙතනින් මුළු user object එකම (UID එකත් එක්ක) App.jsx එකට යනවා
                onAuthSuccess(userCredential.user);
            } else {
                if (!username.trim()) {
                    throw new Error("Username is required!");
                }
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(userCredential.user, { displayName: username });
                onAuthSuccess(userCredential.user);
            }
        } catch (err) {
            console.error(err);
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                setError('Invalid email or password.');
            } else if (err.code === 'auth/email-already-in-use') {
                setError('This email is already registered.');
            } else if (err.code === 'auth/weak-password') {
                setError('Password should be at least 6 characters.');
            } else {
                setError(err.message || 'Authentication failed. Try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // --- Google OAuth Sign-In Handler ---
    const handleGoogleSignIn = async () => {
        setError('');
        setIsLoading(true);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            // 🎯 Google වලින් ලොග් වුනත් මෙතනින් user object එක App.jsx එකට යනවා
            onAuthSuccess(result.user);
        } catch (err) {
            console.error(err);
            if (err.code !== 'auth/popup-closed-by-user') {
                setError(err.message || 'Google authentication failed.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        // 🎨 Soft Premium Light Background - ඇසට සුවපහසු ශිෂ්‍ය කේන්ද්‍රීය පසුබිම
        <div className="min-h-screen bg-gradient-to-tr from-slate-50 via-zinc-100 to-orange-50/30 flex items-center justify-center p-4 relative overflow-hidden font-sans select-none">

            {/* Soft Background Glows */}
            <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-orange-200/40 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-100/50 rounded-full blur-[140px] pointer-events-none"></div>

            {/* 🛡️ Premium Light Glassmorphic Card */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md bg-white/70 backdrop-blur-xl border border-white shadow-xl shadow-slate-200/50 p-8 rounded-3xl relative z-10"
            >
                {/* Header Section */}
                <div className="flex flex-col items-center mb-6 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-highlight-orange flex items-center justify-center shadow-md shadow-orange-500/20 mb-3">
                        <Sparkles className="text-white w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-extrabold text-highlight-dark tracking-tight">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className="text-xs text-gray-500 mt-1 font-medium">
                        {isLogin ? 'Access your dynamic learning workspace' : 'Start your personalized AI roadmap journey'}
                    </p>
                </div>

                {/* 🎛️ Tab Switcher */}
                <div className="flex bg-gray-100/80 p-1 rounded-xl border border-gray-200/50 mb-6">
                    <button
                        type="button"
                        onClick={() => { setIsLogin(true); setError(''); }}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${isLogin ? 'bg-highlight-orange text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <LogIn size={14} /> Login
                    </button>
                    <button
                        type="button"
                        onClick={() => { setIsLogin(false); setError(''); }}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${!isLogin ? 'bg-highlight-orange text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <UserPlus size={14} /> Sign Up
                    </button>
                </div>

                {/* Error Box */}
                {error && (
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-semibold rounded-xl text-center"
                    >
                        {error}
                    </motion.div>
                )}

                {/* Input Fields Form */}
                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Username Input (Only for Signup) */}
                    {!isLogin && (
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-600 px-1">Username</label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    required
                                    placeholder="John Doe"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-white border border-gray-200 focus:border-highlight-orange focus:ring-1 focus:ring-highlight-orange/20 rounded-xl py-2.5 pl-10 pr-4 text-sm text-highlight-dark placeholder-gray-400 outline-none transition-all"
                                />
                            </div>
                        </div>
                    )}

                    {/* Email Input */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-600 px-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="email"
                                required
                                placeholder="name@domain.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-white border border-gray-200 focus:border-highlight-orange focus:ring-1 focus:ring-highlight-orange/20 rounded-xl py-2.5 pl-10 pr-4 text-sm text-highlight-dark placeholder-gray-400 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-600 px-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="password"
                                required
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white border border-gray-200 focus:border-highlight-orange focus:ring-1 focus:ring-highlight-orange/20 rounded-xl py-2.5 pl-10 pr-4 text-sm text-highlight-dark placeholder-gray-400 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full mt-2 bg-highlight-orange hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl transition-all shadow-md shadow-orange-500/10 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                    >
                        {isLoading ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : isLogin ? (
                            <>Sign In</>
                        ) : (
                            <>Get Started</>
                        )}
                    </button>
                </form>

                {/* ─── 🍊 OR CONTINUE WITH SEPARATOR ─── */}
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white/90 backdrop-blur-sm px-3 text-gray-400 font-bold tracking-wider">Or Register With</span>
                    </div>
                </div>

                {/* 👤 Premium Light Google Sign-In Button */}
                <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 font-bold py-2.5 rounded-xl transition-all shadow-sm text-sm disabled:opacity-50"
                >
                    <img
                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                        alt="Google"
                        className="w-4 h-4 object-contain"
                    />
                    Sign in with Google
                </button>

            </motion.div>
        </div>
    );
}