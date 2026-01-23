import { toast as sonnerToast } from 'sonner';

/**
 * 성공 Toast
 */
export function toastSuccess(message: string, description?: string) {
  return sonnerToast.success(message, {
    description,
  });
}

/**
 * 에러 Toast
 */
export function toastError(message: string, description?: string) {
  return sonnerToast.error(message, {
    description,
  });
}

/**
 * 경고 Toast
 */
export function toastWarning(message: string, description?: string) {
  return sonnerToast.warning(message, {
    description,
  });
}

/**
 * 정보 Toast
 */
export function toastInfo(message: string, description?: string) {
  return sonnerToast.info(message, {
    description,
  });
}
