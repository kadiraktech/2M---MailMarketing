import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/auth.service';
import { ToastService } from '../../../core/toast.service';
import { getApiErrorMessage } from '../../../core/api-error.util';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, CardModule, InputTextModule, ButtonModule, ProgressSpinnerModule],
  styles: [`
    .forgot-form {
      display: grid;
      gap: .5rem;
      margin-top: .5rem;
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
  `],
  template: `
    <p-card header="Şifremi Unuttum">
      <form *ngIf="step === 1" [formGroup]="emailForm" (ngSubmit)="verifyEmail()" class="forgot-form">
        <input pInputText placeholder="E-posta" formControlName="email" />
        <small class="text-danger" *ngIf="emailForm.controls.email.touched && emailForm.controls.email.invalid">Geçerli e-posta giriniz.</small>
        <div class="action-row">
          <button pButton type="submit" label="E-postayı Doğrula" severity="warn" [disabled]="emailForm.invalid || loading"></button>
          <p-progressSpinner *ngIf="loading" styleClass="spinner-inline" strokeWidth="6" fill="transparent"></p-progressSpinner>
        </div>
      </form>

      <form *ngIf="step === 2" [formGroup]="resetForm" (ngSubmit)="resetPassword()" class="forgot-form">
        <input pInputText type="password" placeholder="Yeni Şifre" formControlName="newPassword" />
        <small class="text-muted">En az 8 karakter, büyük-küçük harf ve rakam içermelidir.</small>
        <input pInputText type="password" placeholder="Yeni Şifre Tekrar" formControlName="confirmPassword" />
        <small class="text-danger" *ngIf="passwordMismatch">Şifre ve tekrarı eşleşmiyor.</small>
        <div class="action-row">
          <button pButton type="submit" label="Şifreyi Güncelle" [disabled]="resetForm.invalid || passwordMismatch || loading"></button>
          <p-progressSpinner *ngIf="loading" styleClass="spinner-inline" strokeWidth="6" fill="transparent"></p-progressSpinner>
        </div>
      </form>
    </p-card>
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


