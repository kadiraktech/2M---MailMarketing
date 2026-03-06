import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { adminGuard } from './core/admin.guard';
import { SubscribePageComponent } from './pages/public-subscribe/subscribe-page.component';
import { AdminLoginPageComponent } from './pages/admin/login/admin-login-page.component';
import { AdminRegisterPageComponent } from './pages/admin/register/admin-register-page.component';
import { AdminForgotPasswordPageComponent } from './pages/admin/forgot-password/admin-forgot-password-page.component';
import { DashboardPageComponent } from './pages/admin/dashboard/dashboard-page.component';
import { ProfilePageComponent } from './pages/admin/profile/profile-page.component';
import { SubscribersPageComponent } from './pages/admin/subscribers/subscribers-page.component';
import { TemplatesPageComponent } from './pages/admin/templates/templates-page.component';
import { SendPageComponent } from './pages/admin/send/send-page.component';
import { ReportingPageComponent } from './pages/admin/reporting/reporting-page.component';
import { SettingsPageComponent } from './pages/admin/settings/settings-page.component';
import { UsersPageComponent } from './pages/admin/users/users-page.component';
import { AdminUiDemoPageComponent } from './pages/admin/ui-demo/admin-ui-demo-page.component';
import { AdminShellComponent } from './pages/admin/shell/admin-shell.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'subscribe' },
  { path: 'subscribe', component: SubscribePageComponent },
  {
    path: 'admin',
    component: AdminShellComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'login', component: AdminLoginPageComponent },
      { path: 'register', component: AdminRegisterPageComponent },
      { path: 'forgot-password', component: AdminForgotPasswordPageComponent },
      { path: 'dashboard', component: DashboardPageComponent, canActivate: [authGuard] },
      { path: 'profile', component: ProfilePageComponent, canActivate: [authGuard] },
      { path: 'subscribers', component: SubscribersPageComponent, canActivate: [authGuard] },
      { path: 'templates', component: TemplatesPageComponent, canActivate: [authGuard] },
      { path: 'send', component: SendPageComponent, canActivate: [authGuard] },
      { path: 'reporting', component: ReportingPageComponent, canActivate: [authGuard] },
      { path: 'settings', component: SettingsPageComponent, canActivate: [authGuard] },
      { path: 'users', component: UsersPageComponent, canActivate: [authGuard, adminGuard] },
      { path: 'ui-demo', component: AdminUiDemoPageComponent, canActivate: [authGuard] }
    ]
  },
  { path: '**', redirectTo: 'subscribe' }
];

