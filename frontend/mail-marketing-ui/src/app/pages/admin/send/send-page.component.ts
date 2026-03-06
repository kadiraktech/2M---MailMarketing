import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ApiService, SubscriberDto, TemplateDto } from '../../../core/api.service';
import { ToastService } from '../../../core/toast.service';
import { ConfirmService } from '../../../core/confirm.service';
import { getApiErrorMessage } from '../../../core/api-error.util';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    TranslateModule,
    CardModule,
    DropdownModule,
    CheckboxModule,
    TableModule,
    ButtonModule,
    ProgressSpinnerModule
  ],
  styles: [`
    .send-form {
      display: grid;
      gap: 1rem;
      margin-top: .5rem;
    }
    .subscribers-box {
      border: 1px solid var(--surface-border, #d6dde6);
      border-radius: 10px;
      padding: .5rem;
    }
    .submit-row {
      display: flex;
      gap: .5rem;
      align-items: center;
    }
    .spinner-inline {
      width: 22px;
      height: 22px;
    }
  `],
  template: `
    <p-card [header]="'sendPage.title' | translate">
      <form [formGroup]="form" (ngSubmit)="submit()" class="send-form">
        <div>
          <label class="form-label">{{ 'sendPage.activeTemplate' | translate }}</label>
          <p-dropdown
            formControlName="templateId"
            [options]="templates"
            optionLabel="name"
            optionValue="id"
            [showClear]="true"
            [placeholder]="'sendPage.selectTemplate' | translate"
            class="w-100">
            <ng-template let-t pTemplate="item">
              <span>{{ t.name }} - {{ t.subject }}</span>
            </ng-template>
            <ng-template let-t pTemplate="selectedItem">
              <span *ngIf="t">{{ t.name }} - {{ t.subject }}</span>
            </ng-template>
          </p-dropdown>
        </div>

        <div class="d-flex align-items-center gap-2">
          <p-checkbox
            inputId="allSubs"
            formControlName="useAllActiveSubscribers"
            [binary]="true">
          </p-checkbox>
          <label for="allSubs" class="mb-0">{{ 'sendPage.sendToAllActive' | translate }}</label>
        </div>

        <div *ngIf="!form.controls.useAllActiveSubscribers.value">
          <label class="form-label">{{ 'sendPage.subscriberSelection' | translate }}</label>
          <div class="subscribers-box">
            <p-table
              [value]="subscribers"
              [paginator]="true"
              [rows]="10"
              [rowsPerPageOptions]="[10, 20, 50]"
              [responsiveLayout]="'scroll'"
              [stripedRows]="true"
              size="small"
              dataKey="id">
              <ng-template pTemplate="header">
                <tr>
                  <th style="width: 72px;">{{ 'sendPage.table.select' | translate }}</th>
                  <th>{{ 'sendPage.table.email' | translate }}</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-s>
                <tr>
                  <td>
                    <input
                      type="checkbox"
                      [id]="'sub_' + s.id"
                      [checked]="selectedSubscriberIds.has(s.id)"
                      (change)="toggleSubscriber(s.id, $event)" />
                  </td>
                  <td>
                    <label [for]="'sub_' + s.id" class="mb-0">{{ s.email }}</label>
                  </td>
                </tr>
              </ng-template>
            </p-table>
          </div>
          <small class="text-danger" *ngIf="selectedSubscriberIds.size === 0">{{ 'sendPage.selectAtLeastOne' | translate }}</small>
        </div>

        <div class="submit-row">
          <button pButton type="submit" [label]="'sendPage.start' | translate" [disabled]="!canSubmit || loading"></button>
          <p-progressSpinner *ngIf="loading" styleClass="spinner-inline" strokeWidth="6" fill="transparent"></p-progressSpinner>
        </div>
      </form>
    </p-card>
  `
})
export class SendPageComponent {
  templates: TemplateDto[] = [];
  subscribers: SubscriberDto[] = [];
  selectedSubscriberIds = new Set<number>();
  loading = false;

  readonly form = this.fb.group({
    templateId: [null as number | null, [Validators.required]],
    useAllActiveSubscribers: [true]
  });

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private toast: ToastService,
    private confirm: ConfirmService,
    private translate: TranslateService
  ) {
    this.api.getActiveTemplates().subscribe((res) => (this.templates = res));
    this.api.getSubscribers().subscribe((res) => (this.subscribers = res.filter((x) => x.isActive)));
  }

  get canSubmit(): boolean {
    if (!this.form.controls.templateId.value) return false;
    if (this.form.controls.useAllActiveSubscribers.value) return true;
    return this.selectedSubscriberIds.size > 0;
  }

  toggleSubscriber(id: number, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) this.selectedSubscriberIds.add(id);
    else this.selectedSubscriberIds.delete(id);
  }

  submit() {
    if (!this.canSubmit || this.loading) return;
    if (!this.confirm.confirm(this.translate.instant('sendPage.confirmCreate'))) return;

    this.loading = true;
    const useAll = !!this.form.controls.useAllActiveSubscribers.value;

    this.api.createBatch({
      templateId: this.form.controls.templateId.value,
      useAllActiveSubscribers: useAll,
      subscriberIds: useAll ? [] : Array.from(this.selectedSubscriberIds)
    }).subscribe({
      next: () => {
        this.loading = false;
        this.toast.show(this.translate.instant('sendPage.toast.created'), 'success');
      },
      error: (err) => {
        this.loading = false;
        this.toast.show(getApiErrorMessage(err), 'danger');
      }
    });
  }
}
