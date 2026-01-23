'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Alert, AlertVariant } from './Alert';

interface AlertItem {
  id: string;
  variant: AlertVariant;
  title?: string;
  message: string;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

interface AlertContextType {
  showAlert: (alert: Omit<AlertItem, 'id'>) => void;
  removeAlert: (id: string) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  const showAlert = useCallback((alert: Omit<AlertItem, 'id'>) => {
    const id = Math.random().toString(36).substring(7);
    setAlerts((prev) => [...prev, { ...alert, id }]);
  }, []);

  const removeAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert, removeAlert }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2 w-full max-w-md">
        {alerts.map((alert) => (
          <Alert
            key={alert.id}
            variant={alert.variant}
            title={alert.title}
            message={alert.message}
            onClose={() => removeAlert(alert.id)}
            autoClose={alert.autoClose}
            autoCloseDelay={alert.autoCloseDelay}
          />
        ))}
      </div>
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within AlertProvider');
  }
  return context;
}
