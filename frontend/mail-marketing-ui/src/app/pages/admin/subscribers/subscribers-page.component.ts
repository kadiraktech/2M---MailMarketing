import { Component } from '@angular/core';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService, SubscriberDto } from '../../../core/api.service';
import { ToastService } from '../../../core/toast.service';
import { ConfirmService } from '../../../core/confirm.service';
import { getApiErrorMessage } from '../../../core/api-error.util';

@Component({
  standalone: true,
  imports: [NgFor, NgIf, DatePipe, ReactiveFormsModule],
  template: `
    <div class="row g-3">
      <div class="col-12 col-lg-4">
        <div class="card p-4 h-100">
          <h2 class="h5">Yeni Abone</h2>
          <form [formGroup]="createForm" (ngSubmit)="create()" class="d-grid gap-2 mt-2">
            <input class="form-control" placeholder="Ad Soyad" formControlName="fullName" />
            <input class="form-control" placeholder="E-posta" formControlName="email" />
            <small class="text-danger" *ngIf="createForm.controls.email.touched && createForm.controls.email.invalid">Geçerli e-posta giriniz.</small>
            <button class="btn btn-success" [disabled]="createForm.invalid">Ekle</button>
          </form>
        </div>
      </div>

      <div class="col-12 col-lg-8">
        <div class="card p-4">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h2 class="h4 mb-0">Aboneler</h2>
            <span class="badge bg-info text-dark">Toplam: {{ subscribers.length }}</span>
          </div>

          <form [formGroup]="filterForm" (ngSubmit)="load()" class="row g-2 mb-3">
            <div class="col-12 col-md-4">
              <input class="form-control" placeholder="E-posta ara" formControlName="email" />
            </div>
            <div class="col-6 col-md-3">
              <input class="form-control" type="date" formControlName="createdFrom" />
            </div>
            <div class="col-6 col-md-3">
              <input class="form-control" type="date" formControlName="createdTo" />
            </div>
            <div class="col-12 col-md-2 d-grid">
              <button class="btn btn-outline-primary">Filtrele</button>
            </div>
          </form>

          <div class="table-responsive" *ngIf="subscribers.length; else emptyState">
            <table class="table table-striped table-hover align-middle">
              <thead>
                <tr>
                  <th>#</th>
                  <th>E-posta</th>
                  <th>Ad Soyad</th>
                  <th>Eklenme</th>
                  <th class="text-end">İşlem</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let s of subscribers">
                  <td>{{ s.id }}</td>
                  <td>{{ s.email }}</td>
                  <td>{{ s.fullName || '-' }}</td>
                  <td>{{ s.createdAtUtc | date: 'short' }}</td>
                  <td class="text-end">
                    <button class="btn btn-sm btn-outline-danger" (click)="remove(s)">Sil</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <ng-template #emptyState>
            <div class="alert alert-light border mb-0">Kayıt bulunamadı.</div>
          </ng-template>
        </div>
      </div>
    </div>
  `
})
export class SubscribersPageComponent {
  subscribers: SubscriberDto[] = [];

  readonly createForm = this.fb.group({
    fullName: ['', [Validators.maxLength(200)]],
    email: ['', [Validators.required, Validators.email]]
  });

  readonly filterForm = this.fb.group({
    email: [''],
    createdFrom: [''],
    createdTo: ['']
  });

  constructor(private fb: FormBuilder, private api: ApiService, private toast: ToastService, private confirm: ConfirmService) {
    this.load();
  }

  load() {
    const filters = this.filterForm.getRawValue();
    this.api.getSubscribers({
      email: filters.email ?? '',
      createdFromUtc: filters.createdFrom ? `${filters.createdFrom}T00:00:00Z` : undefined,
      createdToUtc: filters.createdTo ? `${filters.createdTo}T23:59:59Z` : undefined
    }).subscribe((res) => (this.subscribers = res));
  }

  create() {
    if (this.createForm.invalid) return;

    this.api.createSubscriber(this.createForm.getRawValue()).subscribe({
      next: () => {
        this.toast.show('Abone eklendi.', 'success');
        this.createForm.reset({ fullName: '', email: '' });
        this.load();
      },
      error: (err) => this.toast.show(getApiErrorMessage(err), 'danger')
    });
  }

  remove(subscriber: SubscriberDto) {
    if (!this.confirm.confirm(`${subscriber.email} silinsin mi?`)) return;

    this.api.deleteSubscriber(subscriber.id).subscribe({
      next: () => {
        this.toast.show('Abone silindi.', 'success');
        this.load();
      },
      error: (err) => this.toast.show(getApiErrorMessage(err), 'danger')
    });
  }
}

