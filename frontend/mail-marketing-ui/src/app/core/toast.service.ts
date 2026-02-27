import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'danger' | 'warning' | 'info';

export interface ToastState {
  message: string;
  type: ToastType;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly state = signal<ToastState | null>(null);

  show(message: string, type: ToastType = 'success'): void {
    this.state.set({ message, type });
    setTimeout(() => this.state.set(null), 4000);
  }
}

