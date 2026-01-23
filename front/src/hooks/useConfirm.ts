'use client';

import React, { useState, useCallback } from 'react';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

interface ConfirmOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
}

export function useConfirm() {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolve, setResolve] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    return new Promise((res) => {
      setOptions(opts);
      setOpen(true);
      setResolve(() => res);
    });
  }, []);

  const handleConfirm = useCallback(() => {
    resolve?.(true);
    setOpen(false);
    setOptions(null);
    setResolve(null);
  }, [resolve]);

  const handleCancel = useCallback(() => {
    resolve?.(false);
    setOpen(false);
    setOptions(null);
    setResolve(null);
  }, [resolve]);

  const ConfirmComponent = options ? React.createElement(ConfirmDialog, {
    open,
    onOpenChange: setOpen,
    title: options.title,
    description: options.description,
    confirmText: options.confirmText,
    cancelText: options.cancelText,
    variant: options.variant,
    onConfirm: handleConfirm,
    onCancel: handleCancel,
  }) : null;

  return {
    confirm,
    ConfirmComponent,
  };
}
