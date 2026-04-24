import React from 'react';
export function EmptyState({ icon: Icon, title, description, action, className = '', }) {
    return (<div className={`flex flex-col items-center justify-center p-8 text-center bg-white rounded-xl border border-slate-200 border-dashed ${className}`}>
      <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-slate-400"/>
      </div>
      <h3 className="text-lg font-medium text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>);
}
