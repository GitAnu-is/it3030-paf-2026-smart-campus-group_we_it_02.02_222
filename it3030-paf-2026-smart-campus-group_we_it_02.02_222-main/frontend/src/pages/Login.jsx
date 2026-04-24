import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { Building2, Eye, EyeOff, LogIn, AlertCircle, Loader2, } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
export function Login() {
    const { loginWithCredentials, loginWithGoogle } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/';
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!username.trim() || !password.trim()) {
            setError('Please enter both username and password.');
            return;
        }
        setIsLoading(true);
        const result = await loginWithCredentials(username, password);
        setIsLoading(false);
        if (result.success) {
            navigate(from, {
                replace: true,
            });
        }
        else {
            setError(result.error || 'Login failed.');
        }
    };
    const handleGoogleCredential = async (idToken) => {
      setError('');
      if (!idToken) {
        setError('Google sign-in did not return a credential.');
        return;
      }
      setIsLoading(true);
      const result = await loginWithGoogle(idToken);
      setIsLoading(false);
      if (result.success) {
        navigate(from, { replace: true });
      }
      else {
        setError(result.error || 'Google sign-in failed.');
      }
    };
    return (<div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute top-1/4 -right-24 w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute -bottom-24 left-1/3 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <motion.div initial={{
            opacity: 0,
            y: -20,
        }} animate={{
            opacity: 1,
            y: 0,
        }} className="flex justify-center">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30">
            <Building2 className="w-8 h-8 text-white"/>
          </div>
        </motion.div>
        <motion.h2 initial={{
            opacity: 0,
        }} animate={{
            opacity: 1,
        }} transition={{
            delay: 0.1,
        }} className="mt-6 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          UniOps Platform
        </motion.h2>
        <motion.p initial={{
            opacity: 0,
        }} animate={{
            opacity: 1,
        }} transition={{
            delay: 0.2,
        }} className="mt-2 text-center text-sm text-slate-600">
          Sign in to manage facilities, bookings, and maintenance.
        </motion.p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <motion.div initial={{
            opacity: 0,
            y: 20,
        }} animate={{
            opacity: 1,
            y: 0,
        }} transition={{
            delay: 0.3,
        }} className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">
          {/* Username / Password Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1.5">
                Username
              </label>
              <input id="username" type="text" autoComplete="username" value={username} onChange={(e) => {
            setUsername(e.target.value);
            setError('');
        }} placeholder="Enter your username" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"/>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(e) => {
            setPassword(e.target.value);
            setError('');
        }} placeholder="Enter your password" className="w-full px-4 py-2.5 pr-11 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"/>
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  {showPassword ? (<EyeOff className="w-4 h-4"/>) : (<Eye className="w-4 h-4"/>)}
                </button>
              </div>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (<motion.div initial={{
                opacity: 0,
                y: -8,
            }} animate={{
                opacity: 1,
                y: 0,
            }} exit={{
                opacity: 0,
                y: -8,
            }} className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0"/>
                  <p className="text-sm text-red-700">{error}</p>
                </motion.div>)}
            </AnimatePresence>

            <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center py-2.5 px-4 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 focus:ring-4 focus:ring-primary-200 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-sm">
              {isLoading ? (<Loader2 className="w-4 h-4 animate-spin mr-2"/>) : (<LogIn className="w-4 h-4 mr-2"/>)}
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"/>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-slate-500">
                Or continue with
              </span>
            </div>
          </div>

          {/* Google Sign-In */}
          <div className="mt-6">
            <div className="flex justify-center">
              {googleClientId ? (<GoogleLogin onSuccess={(credentialResponse) => handleGoogleCredential(credentialResponse?.credential)} onError={() => setError('Google sign-in failed.')} width="360"/>) : (<button type="button" disabled className="w-full flex items-center justify-center py-2.5 px-4 border border-slate-300 rounded-lg shadow-sm bg-slate-50 text-sm font-medium text-slate-400 cursor-not-allowed">
                  Sign in with Google
                </button>)}
            </div>
          </div>
        </motion.div>
      </div>
    </div>);
}
