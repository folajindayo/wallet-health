/**
 * Notification Helper
 */

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationOptions {
  title: string;
  message: string;
  type: NotificationType;
  duration?: number;
}

export function showNotification({
  title,
  message,
  type,
  duration = 5000,
}: NotificationOptions) {
  if (typeof window === 'undefined') return;
  
  console.log(`[${type.toUpperCase()}] ${title}: ${message}`);
  
  // Integration with toast library would go here
  // e.g., react-hot-toast, sonner, etc.
}

export function showSuccess(title: string, message: string) {
  showNotification({ title, message, type: 'success' });
}

export function showError(title: string, message: string) {
  showNotification({ title, message, type: 'error' });
}

