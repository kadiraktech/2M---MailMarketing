import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ApiService } from '../../../core/api.service';
import { ToastService } from '../../../core/toast.service';
import { getApiErrorMessage } from '../../../core/api-error.util';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    TranslateModule,
    CardModule,
    InputTextModule,
    CheckboxModule,
    ButtonModule,
    ProgressSpinnerModule
  ],
  styles: [`
    .settings-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: .5rem;
    }
    .col-span-2 {
      grid-column: span 2;
    }
    .actions-row {
      display: flex;
      gap: .5rem;
      align-items: center;
      margin-top: .5rem;
    }
    .spinner-inline {
      width: 20px;
      height: 20px;
    }
    @media (max-width: 900px) {
      .settings-grid {
        grid-template-columns: 1fr;
      }
      .col-span-2 {
        grid-column: span 1;
      }
    }
  `],
  template: `
    <p-card [header]="'settingsPage.smtpTitle' | translate">
      <form [formGroup]="form" (ngSubmit)="save()" class="settings-grid mt-2">
        <div>
          <input pInputText class="w-100" [placeholder]="'settingsPage.host' | translate" formControlName="host" />
          <small class="text-danger" *ngIf="form.controls.host.touched && form.controls.host.invalid">{{ 'settingsPage.hostRequired' | translate }}</small>
        </div>
        <div>
          <input pInputText class="w-100" type="number" [placeholder]="'settingsPage.port' | translate" formControlName="port" />
        </div>
        <div>
          <input pInputText class="w-100" [placeholder]="'settingsPage.username' | translate" formControlName="username" />
        </div>
        <div>
          <input pInputText class="w-100" [placeholder]="'settingsPage.fromEmail' | translate" formControlName="fromEmail" />
          <small class="text-danger" *ngIf="form.controls.fromEmail.touched && form.controls.fromEmail.invalid">{{ 'settingsPage.validEmail' | translate }}</small>
        </div>
        <div class="col-span-2">
          <input pInputText class="w-100" [placeholder]="'settingsPage.password' | translate" formControlName="password" type="password" />
        </div>
        <div class="col-span-2 d-flex align-items-center gap-2">
          <p-checkbox inputId="useSsl" formControlName="useSsl" [binary]="true"></p-checkbox>
          <label for="useSsl" class="mb-0">{{ 'settingsPage.useSsl' | translate }}</label>
        </div>
        <div class="col-span-2 actions-row">
          <button pButton type="submit" [label]="'settingsPage.save' | translate" severity="success" [disabled]="form.invalid || loading"></button>
          <p-progressSpinner *ngIf="loading" styleClass="spinner-inline" strokeWidth="6" fill="transparent"></p-progressSpinner>
        </div>
      </form>

      <hr class="my-4" />

      <h3 class="h6">{{ 'settingsPage.testTitle' | translate }}</h3>
      <form [formGroup]="testForm" (ngSubmit)="sendTestMail()" class="settings-grid mt-2">
        <div class="col-span-2">
          <input pInputText class="w-100" [placeholder]="'settingsPage.testTarget' | translate" formControlName="toEmail" />
          <small class="text-muted">{{ 'settingsPage.testHint' | translate }}</small>
        </div>
        <div class="col-span-2 actions-row">
          <button pButton type="submit" [label]="'settingsPage.testSend' | translate" [outlined]="true" [disabled]="testLoading || testForm.invalid"></button>
          <p-progressSpinner *ngIf="testLoading" styleClass="spinner-inline" strokeWidth="6" fill="transparent"></p-progressSpinner>
        </div>
      </form>
    </p-card>
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

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private toast: ToastService,
    private translate: TranslateService
  ) {
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
        this.toast.show(this.translate.instant('settingsPage.toast.saved'), 'success');
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
        this.toast.show(res.message || this.translate.instant('settingsPage.toast.testSent'), 'success');
      },
      error: (err) => {
        this.testLoading = false;
        this.toast.show(getApiErrorMessage(err), 'danger');
      }
    });
  }
}
