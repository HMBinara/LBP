import { useState } from 'react';
import { auth, googleProvider } from '../config/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, signInWithPopup } from 'firebase/auth';
import { motion } from 'framer-motion';
import { Lock, Mail, User, LogIn, UserPlus, Loader2, Sparkles, ShieldCheck, Zap } from 'lucide-react';

export default function Auth({ onAuthSuccess }) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (isLogin) {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
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

    const handleGoogleSignIn = async () => {
        setError('');
        setIsLoading(true);
        try {
            const result = await signInWithPopup(auth, googleProvider);
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
        <div className="min-h-screen gradient-primary flex items-center justify-center p-4 relative overflow-hidden font-sans select-none">

            {/* Floating Background Orbs */}
            <div className="floating-orb floating-orb-orange w-[500px] h-[500px] top-[10%] left-[15%]" />
            <div className="floating-orb floating-orb-blue w-[400px] h-[400px] bottom-[15%] right-[10%]" />
            <div className="floating-orb floating-orb-purple w-[300px] h-[300px] top-[60%] left-[60%]" />

            <div className="perspective-3d w-full max-w-md relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                    className="card-3d glass-light rounded-3xl p-8 relative overflow-hidden"
                >
                    {/* Top Gradient Accent Bar */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--brand-orange)] to-transparent opacity-60" />

                    {/* Header Section */}
                    <div className="flex flex-col items-center mb-7 text-center">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.15, duration: 0.3, ease: [0.175, 0.885, 0.32, 1.275] }}
                            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--brand-orange)] to-[#FF6B00] flex items-center justify-center shadow-lg mb-4"
                            style={{ boxShadow: '0 8px 25px rgba(255, 140, 0, 0.3)' }}
                        >
                            <Sparkles className="text-white w-7 h-7" />
                        </motion.div>
                        <h2 className="text-2xl font-extrabold text-highlight-dark tracking-tight">
                            {isLogin ? 'Welcome Back' : 'Create Account'}
                        </h2>
                        <p className="text-xs text-muted mt-1.5 font-medium max-w-[280px]">
                            {isLogin ? 'Access your dynamic learning workspace' : 'Start your personalized AI roadmap journey'}
                        </p>
                    </div>

                    {/* Tab Switcher */}
                    <div className="flex bg-gray-100/80 p-1 rounded-xl border border-gray-200/50 mb-6">
                        <button
                            type="button"
                            onClick={() => { setIsLogin(true); setError(''); }}
                            className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 ${isLogin
                                ? 'bg-gradient-to-r from-[var(--brand-orange)] to-[#FF6B00] text-white shadow-md'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <LogIn size={14} /> Login
                        </button>
                        <button
                            type="button"
                            onClick={() => { setIsLogin(false); setError(''); }}
                            className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 ${!isLogin
                                ? 'bg-gradient-to-r from-[var(--brand-orange)] to-[#FF6B00] text-white shadow-md'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <UserPlus size={14} /> Sign Up
                        </button>
                    </div>

                    {/* Error Box */}
                    {error && (
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="mb-5 p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-semibold rounded-xl text-center flex items-center justify-center gap-2"
                        >
                            <ShieldCheck size={14} className="flex-shrink-0" />
                            {error}
                        </motion.div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Username (Signup Only) */}
                        {!isLogin && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="space-y-1.5"
                            >
                                <label className="text-xs font-bold text-gray-600 px-1 flex items-center gap-1">
                                    <User size={12} className="text-gray-400" /> Username
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        required
                                        placeholder="John Doe"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="input-light pl-10"
                                    />
                                </div>
                            </motion.div>
                        )}

                        {/* Email */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-600 px-1 flex items-center gap-1">
                                <Mail size={12} className="text-gray-400" /> Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="email"
                                    required
                                    placeholder="name@domain.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input-light pl-10"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-600 px-1 flex items-center gap-1">
                                <Lock size={12} className="text-gray-400" /> Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-light pl-10"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary w-full mt-2"
                        >
                            {isLoading ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : isLogin ? (
                                <>
                                    <LogIn size={16} /> Sign In
                                </>
                            ) : (
                                <>
                                    <Zap size={16} /> Get Started
                                </>
                            )}
                        </button>
                    </form>

                    {/* OR Divider */}
                    <div className="relative my-7">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white/80 backdrop-blur-sm px-4 text-gray-400 font-bold tracking-wider">
                                Or Continue With
                            </span>
                        </div>
                    </div>

                    {/* Google Sign-In */}
                    <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                        className="btn-secondary w-full"
                    >
                        <img
                            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                            alt="Google"
                            className="w-4 h-4 object-contain"
                        />
                        Sign in with Google
                    </button>

                    {/* Bottom Trust Badges */}
                    <div className="flex items-center justify-center gap-4 mt-6 pt-5 border-t border-gray-100">
                        <span className="badge-dark"><ShieldCheck size={12} /> Secure</span>
                        <span className="badge-orange"><Zap size={12} /> AI Powered</span>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}