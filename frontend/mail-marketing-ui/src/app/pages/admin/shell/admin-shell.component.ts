import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MenubarModule } from 'primeng/menubar';
import { PanelModule } from 'primeng/panel';
import { AuthService } from '../../../core/auth.service';
import { I18nService } from '../../../core/i18n.service';

@Component({
  standalone: true,
  selector: 'app-admin-shell',
  imports: [NgIf, RouterOutlet, RouterLink, RouterLinkActive, TranslateModule, MenubarModule, PanelModule],
  styles: [`
    .admin-shell {
      min-height: 100vh;
      display: grid;
      grid-template-rows: auto 1fr;
    }
    .admin-topbar {
      position: sticky;
      top: 0;
      z-index: 20;
      border-bottom: 1px solid #dde7f1;
    }
    .admin-layout {
      display: grid;
      grid-template-columns: 260px 1fr;
      gap: 1rem;
      padding: 1rem;
      max-width: 1400px;
      margin: 0 auto;
      width: 100%;
      box-sizing: border-box;
    }
    .admin-sidebar-links {
      display: flex;
      flex-direction: column;
      gap: .4rem;
    }
    .admin-sidebar-links a {
      text-decoration: none;
      border-radius: 8px;
      padding: .45rem .6rem;
      color: #2d3a48;
    }
    .admin-sidebar-links a.active {
      background: #e9f2ff;
      color: #1e4da0;
      font-weight: 600;
    }
    .admin-content {
      min-width: 0;
    }
    @media (max-width: 991px) {
      .admin-layout {
        grid-template-columns: 1fr;
      }
    }
  `],
  template: `
    <div class="admin-shell">
      <p-menubar class="admin-topbar">
        <ng-template pTemplate="start">
          <a routerLink="/admin/dashboard" class="fw-semibold text-decoration-none">{{ 'admin.title' | translate }}</a>
        </ng-template>
        <ng-template pTemplate="end">
          <div class="d-flex gap-2 align-items-center">
            <button
              type="button"
              class="btn btn-outline-secondary btn-sm"
              [class.active]="currentLang() === 'tr'"
              (click)="setLang('tr')">TR</button>
            <button
              type="button"
              class="btn btn-outline-secondary btn-sm"
              [class.active]="currentLang() === 'en'"
              (click)="setLang('en')">EN</button>
            <a class="btn btn-outline-secondary btn-sm" routerLink="/subscribe">{{ 'shell.public' | translate }}</a>
            <button *ngIf="auth.isAuthenticated()" class="btn btn-danger btn-sm" (click)="logout()">{{ 'shell.logout' | translate }}</button>
          </div>
        </ng-template>
      </p-menubar>

      <div class="admin-layout">
        <p-panel [header]="'shell.navigation' | translate" *ngIf="shouldShowSidebar()">
          <nav class="admin-sidebar-links">
            <a routerLink="dashboard" routerLinkActive="active">{{ 'shell.dashboard' | translate }}</a>
            <a routerLink="subscribers" routerLinkActive="active">{{ 'shell.subscribers' | translate }}</a>
            <a routerLink="templates" routerLinkActive="active">{{ 'shell.templates' | translate }}</a>
            <a routerLink="send" routerLinkActive="active">{{ 'shell.send' | translate }}</a>
            <a routerLink="reporting" routerLinkActive="active">{{ 'shell.reporting' | translate }}</a>
            <a routerLink="settings" routerLinkActive="active">{{ 'shell.settings' | translate }}</a>
            <a routerLink="users" routerLinkActive="active">{{ 'shell.users' | translate }}</a>
            <a routerLink="profile" routerLinkActive="active">{{ 'shell.profile' | translate }}</a>
            <a routerLink="ui-demo" routerLinkActive="active">{{ 'shell.uiDemo' | translate }}</a>
          </nav>
        </p-panel>

        <main class="admin-content">
          <router-outlet />
        </main>
      </div>
    </div>
  `
})
export class AdminShellComponent {
  constructor(public auth: AuthService, private router: Router, private i18n: I18nService) {}

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/admin/login');
  }

  shouldShowSidebar(): boolean {
    const url = this.router.url;
    return url.startsWith('/admin')
      && !url.endsWith('/login')
      && !url.endsWith('/register')
      && !url.endsWith('/forgot-password');
  }

  setLang(lang: 'tr' | 'en'): void {
    this.i18n.setLanguage(lang);
  }

  currentLang(): string {
    return this.i18n.getCurrentLanguage();
  }
}
