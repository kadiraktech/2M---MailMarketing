import { Component } from '@angular/core';
import { DatePipe, NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService, ProfileDto } from '../../../core/api.service';
import { ToastService } from '../../../core/toast.service';
import { getApiErrorMessage } from '../../../core/api-error.util';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, DatePipe],
  template: `
    <div class="card p-4">
      <h2>Profil</h2>

      <div *ngIf="profile" class="alert alert-light border mt-2">
        <div><strong>Rol:</strong> {{ profile.role }}</div>
        <div><strong>Kayıt Tarihi:</strong> {{ profile.createdAtUtc | date: 'short' }}</div>
      </div>

      <form [formGroup]="form" (ngSubmit)="save()" class="d-grid gap-2 mt-2">
        <input class="form-control" placeholder="Ad Soyad" formControlName="fullName" />
        <input class="form-control" placeholder="E-posta" formControlName="email" />
        <small class="text-danger" *ngIf="form.controls.email.touched && form.controls.email.invalid">Geçerli e-posta giriniz.</small>

        <input class="form-control" type="password" placeholder="Yeni Şifre (opsiyonel)" formControlName="newPassword" />
        <small class="text-muted">Boş bırakılırsa mevcut şifre korunur.</small>

        <input class="form-control" type="password" placeholder="Yeni Şifre Tekrar" formControlName="confirmNewPassword" />
        <small class="text-danger" *ngIf="passwordMismatch">Yeni şifre ve tekrarı eşleşmiyor.</small>

        <button class="btn btn-primary" [disabled]="form.invalid || passwordMismatch || loading">Güncelle</button>
      </form>
    </div>
  `
})
export class ProfilePageComponent {
  profile?: ProfileDto;
  loading = false;

  readonly form = this.fb.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    newPassword: ['', [Validators.pattern(/^(|(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,})$/)]],
    confirmNewPassword: ['']
  });

  constructor(private fb: FormBuilder, private api: ApiService, private toast: ToastService) {
    this.load();
  }

  get passwordMismatch(): boolean {
    const p = this.form.controls.newPassword.value;
    const c = this.form.controls.confirmNewPassword.value;
    return !!p && p.length > 0 && p !== c;
  }

  load() {
    this.api.getProfile().subscribe((res) => {
      this.profile = res;
      this.form.patchValue({
        fullName: res.fullName,
        email: res.email,
        newPassword: '',
        confirmNewPassword: ''
      });
    });
  }

  save() {
    if (this.form.invalid || this.passwordMismatch || this.loading) return;

    this.loading = true;
    this.api.updateProfile(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading = false;
        this.toast.show('Profil güncellendi.', 'success');
        this.load();
      },
      error: (err) => {
        this.loading = false;
        this.toast.show(getApiErrorMessage(err), 'danger');
      }
    });
  }
}

