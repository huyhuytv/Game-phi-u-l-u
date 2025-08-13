import React, { useEffect, useState } from 'react';
import { ToastMessage, useToastStore } from '../../store/useToastStore';

const Toast: React.FC<{ toast: ToastMessage }> = ({ toast }) => {
  const removeToast = useToastStore((state) => state.removeToast);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Animate in
    setVisible(true);

    // Set timeout to animate out and then remove
    const timer = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [toast.id, removeToast]);
  
  const handleClose = () => {
      setVisible(false);
      setTimeout(() => removeToast(toast.id), 300); // Wait for fade out animation
  }

  const baseClasses = 'w-full max-w-sm p-4 rounded-lg shadow-lg flex items-center space-x-4 transition-all duration-300 backdrop-blur-md';
  const typeClasses = {
    success: 'bg-green-600/80 border border-green-400 text-white',
    error: 'bg-red-600/80 border border-red-400 text-white',
    info: 'bg-blue-600/80 border border-blue-400 text-white',
  };
  
  const icon = {
      success: '✓',
      error: '!',
      info: 'i'
  }

  return (
    <div
      role="alert"
      className={`${baseClasses} ${typeClasses[toast.type]} ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}`}
    >
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-black/20 flex items-center justify-center font-bold text-lg">{icon[toast.type]}</div>
        <div className="flex-grow text-sm font-medium">{toast.message}</div>
        <button onClick={handleClose} className="p-1 rounded-full text-white/70 hover:text-white hover:bg-black/20 transition-colors">&times;</button>
    </div>
  );
};

export default Toast;
