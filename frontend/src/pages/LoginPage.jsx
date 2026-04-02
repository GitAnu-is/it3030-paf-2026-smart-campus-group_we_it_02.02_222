import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  GraduationCapIcon,
  UserIcon,
  ShieldIcon,
  WrenchIcon } from
'lucide-react';
import { useAuth } from '../context/AuthContext';
export function LoginPage() {
  const { login, loginWithGoogleCredential } = useAuth();
  const googleClientId = useMemo(() => import.meta.env.VITE_GOOGLE_CLIENT_ID, []);
  const googleBtnRef = useRef(null);
  const googleInitRef = useRef(false);
  const [googleError, setGoogleError] = useState('');

  useEffect(() => {
    if (!googleClientId) return;
    if (googleInitRef.current) return;

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 30; // ~3s

    const tryInit = () => {
      const google = window.google;
      if (!google?.accounts?.id) return false;

      googleInitRef.current = true;
      setGoogleError('');

      google.accounts.id.initialize({
        client_id: googleClientId,
        callback: (response) => {
          const result = loginWithGoogleCredential(response?.credential);
          if (!result?.success) {
            setGoogleError(result?.error || 'Google login failed.');
          }
        }
      });

      if (googleBtnRef.current) {
        google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'outline',
          size: 'large',
          shape: 'pill',
          width: '320'
        });
      }

      google.accounts.id.prompt();
      return true;
    };

    if (tryInit()) return;

    const timer = setInterval(() => {
      if (cancelled || googleInitRef.current) {
        clearInterval(timer);
        return;
      }
      attempts += 1;
      if (tryInit()) {
        clearInterval(timer);
        return;
      }
      if (attempts >= maxAttempts) {
        clearInterval(timer);
        if (!cancelled) setGoogleError('Google Sign-In script did not load.');
      }
    }, 100);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [googleClientId, loginWithGoogleCredential]);

  const roles = [
  {
    role: 'USER',
    title: 'Student / Staff',
    desc: 'Book resources and report issues',
    icon: UserIcon
  },
  {
    role: 'ADMIN',
    title: 'Administrator',
    desc: 'Manage bookings and platform settings',
    icon: ShieldIcon
  },
  {
    role: 'TECHNICIAN',
    title: 'Technician',
    desc: 'Resolve maintenance tickets',
    icon: WrenchIcon
  }];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-8 text-center border-b border-slate-100 bg-slate-50">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 mb-4">
            <GraduationCapIcon className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">UniOps Platform</h1>
          <p className="text-slate-500 mt-2 text-sm">
            University Operations Management
          </p>
        </div>

        <div className="p-8">
          {googleClientId &&
          <>
              <div className="flex justify-center">
                <div ref={googleBtnRef} />
              </div>
              {googleError &&
            <p className="mt-3 text-xs text-red-600 text-center">
                  {googleError}
                </p>
            }
              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-xs text-slate-400 font-semibold uppercase">
                  or
                </span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>
            </>
          }

          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 text-center">
            Select role to sign in (Mock OAuth)
          </h2>

          <div className="space-y-3">
            {roles.map(({ role, title, desc, icon: Icon }) =>
            <button
              key={role}
              onClick={() => login(role)}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all group text-left">
              
                <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-indigo-100 text-slate-600 group-hover:text-indigo-600 transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{title}</h3>
                  <p className="text-xs text-slate-500">{desc}</p>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>);

}