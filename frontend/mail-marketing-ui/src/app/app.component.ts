import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ToastService } from './core/toast.service';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, NgIf, TranslateModule],
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
    <ng-container *ngIf="isAdminRoute(); else publicLayout">
      <router-outlet />
    </ng-container>

    <ng-template #publicLayout>
      <nav class="navbar navbar-expand app-nav px-3">
        <a class="navbar-brand brand-title" routerLink="/subscribe">MailMarketing</a>
        <div class="ms-auto d-flex gap-2">
          <a class="btn btn-outline-primary btn-sm" routerLink="/subscribe">{{ 'public.nav.subscribe' | translate }}</a>
          <a class="btn btn-outline-secondary btn-sm" routerLink="/admin/dashboard">{{ 'public.nav.panel' | translate }}</a>
          <button *ngIf="auth.isAuthenticated()" class="btn btn-danger btn-sm" (click)="logout()">{{ 'public.nav.logout' | translate }}</button>
        </div>
      </nav>
      <main class="page-wrap"><router-outlet /></main>
    </ng-template>

    <div class="toast-box" *ngIf="toast.state()" [class]="'alert alert-' + toast.state()!.type">
      {{ toast.state()!.message }}
    </div>
  `
})
export class AppComponent {
  constructor(public toast: ToastService, public auth: AuthService, private router: Router) {}

  isAdminRoute(): boolean {
    return this.router.url.startsWith('/admin');
  }

  logout(): void {
    this.auth.logout();
  }
}

