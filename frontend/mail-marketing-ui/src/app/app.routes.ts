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

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'subscribe' },
  { path: 'subscribe', component: SubscribePageComponent },
  { path: 'admin/login', component: AdminLoginPageComponent },
  { path: 'admin/register', component: AdminRegisterPageComponent },
  { path: 'admin/forgot-password', component: AdminForgotPasswordPageComponent },
  { path: 'admin/dashboard', component: DashboardPageComponent, canActivate: [authGuard] },
  { path: 'admin/profile', component: ProfilePageComponent, canActivate: [authGuard] },
  { path: 'admin/subscribers', component: SubscribersPageComponent, canActivate: [authGuard] },
  { path: 'admin/templates', component: TemplatesPageComponent, canActivate: [authGuard] },
  { path: 'admin/send', component: SendPageComponent, canActivate: [authGuard] },
  { path: 'admin/reporting', component: ReportingPageComponent, canActivate: [authGuard] },
  { path: 'admin/settings', component: SettingsPageComponent, canActivate: [authGuard] },
  { path: 'admin/users', component: UsersPageComponent, canActivate: [authGuard, adminGuard] },
  { path: '**', redirectTo: 'subscribe' }
];

