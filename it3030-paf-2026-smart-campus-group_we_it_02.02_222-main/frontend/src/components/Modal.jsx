import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
export function Modal({ isOpen, onClose, title, children, maxWidth = 'md', }) {
    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        }
        else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);
    const maxWidthClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
    };
    return (<AnimatePresence>
      {isOpen && (<>
          <motion.div initial={{
                opacity: 0,
            }} animate={{
                opacity: 1,
            }} exit={{
                opacity: 0,
            }} onClick={onClose} className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm"/>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div initial={{
                opacity: 0,
                scale: 0.95,
                y: 20,
            }} animate={{
                opacity: 1,
                scale: 1,
                y: 0,
            }} exit={{
                opacity: 0,
                scale: 0.95,
                y: 20,
            }} transition={{
                type: 'spring',
                damping: 25,
                stiffness: 300,
            }} className={`w-full ${maxWidthClasses[maxWidth]} bg-white rounded-2xl shadow-xl pointer-events-auto flex flex-col max-h-[90vh]`}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <h2 className="text-lg font-semibold text-slate-900">
                  {title}
                </h2>
                <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-5 h-5"/>
                </button>
              </div>
              <div className="p-6 overflow-y-auto">{children}</div>
            </motion.div>
          </div>
        </>)}
    </AnimatePresence>);
}
