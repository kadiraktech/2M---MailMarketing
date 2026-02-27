import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { getApiErrorMessage } from '../../core/api-error.util';

@Component({
  standalone: true,
  selector: 'app-subscribe-page',
  imports: [ReactiveFormsModule, NgIf],
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
              <span class="hero-pill mb-3">Yeni duyurular • Kampanyalar • İçerikler</span>
              <h1 class="hero-title fw-bold mb-3">MailMarketing Bültenine Katılın</h1>
              <p class="text-muted mb-4">
                Özel fırsatları kaçırmamak, yeni e-posta şablonlarını görmek ve kampanya takibini kolaylaştırmak için
                bültene katılın.
              </p>
            </div>

            <div class="row g-2 g-md-3">
              <div class="col-12 col-md-4">
                <div class="feature-card">
                  <div class="feature-icon">01</div>
                  <div class="fw-semibold">Erken Erişim</div>
                  <div class="small text-muted">Yeni kampanyaları herkesten önce alın.</div>
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="feature-card">
                  <div class="feature-icon">02</div>
                  <div class="fw-semibold">Haftalık Özet</div>
                  <div class="small text-muted">Kısa, net ve düzenli e-posta akışı.</div>
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="feature-card">
                  <div class="feature-icon">03</div>
                  <div class="fw-semibold">Tek Tık Çıkış</div>
                  <div class="small text-muted">İstediğiniz zaman abonelikten ayrılabilirsiniz.</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-lg-5">
          <div class="subscribe-form p-4 h-100">
            <h2 class="h5 mb-2">Abonelik Formu</h2>
            <p class="muted-note mb-3">Bilgilerinizi girin, güncellemeleri e-posta ile gönderelim.</p>

            <form [formGroup]="form" (ngSubmit)="submit()" class="d-grid gap-2">
              <input class="form-control" placeholder="Ad Soyad (opsiyonel)" formControlName="fullName" />
              <small class="text-danger" *ngIf="form.controls.fullName.invalid && form.controls.fullName.touched">
                Ad Soyad en fazla 200 karakter olabilir.
              </small>

              <input class="form-control" placeholder="E-posta" formControlName="email" />
              <small class="text-danger" *ngIf="form.controls.email.invalid && form.controls.email.touched">
                Geçerli e-posta giriniz.
              </small>

              <button class="btn btn-primary submit-btn mt-1" [disabled]="form.invalid || loading">
                {{ loading ? 'Kaydediliyor...' : 'Bültene Katıl' }}
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

  constructor(private fb: FormBuilder, private api: ApiService) {}

  submit() {
    if (this.form.invalid || this.loading) return;

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.api.subscribe(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Abonelik başarılı. Teşekkür ederiz.';
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

