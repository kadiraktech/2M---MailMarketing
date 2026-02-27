import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NgIf } from '@angular/common';
import { ToastService } from './core/toast.service';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, NgIf],
  styles: [`
    .app-nav {
      backdrop-filter: blur(6px);
      background: linear-gradient(180deg, #ffffff 0%, #f9fbff 100%);
      border-bottom: 1px solid #d8e4f0;
    }
    .brand-title {
      font-weight: 700;
      letter-spacing: -0.01em;
      color: #1f2b3a;
    }
  `],
  template: `
    <nav class="navbar navbar-expand app-nav px-3">
      <a class="navbar-brand brand-title" routerLink="/subscribe">MailMarketing</a>
      <div class="ms-auto d-flex gap-2">
        <a class="btn btn-outline-primary btn-sm" routerLink="/subscribe">Abone Ol</a>
        <a class="btn btn-outline-secondary btn-sm" routerLink="/admin/dashboard">Panel</a>
        <button *ngIf="auth.isAuthenticated()" class="btn btn-danger btn-sm" (click)="logout()">Çıkış</button>
      </div>
    </nav>
    <main class="page-wrap"><router-outlet /></main>
    <div class="toast-box" *ngIf="toast.state()" [class]="'alert alert-' + toast.state()!.type">
      {{ toast.state()!.message }}
    </div>
  `
})
export class AppComponent {
  constructor(public toast: ToastService, public auth: AuthService) {}
  logout() { this.auth.logout(); }
}

