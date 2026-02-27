import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthUser } from './auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = `${environment.apiBaseUrl}/admin/auth`;
  private readonly storageKey = 'mm_auth';
  private readonly authState = signal<AuthUser | null>(this.readStorage());

  readonly currentUser = computed(() => this.authState());
  readonly isAuthenticated = computed(() => !!this.authState());
  readonly isAdmin = computed(() => this.authState()?.role === 'Admin');

  constructor(private http: HttpClient) {}

  login(payload: { email: string; password: string }) {
    return this.http.post<AuthUser>(`${this.api}/login`, payload).pipe(
      tap((res) => {
        this.authState.set(res);
        localStorage.setItem(this.storageKey, JSON.stringify(res));
      })
    );
  }

  register(payload: { fullName: string; email: string; password: string; role: string }) {
    return this.http.post(`${this.api}/register`, payload);
  }

  forgotPassword(payload: { email: string }) {
    return this.http.post(`${this.api}/forgot-password`, payload);
  }

  resetForgotPassword(payload: { email: string; newPassword: string; confirmPassword: string }) {
    return this.http.post(`${this.api}/forgot-password/reset`, payload);
  }

  getToken(): string | null {
    return this.authState()?.token ?? null;
  }

  logout(): void {
    this.authState.set(null);
    localStorage.removeItem(this.storageKey);
  }

  private readStorage(): AuthUser | null {
    const raw = localStorage.getItem(this.storageKey);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  }
}
