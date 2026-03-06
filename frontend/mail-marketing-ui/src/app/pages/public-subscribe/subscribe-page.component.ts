import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ApiService } from '../../core/api.service';
import { getApiErrorMessage } from '../../core/api-error.util';

@Component({
  standalone: true,
  selector: 'app-subscribe-page',
  imports: [ReactiveFormsModule, NgIf, TranslateModule],
  styles: [`
    .hero-shell {
      background: radial-gradient(circle at 20% 10%, #e5f2ff 0%, #f7fbff 42%, #eefcf1 100%);
      border: 1px solid #dbe8f6;
      border-radius: 16px;
      box-shadow: 0 12px 35px rgba(32, 70, 110, 0.08);
    }
    .hero-title {
      font-size: 2rem;
      line-height: 1.2;
      letter-spacing: -0.02em;
    }
    .hero-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.3rem 0.7rem;
      border-radius: 999px;
      background: #e8f3ff;
      color: #1d5ea8;
      font-size: 0.82rem;
      font-weight: 600;
    }
    .feature-card {
      border: 1px solid #d9e8f7;
      border-radius: 12px;
      background: #ffffffd6;
      padding: 0.9rem;
      height: 100%;
    }
    .feature-icon {
      width: 34px;
      height: 34px;
      border-radius: 10px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: #edf5ff;
      color: #286dbb;
      font-weight: 700;
      margin-bottom: 0.4rem;
    }
    .subscribe-form {
      border: 1px solid #d9e7f4;
      border-radius: 14px;
      background: #fff;
      box-shadow: 0 10px 30px rgba(47, 86, 128, 0.08);
    }
    .submit-btn {
      min-height: 44px;
      font-weight: 600;
    }
    .muted-note {
      color: #637990;
      font-size: 0.9rem;
    }
    @media (max-width: 991px) {
      .hero-title {
        font-size: 1.65rem;
      }
    }
  `],
  template: `
    <div class="hero-shell p-3 p-md-4">
      <div class="row g-4 align-items-stretch">
        <div class="col-12 col-lg-7">
          <div class="h-100 d-flex flex-column justify-content-between">
            <div>
              <span class="hero-pill mb-3">{{ 'public.subscribe.pill' | translate }}</span>
              <h1 class="hero-title fw-bold mb-3">{{ 'public.subscribe.heroTitle' | translate }}</h1>
              <p class="text-muted mb-4">
                {{ 'public.subscribe.heroDesc' | translate }}
              </p>
            </div>

            <div class="row g-2 g-md-3">
              <div class="col-12 col-md-4">
                <div class="feature-card">
                  <div class="feature-icon">01</div>
                  <div class="fw-semibold">{{ 'public.subscribe.features.earlyAccessTitle' | translate }}</div>
                  <div class="small text-muted">{{ 'public.subscribe.features.earlyAccessDesc' | translate }}</div>
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="feature-card">
                  <div class="feature-icon">02</div>
                  <div class="fw-semibold">{{ 'public.subscribe.features.weeklyTitle' | translate }}</div>
                  <div class="small text-muted">{{ 'public.subscribe.features.weeklyDesc' | translate }}</div>
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="feature-card">
                  <div class="feature-icon">03</div>
                  <div class="fw-semibold">{{ 'public.subscribe.features.oneClickTitle' | translate }}</div>
                  <div class="small text-muted">{{ 'public.subscribe.features.oneClickDesc' | translate }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-lg-5">
          <div class="subscribe-form p-4 h-100">
            <h2 class="h5 mb-2">{{ 'public.subscribe.formTitle' | translate }}</h2>
            <p class="muted-note mb-3">{{ 'public.subscribe.formDesc' | translate }}</p>

            <form [formGroup]="form" (ngSubmit)="submit()" class="d-grid gap-2">
              <input class="form-control" [placeholder]="'public.subscribe.fullNameOptional' | translate" formControlName="fullName" />
              <small class="text-danger" *ngIf="form.controls.fullName.invalid && form.controls.fullName.touched">
                {{ 'public.subscribe.fullNameValidation' | translate }}
              </small>

              <input class="form-control" [placeholder]="'public.subscribe.email' | translate" formControlName="email" />
              <small class="text-danger" *ngIf="form.controls.email.invalid && form.controls.email.touched">
                {{ 'public.subscribe.validEmail' | translate }}
              </small>

              <button class="btn btn-primary submit-btn mt-1" [disabled]="form.invalid || loading">
                {{ loading ? ('public.subscribe.saving' | translate) : ('public.subscribe.submit' | translate) }}
              </button>
            </form>

            <div *ngIf="errorMessage" class="alert alert-danger mt-3 mb-0">{{ errorMessage }}</div>
            <div *ngIf="successMessage" class="alert alert-success mt-3 mb-0">{{ successMessage }}</div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SubscribePageComponent {
  readonly form = this.fb.group({
    fullName: ['', [Validators.maxLength(200)]],
    email: ['', [Validators.required, Validators.email]]
  });

  successMessage = '';
  errorMessage = '';
  loading = false;

  constructor(private fb: FormBuilder, private api: ApiService, private translate: TranslateService) {}

  submit() {
    if (this.form.invalid || this.loading) return;

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.api.subscribe(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = this.translate.instant('public.subscribe.success');
        this.form.reset({ fullName: '', email: '' });
        setTimeout(() => (this.successMessage = ''), 4000);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = getApiErrorMessage(err);
      }
    });
  }
}
