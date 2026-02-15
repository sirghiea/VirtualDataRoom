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
        className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg ${
          type === 'error' ? 'bg-destructive' : 'bg-green-600'
        }`}
      >
        <span>{message}</span>
        <button onClick={onClose} className="hover:opacity-80">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
