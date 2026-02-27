import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/auth.service';
import { ToastService } from '../../../core/toast.service';
import { getApiErrorMessage } from '../../../core/api-error.util';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  template: `
    <div class="card p-4">
      <h2>Şifremi Unuttum</h2>

      <form *ngIf="step === 1" [formGroup]="emailForm" (ngSubmit)="verifyEmail()" class="d-grid gap-2 mt-2">
        <input class="form-control" placeholder="E-posta" formControlName="email" />
        <small class="text-danger" *ngIf="emailForm.controls.email.touched && emailForm.controls.email.invalid">Geçerli e-posta giriniz.</small>
        <button class="btn btn-warning" [disabled]="emailForm.invalid || loading">E-postayı Doğrula</button>
      </form>

      <form *ngIf="step === 2" [formGroup]="resetForm" (ngSubmit)="resetPassword()" class="d-grid gap-2 mt-2">
        <input class="form-control" type="password" placeholder="Yeni Şifre" formControlName="newPassword" />
        <small class="text-muted">En az 8 karakter, büyük-küçük harf ve rakam içermelidir.</small>
        <input class="form-control" type="password" placeholder="Yeni Şifre Tekrar" formControlName="confirmPassword" />
        <small class="text-danger" *ngIf="passwordMismatch">Şifre ve tekrarı eşleşmiyor.</small>
        <button class="btn btn-primary" [disabled]="resetForm.invalid || passwordMismatch || loading">Şifreyi Güncelle</button>
      </form>
    </div>
  `
})
export class AdminForgotPasswordPageComponent {
  step = 1;
  loading = false;
  verifiedEmail = '';

  readonly emailForm = this.fb.group({ email: ['', [Validators.required, Validators.email]] });
  readonly resetForm = this.fb.group({
    newPassword: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)]],
    confirmPassword: ['', Validators.required]
  });

  constructor(private fb: FormBuilder, private auth: AuthService, private toast: ToastService) {}

  get passwordMismatch(): boolean {
    const p = this.resetForm.controls.newPassword.value;
    const c = this.resetForm.controls.confirmPassword.value;
    return !!p && !!c && p !== c;
  }

  verifyEmail() {
    if (this.emailForm.invalid || this.loading) return;

    this.loading = true;
    const email = this.emailForm.controls.email.value ?? '';
    this.auth.forgotPassword({ email }).subscribe({
      next: () => {
        this.loading = false;
        this.verifiedEmail = email;
        this.step = 2;
        this.toast.show('E-posta doğrulandı. Yeni şifrenizi girin.', 'success');
      },
      error: (err) => {
        this.loading = false;
        this.toast.show(getApiErrorMessage(err), 'danger');
      }
    });
  }

  resetPassword() {
    if (this.resetForm.invalid || this.passwordMismatch || this.loading) return;

    this.loading = true;
    const raw = this.resetForm.getRawValue();
    this.auth.resetForgotPassword({
      email: this.verifiedEmail,
      newPassword: raw.newPassword ?? '',
      confirmPassword: raw.confirmPassword ?? ''
    }).subscribe({
      next: () => {
        this.loading = false;
        this.step = 1;
        this.emailForm.reset({ email: '' });
        this.resetForm.reset({ newPassword: '', confirmPassword: '' });
        this.toast.show('Şifreniz güncellendi.', 'success');
      },
      error: (err) => {
        this.loading = false;
        this.toast.show(getApiErrorMessage(err), 'danger');
      }
    });
  }
}

