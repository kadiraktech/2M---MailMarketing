import { Component, OnDestroy } from '@angular/core';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ApiService, BatchSummaryDto, ReportItemDto, SummaryDto, TemplateDto } from '../../../core/api.service';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

@Component({
  standalone: true,
  imports: [NgIf, NgFor, ReactiveFormsModule, DatePipe, TranslateModule, CardModule, ButtonModule, InputTextModule, TableModule, TagModule],
  template: `
    <div class="row g-3">
      <div class="col-12">
        <div class="row g-3" *ngIf="summary">
          <div class="col-12 col-md-6 col-xl-3">
            <p-card styleClass="p-3">
              <div class="text-muted small">{{ 'reportingPage.kpi.subscribers' | translate }}</div>
              <div class="fs-4 fw-bold">{{ summary.totalSubscribers }}</div>
            </p-card>
          </div>
          <div class="col-12 col-md-6 col-xl-3">
            <p-card styleClass="p-3">
              <div class="text-muted small">{{ 'reportingPage.kpi.templates' | translate }}</div>
              <div class="fs-4 fw-bold">{{ summary.totalTemplates }}</div>
            </p-card>
          </div>
          <div class="col-12 col-md-6 col-xl-3">
            <p-card styleClass="p-3">
              <div class="text-muted small">{{ 'reportingPage.kpi.sendItems' | translate }}</div>
              <div class="fs-4 fw-bold">{{ summary.totalSendItems }}</div>
            </p-card>
          </div>
          <div class="col-12 col-md-6 col-xl-3">
            <p-card styleClass="p-3">
              <div class="text-muted small">{{ 'reportingPage.kpi.failed' | translate }}</div>
              <div class="fs-4 fw-bold">{{ summary.totalFailed }}</div>
            </p-card>
          </div>
        </div>
      </div>

      <div class="col-12" *ngIf="batchSummary">
        <p-card styleClass="p-3">
          <div class="d-flex gap-2 flex-wrap">
            <p-tag severity="warn" [value]="('reportingPage.batch.pending' | translate) + ': ' + batchSummary.pending"></p-tag>
            <p-tag severity="info" [value]="('reportingPage.batch.running' | translate) + ': ' + batchSummary.running"></p-tag>
            <p-tag severity="success" [value]="('reportingPage.batch.completed' | translate) + ': ' + batchSummary.completed"></p-tag>
            <p-tag severity="danger" [value]="('reportingPage.batch.failed' | translate) + ': ' + batchSummary.completedWithErrors"></p-tag>
          </div>
        </p-card>
      </div>

      <div class="col-12">
        <p-card styleClass="p-4">
          <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <h2 class="h5 mb-0">{{ 'reportingPage.title' | translate }}</h2>
            <button pButton type="button" size="small" [outlined]="true" severity="secondary" (click)="loadAll()">{{ 'reportingPage.refresh' | translate }}</button>
          </div>

          <form [formGroup]="filterForm" (ngSubmit)="loadReports()" class="row g-2 mb-3 mt-1">
            <div class="col-12 col-md-3">
              <select class="form-select" formControlName="templateId">
                <option [ngValue]="''">{{ 'reportingPage.filters.allTemplates' | translate }}</option>
                <option *ngFor="let t of templates" [ngValue]="t.id">{{ t.name }}</option>
              </select>
            </div>
            <div class="col-6 col-md-2"><input pInputText class="w-100" type="date" formControlName="fromDate" /></div>
            <div class="col-6 col-md-2"><input pInputText class="w-100" type="date" formControlName="toDate" /></div>
            <div class="col-6 col-md-2">
              <select class="form-select" formControlName="status">
                <option value="">{{ 'reportingPage.filters.allStatuses' | translate }}</option>
                <option value="Pending">{{ 'dashboardPage.status.Pending' | translate }}</option>
                <option value="Processing">{{ 'dashboardPage.status.Processing' | translate }}</option>
                <option value="Success">{{ 'dashboardPage.status.Success' | translate }}</option>
                <option value="Failed">{{ 'dashboardPage.status.Failed' | translate }}</option>
              </select>
            </div>
            <div class="col-6 col-md-2"><input pInputText class="w-100" [placeholder]="'reportingPage.filters.email' | translate" formControlName="email" /></div>
            <div class="col-12 col-md-1 d-grid"><button pButton type="submit" [outlined]="true">{{ 'reportingPage.filters.search' | translate }}</button></div>
          </form>

          <p-table
            [value]="items"
            [responsiveLayout]="'scroll'"
            [paginator]="true"
            [rows]="10"
            [rowsPerPageOptions]="[10, 20, 50]"
            [stripedRows]="true"
            size="small"
            *ngIf="items.length; else emptyState">
            <ng-template pTemplate="header">
              <tr>
                <th>{{ 'reportingPage.table.email' | translate }}</th>
                <th>{{ 'reportingPage.table.template' | translate }}</th>
                <th>{{ 'reportingPage.table.sendTime' | translate }}</th>
                <th>{{ 'reportingPage.table.status' | translate }}</th>
                <th>{{ 'reportingPage.table.message' | translate }}</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-item>
              <tr>
                <td>{{ item.subscriberEmail }}</td>
                <td>{{ item.templateName }}</td>
                <td>{{ item.sendTimeUtc | date: 'short' }}</td>
                <td>
                  <p-tag
                    [value]="('dashboardPage.status.' + item.status) | translate"
                    [severity]="item.status === 'Success' ? 'success' : item.status === 'Failed' ? 'danger' : item.status === 'Processing' ? 'info' : 'warn'">
                  </p-tag>
                </td>
                <td>{{ item.message || '-' }}</td>
              </tr>
            </ng-template>
          </p-table>

          <ng-template #emptyState>
            <div class="alert alert-light border mb-0">{{ 'reportingPage.empty' | translate }}</div>
          </ng-template>
        </p-card>
      </div>
    </div>
  `
})
export class ReportingPageComponent implements OnDestroy {
  summary?: SummaryDto;
  batchSummary?: BatchSummaryDto;
  templates: TemplateDto[] = [];
  items: ReportItemDto[] = [];
  private readonly timerId: ReturnType<typeof setInterval>;

  readonly filterForm = this.fb.group({
    templateId: ['' as number | ''],
    fromDate: [''],
    toDate: [''],
    status: [''],
    email: ['']
  });

  constructor(private fb: FormBuilder, private api: ApiService) {
    this.api.getTemplates().subscribe((res) => (this.templates = res));
    this.loadAll();
    this.timerId = setInterval(() => this.loadAll(), 10000);
  }

  ngOnDestroy(): void {
    clearInterval(this.timerId);
  }

  loadAll() {
    this.api.getSummary().subscribe((res) => (this.summary = res));
    this.api.getBatchSummary().subscribe((res) => (this.batchSummary = res));
    this.loadReports();
  }

  loadReports() {
    const filters = this.filterForm.getRawValue();
    const templateIdFilter = filters.templateId === null ? '' : filters.templateId;
    this.api.getReportItems({
      templateId: templateIdFilter,
      fromUtc: filters.fromDate ? `${filters.fromDate}T00:00:00Z` : undefined,
      toUtc: filters.toDate ? `${filters.toDate}T23:59:59Z` : undefined,
      status: filters.status ?? '',
      email: filters.email ?? ''
    }).subscribe((res) => (this.items = res));
  }
}
