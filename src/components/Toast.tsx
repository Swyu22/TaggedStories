import type { FC } from 'react';
import { ToastMessage } from '../types';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full px-4 sm:px-0 pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => {
        let bgClass = 'bg-white border-ink-200 text-ink-800';
        let IconComponent = Info;
        let iconColor = 'text-ink-500';

        if (toast.type === 'success') {
          bgClass = 'bg-emerald-50/95 border-emerald-300 text-emerald-900';
          IconComponent = CheckCircle2;
          iconColor = 'text-emerald-600';
        } else if (toast.type === 'error') {
          bgClass = 'bg-red-50/95 border-red-300 text-red-900';
          IconComponent = AlertCircle;
          iconColor = 'text-red-600';
        } else if (toast.type === 'warning') {
          bgClass = 'bg-amber-50/95 border-amber-300 text-amber-900';
          IconComponent = AlertTriangle;
          iconColor = 'text-amber-600';
        }

        return (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border shadow-paper-lg transition-all duration-200 backdrop-blur-sm ${bgClass}`}
          >
            <IconComponent className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColor}`} />
            <div className="flex-1 text-sm font-medium leading-snug">{toast.message}</div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="text-ink-400 hover:text-ink-700 p-0.5 rounded transition-colors"
              aria-label="关闭提示"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
