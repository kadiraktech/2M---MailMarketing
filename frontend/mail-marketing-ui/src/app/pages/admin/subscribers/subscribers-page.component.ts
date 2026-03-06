import { Component } from '@angular/core';
import { DatePipe, NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ApiService, SubscriberDto } from '../../../core/api.service';
import { ToastService } from '../../../core/toast.service';
import { ConfirmService } from '../../../core/confirm.service';
import { getApiErrorMessage } from '../../../core/api-error.util';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  standalone: true,
  imports: [NgIf, DatePipe, ReactiveFormsModule, TranslateModule, CardModule, TableModule, ButtonModule, InputTextModule],
  styles: [`
    .subscribers-layout {
      display: grid;
      grid-template-columns: minmax(280px, 360px) 1fr;
      gap: 1rem;
    }
    .subscribers-filter {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: .5rem;
      margin-bottom: 1rem;
      align-items: end;
    }
    .subscribers-filter .email-col {
      grid-column: span 2;
    }
    @media (max-width: 991px) {
      .subscribers-layout {
        grid-template-columns: 1fr;
      }
      .subscribers-filter {
        grid-template-columns: 1fr 1fr;
      }
      .subscribers-filter .email-col,
      .subscribers-filter .btn-col {
        grid-column: span 2;
      }
    }
  `],
  template: `
    <p-card [header]="'subscribersPage.title' | translate">
      <div class="subscribers-layout">
        <div>
          <h3 class="h6 mb-3">{{ 'subscribersPage.newSubscriber' | translate }}</h3>
          <form [formGroup]="createForm" (ngSubmit)="create()" class="d-grid gap-2">
            <input pInputText [placeholder]="'subscribersPage.fullName' | translate" formControlName="fullName" />
            <input pInputText [placeholder]="'subscribersPage.email' | translate" formControlName="email" />
            <small class="text-danger" *ngIf="createForm.controls.email.touched && createForm.controls.email.invalid">
              {{ 'subscribersPage.validEmail' | translate }}
            </small>
            <button pButton type="submit" [label]="'subscribersPage.add' | translate" severity="success" [disabled]="createForm.invalid"></button>
          </form>
        </div>

        <div>
          <form [formGroup]="filterForm" (ngSubmit)="load()" class="subscribers-filter">
            <div class="email-col">
              <input pInputText class="w-100" [placeholder]="'subscribersPage.searchEmail' | translate" formControlName="email" />
            </div>
            <div>
              <input pInputText class="w-100" type="date" formControlName="createdFrom" />
            </div>
            <div>
              <input pInputText class="w-100" type="date" formControlName="createdTo" />
            </div>
            <div class="btn-col">
              <button pButton type="submit" [label]="'subscribersPage.filter' | translate" [outlined]="true"></button>
            </div>
          </form>

          <p-table
            [value]="subscribers"
            [paginator]="true"
            [rows]="10"
            [rowsPerPageOptions]="[10, 20, 50]"
            [responsiveLayout]="'scroll'"
            [stripedRows]="true"
            size="small"
            dataKey="id"
            *ngIf="subscribers.length; else emptyState">

            <ng-template pTemplate="header">
              <tr>
                <th>{{ 'subscribersPage.table.email' | translate }}</th>
                <th>{{ 'subscribersPage.table.createdAt' | translate }}</th>
                <th class="text-end">{{ 'subscribersPage.table.action' | translate }}</th>
              </tr>
            </ng-template>

            <ng-template pTemplate="body" let-s>
              <tr>
                <td>
                  <div class="fw-semibold">{{ s.email }}</div>
                  <div class="small text-muted">{{ s.fullName || '-' }}</div>
                </td>
                <td>{{ s.createdAtUtc | date: 'short' }}</td>
                <td class="text-end">
                  <button
                    pButton
                    type="button"
                    size="small"
                    [outlined]="true"
                    severity="danger"
                    [label]="'subscribersPage.delete' | translate"
                    (click)="remove(s)">
                  </button>
                </td>
              </tr>
            </ng-template>
          </p-table>

          <ng-template #emptyState>
            <div class="alert alert-light border mb-0">{{ 'subscribersPage.empty' | translate }}</div>
          </ng-template>
        </div>
      </div>
    </p-card>
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

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private toast: ToastService,
    private confirm: ConfirmService,
    private translate: TranslateService
  ) {
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
        this.toast.show(this.translate.instant('subscribersPage.toast.added'), 'success');
        this.createForm.reset({ fullName: '', email: '' });
        this.load();
      },
      error: (err) => this.toast.show(getApiErrorMessage(err), 'danger')
    });
  }

  remove(subscriber: SubscriberDto) {
    if (!this.confirm.confirm(this.translate.instant('subscribersPage.confirmDelete', { email: subscriber.email }))) return;

    this.api.deleteSubscriber(subscriber.id).subscribe({
      next: () => {
        this.toast.show(this.translate.instant('subscribersPage.toast.deleted'), 'success');
        this.load();
      },
      error: (err) => this.toast.show(getApiErrorMessage(err), 'danger')
    });
  }
}
