
import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', title }) => {
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-2xl shadow-lg shadow-slate-200/40 dark:shadow-black/20 border border-slate-200/80 dark:border-slate-700/60 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${className}`}>
      {title && (
         <div className="p-4 md:p-6 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-500">{title}</h3>
        </div>
      )}
      <div className="p-4 md:p-6">
        {children}
      </div>
    </div>
  );
};

export default Card;