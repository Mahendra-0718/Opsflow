import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(({ type = 'info', title, message, duration = 4000 }) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    const newToast = { id, type, title, message };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const toast = {
    success: (message, title = 'Success') => addToast({ type: 'success', title, message }),
    error: (message, title = 'Error') => addToast({ type: 'error', title, message }),
    info: (message, title = 'Notice') => addToast({ type: 'info', title, message }),
    warning: (message, title = 'Warning') => addToast({ type: 'warning', title, message }),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          pointerEvents: 'none',
          maxWidth: '420px',
          width: 'calc(100% - 48px)',
        }}
      >
        {toasts.map((item) => {
          let icon = <Info size={18} style={{ color: '#38bdf8' }} />;
          let borderColor = 'rgba(56, 189, 248, 0.4)';
          let bgColor = '#0f172a';

          if (item.type === 'success') {
            icon = <CheckCircle2 size={18} style={{ color: '#34d399' }} />;
            borderColor = 'rgba(52, 211, 153, 0.4)';
          } else if (item.type === 'error') {
            icon = <AlertCircle size={18} style={{ color: '#f87171' }} />;
            borderColor = 'rgba(248, 113, 113, 0.4)';
          } else if (item.type === 'warning') {
            icon = <AlertTriangle size={18} style={{ color: '#fbbf24' }} />;
            borderColor = 'rgba(251, 191, 36, 0.4)';
          }

          return (
            <div
              key={item.id}
              style={{
                pointerEvents: 'auto',
                background: bgColor,
                border: `1px solid ${borderColor}`,
                borderRadius: '12px',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                boxShadow: '0 12px 32px rgba(0, 0, 0, 0.5), 0 0 15px rgba(255, 255, 255, 0.05)',
                color: '#f8fafc',
                animation: 'modalScaleUp 200ms cubic-bezier(0.16, 1, 0.3, 1)',
                backdropFilter: 'blur(16px)',
              }}
            >
              <div style={{ flexShrink: 0, marginTop: '2px' }}>{icon}</div>
              <div style={{ flexGrow: 1, minWidth: 0 }}>
                {item.title && (
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '2px' }}>
                    {item.title}
                  </div>
                )}
                <div style={{ fontSize: '0.85rem', color: '#cbd5e1', wordBreak: 'break-word', lineHeight: 1.4 }}>
                  {item.message}
                </div>
              </div>
              <button
                onClick={() => removeToast(item.id)}
                style={{
                  color: '#94a3b8',
                  padding: '2px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'color 150ms',
                }}
                title="Dismiss"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
