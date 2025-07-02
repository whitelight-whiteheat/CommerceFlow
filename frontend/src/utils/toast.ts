export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

class ToastManager {
  private listeners: ((toasts: Toast[]) => void)[] = [];
  private toasts: Toast[] = [];

  subscribe(listener: (toasts: Toast[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener([...this.toasts]));
  }

  add(type: ToastType, message: string, duration: number = 5000) {
    const id = Math.random().toString(36).substr(2, 9);
    const toast: Toast = { id, type, message, duration };
    
    this.toasts.push(toast);
    this.notify();

    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }

    return id;
  }

  remove(id: string) {
    this.toasts = this.toasts.filter(toast => toast.id !== id);
    this.notify();
  }

  clear() {
    this.toasts = [];
    this.notify();
  }

  success(message: string, duration?: number) {
    return this.add('success', message, duration);
  }

  error(message: string, duration?: number) {
    return this.add('error', message, duration);
  }

  warning(message: string, duration?: number) {
    return this.add('warning', message, duration);
  }

  info(message: string, duration?: number) {
    return this.add('info', message, duration);
  }
}

export const toastManager = new ToastManager(); 