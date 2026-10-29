import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage } = useApp();

  if (!toastMessage) return null;

  return (
    <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 bg-zinc-900 border border-green-500/50 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-2xl flex items-center space-x-2 animate-bounce">
      <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
      <span>{toastMessage}</span>
    </div>
  );
};
