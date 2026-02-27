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
      <h2>Kullanıcı Kaydı</h2>
      <form [formGroup]="form" (ngSubmit)="submit()" class="d-grid gap-2">
        <input class="form-control" placeholder="Ad Soyad" formControlName="fullName" />
        <small class="text-danger" *ngIf="form.controls.fullName.touched && form.controls.fullName.invalid">Ad Soyad zorunludur.</small>

        <input class="form-control" placeholder="E-posta" formControlName="email" />
        <small class="text-danger" *ngIf="form.controls.email.touched && form.controls.email.invalid">Geçerli e-posta giriniz.</small>

        <input class="form-control" type="password" placeholder="Şifre" formControlName="password" />
        <small class="text-muted">En az 8 karakter, büyük-küçük harf ve rakam içermelidir.</small>

        <input class="form-control" type="password" placeholder="Şifre Tekrar" formControlName="confirmPassword" />
        <small class="text-danger" *ngIf="passwordMismatch">Şifre ve tekrarı eşleşmiyor.</small>

        <select class="form-select" formControlName="role">
          <option value="User">User</option>
          <option value="Admin">Admin</option>
        </select>

        <button class="btn btn-success" [disabled]="form.invalid || passwordMismatch || loading">Kaydet</button>
      </form>
      <a routerLink="/admin/login" class="mt-2 d-inline-block">Girişe dön</a>
    </div>
  `
})
export class AdminRegisterPageComponent {
  readonly form = this.fb.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)]],
    confirmPassword: ['', Validators.required],
    role: ['User', Validators.required]
  });

  loading = false;

  constructor(private fb: FormBuilder, private auth: AuthService, private toast: ToastService, private router: Router) {}

  get passwordMismatch(): boolean {
    const p = this.form.controls.password.value;
    const c = this.form.controls.confirmPassword.value;
    return !!p && !!c && p !== c;
  }

  submit() {
    if (this.form.invalid || this.passwordMismatch || this.loading) return;

    this.loading = true;
    const raw = this.form.getRawValue();
    this.auth.register({
      fullName: raw.fullName ?? '',
      email: raw.email ?? '',
      password: raw.password ?? '',
      role: raw.role ?? 'User'
    }).subscribe({
      next: () => {
        this.loading = false;
        this.toast.show('Kayıt başarılı. Giriş yapabilirsiniz.', 'success');
        this.router.navigateByUrl('/admin/login');
      },
      error: (err) => {
        this.loading = false;
        this.toast.show(getApiErrorMessage(err), 'danger');
      }
    });
  }
}

