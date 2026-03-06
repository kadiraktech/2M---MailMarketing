import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { ToastService } from '../../../core/toast.service';
import { NgIf } from '@angular/common';
import { getApiErrorMessage } from '../../../core/api-error.util';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    NgIf,
    CardModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    ProgressSpinnerModule
  ],
  styles: [`
    .login-form {
      display: grid;
      gap: .5rem;
    }
    .action-row {
      display: flex;
      gap: .5rem;
      align-items: center;
    }
    .spinner-inline {
      width: 20px;
      height: 20px;
    }
    .links-row {
      margin-top: .5rem;
      display: flex;
      gap: .75rem;
      flex-wrap: wrap;
    }
  `],
  template: `
    <p-card header="Yönetici Girişi">
      <form [formGroup]="form" (ngSubmit)="submit()" class="login-form">
        <input pInputText placeholder="E-posta" formControlName="email" />
        <small class="text-danger" *ngIf="form.controls.email.touched && form.controls.email.invalid">Geçerli e-posta giriniz.</small>

        <p-password
          formControlName="password"
          [feedback]="false"
          [toggleMask]="true"
          [inputStyle]="{ width: '100%' }"
          styleClass="w-100"
          placeholder="Şifre">
        </p-password>
        <small class="text-danger" *ngIf="form.controls.password.touched && form.controls.password.invalid">Şifre zorunludur.</small>

        <div class="action-row">
          <button pButton type="submit" label="Giriş Yap" [disabled]="form.invalid || loading"></button>
          <p-progressSpinner *ngIf="loading" styleClass="spinner-inline" strokeWidth="6" fill="transparent"></p-progressSpinner>
        </div>
      </form>

      <div class="links-row">
        <a routerLink="/admin/register">Kayıt Ol</a>
        <a routerLink="/admin/forgot-password">Şifremi Unuttum</a>
      </div>
    </p-card>
  `
})
export class AdminLoginPageComponent {
  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  loading = false;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router, private toast: ToastService) {}

  submit() {
    if (this.form.invalid || this.loading) return;

    this.loading = true;
    this.auth.login(this.form.getRawValue() as { email: string; password: string }).subscribe({
      next: () => {
        this.loading = false;
        this.toast.show('Giriş başarılı.', 'success');
        this.router.navigateByUrl('/admin/dashboard');
      },
      error: (err) => {
        this.loading = false;
        const msg = getApiErrorMessage(err);
        this.toast.show(msg, 'danger');
      }
    });
  }
}

