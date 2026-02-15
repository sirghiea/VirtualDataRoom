import { useEffect } from 'react';
import { X } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'error' | 'success';
  onClose: () => void;
}

export default function Toast({ message, type = 'error', onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-4 right-4 z-[100] animate-[slideUp_0.2s_ease-out]">
      <div
        className={`glass-strong flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium shadow-2xl ${
          type === 'error' ? 'text-destructive' : 'text-green-400'
        }`}
      >
        <span>{message}</span>
        <button onClick={onClose} className="text-muted hover:text-foreground transition-colors">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
