import { Component, OnDestroy } from '@angular/core';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ApiService, BatchSummaryDto, ReportItemDto, SummaryDto, TemplateDto } from '../../../core/api.service';

@Component({
  standalone: true,
  imports: [NgIf, NgFor, ReactiveFormsModule, DatePipe],
  template: `
    <div class="row g-3">
      <div class="col-12">
        <div class="row g-3" *ngIf="summary">
          <div class="col-12 col-md-6 col-xl-3"><div class="card p-3"><div class="text-muted small">Abone</div><div class="fs-4 fw-bold">{{ summary.totalSubscribers }}</div></div></div>
          <div class="col-12 col-md-6 col-xl-3"><div class="card p-3"><div class="text-muted small">Şablon</div><div class="fs-4 fw-bold">{{ summary.totalTemplates }}</div></div></div>
          <div class="col-12 col-md-6 col-xl-3"><div class="card p-3"><div class="text-muted small">Gönderim</div><div class="fs-4 fw-bold">{{ summary.totalSendItems }}</div></div></div>
          <div class="col-12 col-md-6 col-xl-3"><div class="card p-3"><div class="text-muted small">Başarısız</div><div class="fs-4 fw-bold">{{ summary.totalFailed }}</div></div></div>
        </div>
      </div>

      <div class="col-12" *ngIf="batchSummary">
        <div class="card p-3">
          <div class="d-flex gap-4 flex-wrap">
            <span><strong>Batch Bekleyen:</strong> {{ batchSummary.pending }}</span>
            <span><strong>Batch Çalışıyor:</strong> {{ batchSummary.running }}</span>
            <span><strong>Batch Tamamlandı:</strong> {{ batchSummary.completed }}</span>
            <span><strong>Batch Hatalı:</strong> {{ batchSummary.completedWithErrors }}</span>
          </div>
        </div>
      </div>

      <div class="col-12">
        <div class="card p-4">
          <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <h2 class="h5 mb-0">Gönderim Raporu</h2>
            <button class="btn btn-outline-secondary btn-sm" type="button" (click)="loadAll()">Yenile</button>
          </div>

          <form [formGroup]="filterForm" (ngSubmit)="loadReports()" class="row g-2 mb-3 mt-1">
            <div class="col-12 col-md-3">
              <select class="form-select" formControlName="templateId">
                <option [ngValue]="''">Tüm Şablonlar</option>
                <option *ngFor="let t of templates" [ngValue]="t.id">{{ t.name }}</option>
              </select>
            </div>
            <div class="col-6 col-md-2"><input class="form-control" type="date" formControlName="fromDate" /></div>
            <div class="col-6 col-md-2"><input class="form-control" type="date" formControlName="toDate" /></div>
            <div class="col-6 col-md-2">
              <select class="form-select" formControlName="status">
                <option value="">Tüm Durumlar</option>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Success">Success</option>
                <option value="Failed">Failed</option>
              </select>
            </div>
            <div class="col-6 col-md-2"><input class="form-control" placeholder="E-posta" formControlName="email" /></div>
            <div class="col-12 col-md-1 d-grid"><button class="btn btn-outline-primary">Ara</button></div>
          </form>

          <div class="table-responsive" *ngIf="items.length; else emptyState">
            <table class="table table-striped table-hover align-middle">
              <thead>
                <tr>
                  <th>E-posta</th>
                  <th>Şablon</th>
                  <th>Gönderim Zamanı</th>
                  <th>Durum</th>
                  <th>Mesaj</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of items">
                  <td>{{ item.subscriberEmail }}</td>
                  <td>{{ item.templateName }}</td>
                  <td>{{ item.sendTimeUtc | date: 'short' }}</td>
                  <td>{{ item.status }}</td>
                  <td>{{ item.message || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <ng-template #emptyState>
            <div class="alert alert-light border mb-0">Filtreye uygun rapor kaydı bulunamadı.</div>
          </ng-template>
        </div>
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

