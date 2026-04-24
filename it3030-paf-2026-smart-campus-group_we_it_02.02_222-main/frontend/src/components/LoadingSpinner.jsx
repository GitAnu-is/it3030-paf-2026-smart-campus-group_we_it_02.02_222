import React from 'react';
import { Loader2 } from 'lucide-react';
export function LoadingSpinner({ size = 'md', className = '', fullPage = false, }) {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
    };
    const spinner = (<div className={`flex flex-col items-center justify-center text-primary-600 ${className}`}>
      <Loader2 className={`animate-spin ${sizeClasses[size]}`}/>
    </div>);
    if (fullPage) {
        return (<div className="min-h-[60vh] flex items-center justify-center">
        {spinner}
      </div>);
    }
    return spinner;
}
