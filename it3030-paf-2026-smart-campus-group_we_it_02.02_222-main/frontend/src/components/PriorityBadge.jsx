import React from 'react';
import { AlertCircle, AlertTriangle, ArrowDown, ArrowUp } from 'lucide-react';
export function PriorityBadge({ priority, className = '', }) {
    let colorClass = '';
    let Icon = AlertCircle;
    switch (priority) {
        case 'CRITICAL':
            colorClass = 'bg-red-100 text-red-800 border-red-200';
            Icon = AlertCircle;
            break;
        case 'HIGH':
            colorClass = 'bg-orange-100 text-orange-800 border-orange-200';
            Icon = ArrowUp;
            break;
        case 'MEDIUM':
            colorClass = 'bg-blue-100 text-blue-800 border-blue-200';
            Icon = AlertTriangle;
            break;
        case 'LOW':
            colorClass = 'bg-slate-100 text-slate-800 border-slate-200';
            Icon = ArrowDown;
            break;
    }
    return (<span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${colorClass} ${className}`}>
      <Icon className="w-3 h-3"/>
      {priority}
    </span>);
}
