/**
 * Notification Helper
 */

export interface NotificationOptions {
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export class NotificationHelper {
  static show(options: NotificationOptions): void {
    // Implementation would integrate with notification system
    console.log(`[${options.type.toUpperCase()}] ${options.title}: ${options.message}`);
  }

  static success(title: string, message: string): void {
    this.show({ title, message, type: 'success' });
  }

  static error(title: string, message: string): void {
    this.show({ title, message, type: 'error' });
  }

  static warning(title: string, message: string): void {
    this.show({ title, message, type: 'warning' });
  }

  static info(title: string, message: string): void {
    this.show({ title, message, type: 'info' });
  }
}

