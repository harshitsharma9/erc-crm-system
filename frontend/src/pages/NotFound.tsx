import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col justify-center items-center text-center p-6 animate-[fadeIn_0.2s_ease]">
      <HelpCircle size={48} className="text-zinc-650 mb-4 animate-bounce" />
      <h3 className="text-2xl font-bold text-white font-heading">Page Not Found</h3>
      <p className="text-zinc-400 text-sm mt-2 max-w-sm">
        The resource you are looking for has either been moved, renamed, or is currently unavailable.
      </p>
      <button
        onClick={() => navigate('/dashboard')}
        className="mt-6 px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow transition-all"
      >
        Return to Dashboard
      </button>
    </div>
  );
};
