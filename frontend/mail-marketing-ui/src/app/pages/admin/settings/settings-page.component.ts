import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../../core/api.service';
import { ToastService } from '../../../core/toast.service';
import { getApiErrorMessage } from '../../../core/api-error.util';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  template: `
    <div class="card p-4">
      <h2 class="h4">SMTP Ayarları</h2>
      <form [formGroup]="form" (ngSubmit)="save()" class="row g-2 mt-1">
        <div class="col-12 col-md-6">
          <input class="form-control" placeholder="Host" formControlName="host" />
          <small class="text-danger" *ngIf="form.controls.host.touched && form.controls.host.invalid">Host zorunludur.</small>
        </div>
        <div class="col-12 col-md-6">
          <input class="form-control" type="number" placeholder="Port" formControlName="port" />
        </div>
        <div class="col-12 col-md-6">
          <input class="form-control" placeholder="Kullanıcı Adı" formControlName="username" />
        </div>
        <div class="col-12 col-md-6">
          <input class="form-control" placeholder="Gönderen E-posta" formControlName="fromEmail" />
          <small class="text-danger" *ngIf="form.controls.fromEmail.touched && form.controls.fromEmail.invalid">Geçerli e-posta giriniz.</small>
        </div>
        <div class="col-12">
          <input class="form-control" placeholder="Şifre" formControlName="password" type="password" />
        </div>
        <div class="col-12 form-check ms-1">
          <input class="form-check-input" type="checkbox" formControlName="useSsl" id="useSsl" />
          <label class="form-check-label" for="useSsl">SSL kullan</label>
        </div>
        <div class="col-12 d-flex gap-2 flex-wrap">
          <button class="btn btn-success" [disabled]="form.invalid || loading">Kaydet</button>
        </div>
      </form>

      <hr class="my-4" />

      <h3 class="h6">Test Mail Gönder</h3>
      <form [formGroup]="testForm" (ngSubmit)="sendTestMail()" class="row g-2 mt-1">
        <div class="col-12 col-md-8">
          <input class="form-control" placeholder="Hedef e-posta (boşsa hesabınız)" formControlName="toEmail" />
          <small class="text-muted">Boş bırakırsanız giriş yapan kullanıcının e-postası kullanılır.</small>
        </div>
        <div class="col-12 col-md-4 d-grid">
          <button class="btn btn-outline-primary" [disabled]="testLoading || testForm.invalid">Test Mail Gönder</button>
        </div>
      </form>
    </div>
  `
})
export class SettingsPageComponent {
  readonly form = this.fb.group({
    host: ['', Validators.required],
    port: [587, [Validators.required, Validators.min(1)]],
    username: ['', Validators.required],
    password: ['', Validators.required],
    fromEmail: ['', [Validators.required, Validators.email]],
    useSsl: [true]
  });

  readonly testForm = this.fb.group({
    toEmail: ['', [Validators.pattern(/^(|[^\s@]+@[^\s@]+\.[^\s@]+)$/)]]
  });

  loading = false;
  testLoading = false;

  constructor(private fb: FormBuilder, private api: ApiService, private toast: ToastService) {
    this.api.getSmtp().subscribe((res) => {
      if (!res) return;
      this.form.patchValue({
        host: res.host,
        port: res.port,
        username: res.username,
        fromEmail: res.fromEmail,
        useSsl: res.useSsl
      });
    });
  }

  save() {
    if (this.form.invalid || this.loading) return;

    this.loading = true;
    this.api.saveSmtp(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading = false;
        this.toast.show('SMTP ayarları kaydedildi.', 'success');
      },
      error: (err) => {
        this.loading = false;
        this.toast.show(getApiErrorMessage(err), 'danger');
      }
    });
  }

  sendTestMail() {
    if (this.testLoading || this.testForm.invalid) return;

    this.testLoading = true;
    const toEmail = (this.testForm.controls.toEmail.value ?? '').trim();

    this.api.testSmtp({ toEmail: toEmail || undefined }).subscribe({
      next: (res) => {
        this.testLoading = false;
        this.toast.show(res.message || 'Test e-postası gönderildi.', 'success');
      },
      error: (err) => {
        this.testLoading = false;
        this.toast.show(getApiErrorMessage(err), 'danger');
      }
    });
  }
}

