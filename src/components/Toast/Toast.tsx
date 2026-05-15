import { createPortal } from 'react-dom';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { useToastStore } from '@stores/toastStore';
import type { ToastVariant } from '@stores/toastStore';
import styles from './Toast.module.css';

const icons: Record<ToastVariant, React.ReactNode> = {
  success: <CheckCircle size={18} />,
  warning: <AlertTriangle size={18} />,
  error: <XCircle size={18} />,
  info: <Info size={18} />,
};

export function ToastPortal() {
  const { toasts, dismiss } = useToastStore();

  return createPortal(
    <div className={styles.portal} aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => (
        <div key={toast.id} className={`${styles.toast} ${styles[toast.variant]}`} role="alert">
          <span className={styles.icon}>{icons[toast.variant]}</span>
          <span className={styles.message}>{toast.message}</span>
          <button
            className={styles.dismiss}
            onClick={() => dismiss(toast.id)}
            aria-label="Fechar"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>,
    document.body,
  );
}
