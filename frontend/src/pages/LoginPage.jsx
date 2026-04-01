import React from 'react';
import {
  GraduationCapIcon,
  UserIcon,
  ShieldIcon,
  WrenchIcon } from
'lucide-react';
import { useAuth } from '../context/AuthContext';
export function LoginPage() {
  const { login } = useAuth();
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