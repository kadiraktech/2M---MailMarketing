import { Component } from '@angular/core';
import { DatePipe, NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ApiService, ProfileDto } from '../../../core/api.service';
import { ToastService } from '../../../core/toast.service';
import { getApiErrorMessage } from '../../../core/api-error.util';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, DatePipe, TranslateModule, CardModule, InputTextModule, ButtonModule, ProgressSpinnerModule],
  styles: [`
    .profile-meta {
      border: 1px solid var(--surface-border, #d6dde6);
      border-radius: 10px;
      padding: .75rem;
      background: #fff;
    }
    .profile-form {
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
    <p-card [header]="'profilePage.title' | translate">
      <div *ngIf="profile" class="profile-meta mt-2">
        <div><strong>{{ 'profilePage.role' | translate }}:</strong> {{ profile.role }}</div>
        <div><strong>{{ 'profilePage.createdAt' | translate }}:</strong> {{ profile.createdAtUtc | date: 'short' }}</div>
      </div>

      <form [formGroup]="form" (ngSubmit)="save()" class="profile-form mt-2">
        <input pInputText [placeholder]="'profilePage.fullName' | translate" formControlName="fullName" />
        <input pInputText [placeholder]="'profilePage.email' | translate" formControlName="email" />
        <small class="text-danger" *ngIf="form.controls.email.touched && form.controls.email.invalid">{{ 'profilePage.validEmail' | translate }}</small>

        <input pInputText type="password" [placeholder]="'profilePage.newPasswordOptional' | translate" formControlName="newPassword" />
        <small class="text-muted">{{ 'profilePage.passwordHint' | translate }}</small>

        <input pInputText type="password" [placeholder]="'profilePage.confirmPassword' | translate" formControlName="confirmNewPassword" />
        <small class="text-danger" *ngIf="passwordMismatch">{{ 'profilePage.passwordMismatch' | translate }}</small>

        <div class="action-row">
          <button pButton type="submit" [label]="'profilePage.update' | translate" [disabled]="form.invalid || passwordMismatch || loading"></button>
          <p-progressSpinner *ngIf="loading" styleClass="spinner-inline" strokeWidth="6" fill="transparent"></p-progressSpinner>
        </div>
      </form>
    </p-card>
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

  constructor(private fb: FormBuilder, private api: ApiService, private toast: ToastService, private translate: TranslateService) {
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
        this.toast.show(this.translate.instant('profilePage.toast.updated'), 'success');
        this.load();
      },
      error: (err) => {
        this.loading = false;
        this.toast.show(getApiErrorMessage(err), 'danger');
      }
    });
  }
}
