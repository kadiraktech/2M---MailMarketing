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
import { DropdownModule } from 'primeng/dropdown';
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
    DropdownModule,
    ButtonModule,
    ProgressSpinnerModule
  ],
  styles: [`
    .register-form {
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
  `],
  template: `
    <p-card header="Kullanıcı Kaydı">
      <form [formGroup]="form" (ngSubmit)="submit()" class="register-form">
        <input pInputText placeholder="Ad Soyad" formControlName="fullName" />
        <small class="text-danger" *ngIf="form.controls.fullName.touched && form.controls.fullName.invalid">Ad Soyad zorunludur.</small>

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
        <small class="text-muted">En az 8 karakter, büyük-küçük harf ve rakam içermelidir.</small>

        <p-password
          formControlName="confirmPassword"
          [feedback]="false"
          [toggleMask]="true"
          [inputStyle]="{ width: '100%' }"
          styleClass="w-100"
          placeholder="Şifre Tekrar">
        </p-password>
        <small class="text-danger" *ngIf="passwordMismatch">Şifre ve tekrarı eşleşmiyor.</small>

        <p-dropdown
          formControlName="role"
          [options]="[
            { label: 'User', value: 'User' },
            { label: 'Admin', value: 'Admin' }
          ]"
          optionLabel="label"
          optionValue="value"
          class="w-100">
        </p-dropdown>

        <div class="action-row">
          <button pButton type="submit" label="Kaydet" severity="success" [disabled]="form.invalid || passwordMismatch || loading"></button>
          <p-progressSpinner *ngIf="loading" styleClass="spinner-inline" strokeWidth="6" fill="transparent"></p-progressSpinner>
        </div>
      </form>
      <a routerLink="/admin/login" class="mt-2 d-inline-block">Girişe dön</a>
    </p-card>
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


