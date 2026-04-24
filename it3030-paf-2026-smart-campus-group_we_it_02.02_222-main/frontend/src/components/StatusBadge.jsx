import React from 'react';
export function StatusBadge({ status, className = '' }) {
    let colorClass = '';
    let label = status.replace(/_/g, ' ');
    switch (status) {
        case 'ACTIVE':
        case 'APPROVED':
        case 'RESOLVED':
        case 'CLOSED':
            colorClass =
                'bg-status-success/10 text-status-success border-status-success/20';
            break;
        case 'PENDING':
        case 'IN_PROGRESS':
            colorClass =
                'bg-status-warning/10 text-status-warning border-status-warning/20';
            break;
        case 'OUT_OF_SERVICE':
        case 'REJECTED':
        case 'CANCELLED':
            colorClass = 'bg-status-error/10 text-status-error border-status-error/20';
            break;
        case 'OPEN':
            colorClass = 'bg-status-info/10 text-status-info border-status-info/20';
            break;
        default:
            colorClass = 'bg-slate-100 text-slate-600 border-slate-200';
    }
    return (<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass} ${className}`}>
      {label}
    </span>);
}
