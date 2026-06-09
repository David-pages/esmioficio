import React, { useEffect } from 'react';
import { ToastNotification } from '../types';

interface ToastContainerProps {
  notifications: ToastNotification[];
  onRemove: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ notifications, onRemove }) => {
  return (
    <div className="fixed bottom-4 right-4 z-[150] flex flex-col gap-2 pointer-events-none">
      {notifications.map((note) => (
        <Toast key={note.id} notification={note} onRemove={onRemove} />
      ))}
    </div>
  );
};

const Toast: React.FC<{ notification: ToastNotification; onRemove: (id: string) => void }> = ({ notification, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(notification.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [notification, onRemove]);

  const bgColors = {
    success: 'bg-surface border-green-500/50 text-green-400',
    error: 'bg-surface border-red-500/50 text-red-400',
    info: 'bg-surface border-blue-500/50 text-blue-400',
  };

  const icons = {
    success: 'check_circle',
    error: 'error',
    info: 'info',
  };

  return (
    <div className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg border shadow-xl shadow-black/50 animate-fade-in-up transform transition-all ${bgColors[notification.type]}`}>
      <span className="material-symbols-outlined">{icons[notification.type]}</span>
      <p className="text-sm font-medium text-white">{notification.message}</p>
      <button onClick={() => onRemove(notification.id)} className="ml-2 text-gray-500 hover:text-white">
        <span className="material-symbols-outlined text-sm">close</span>
      </button>
    </div>
  );
};

export default ToastContainer;
