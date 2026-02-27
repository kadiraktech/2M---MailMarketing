import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { ToastService } from '../../../core/toast.service';
import { NgIf } from '@angular/common';
import { getApiErrorMessage } from '../../../core/api-error.util';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgIf],
  template: `
    <div class="card p-4">
      <h2>Yönetici Girişi</h2>
      <form [formGroup]="form" (ngSubmit)="submit()" class="d-grid gap-2">
        <input class="form-control" placeholder="E-posta" formControlName="email" />
        <small class="text-danger" *ngIf="form.controls.email.touched && form.controls.email.invalid">Geçerli e-posta giriniz.</small>

        <input class="form-control" type="password" placeholder="Şifre" formControlName="password" />
        <small class="text-danger" *ngIf="form.controls.password.touched && form.controls.password.invalid">Şifre zorunludur.</small>

        <button class="btn btn-primary" [disabled]="form.invalid || loading">Giriş Yap</button>
      </form>

      <div class="mt-2 d-flex gap-3">
        <a routerLink="/admin/register">Kayıt Ol</a>
        <a routerLink="/admin/forgot-password">Şifremi Unuttum</a>
      </div>
    </div>
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

