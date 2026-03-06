import { Component } from '@angular/core';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';
import { ApiService, BatchSummaryDto, ReportItemDto, SummaryDto } from '../../../core/api.service';
import { AuthService } from '../../../core/auth.service';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';

@Component({
  standalone: true,
  imports: [RouterLink, NgIf, NgFor, DatePipe, TranslateModule, CardModule, ButtonModule, TagModule],
  styles: [`
    .hero-card {
      border: 1px solid #d4e3f1;
      background: linear-gradient(145deg, #ffffff, #f6fbff);
      box-shadow: 0 10px 28px rgba(35, 76, 119, 0.08);
    }
    .hero-title {
      font-size: 2rem;
      line-height: 1.15;
      letter-spacing: -0.02em;
    }
    .kpi-tile {
      border: 1px solid #d7e6f6;
      border-radius: 12px;
      background: #fff;
      transition: transform .15s ease, box-shadow .15s ease;
    }
    .kpi-tile:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(43, 91, 140, 0.10);
    }
    .dot {
      width: 10px;
      height: 10px;
      border-radius: 999px;
      display: inline-block;
      margin-right: .4rem;
    }
    .dot-pending { background: #f6ad37; }
    .dot-running { background: #2f80ed; }
    .dot-complete { background: #1ca653; }
    .dot-error { background: #d84c4c; }
    .activity-row {
      border-bottom: 1px dashed #d9e5f1;
      padding: .55rem 0;
    }
    .activity-row:last-child { border-bottom: none; }
    .menu-link {
      min-width: 140px;
      text-align: center;
      font-weight: 500;
    }
  `],
  template: `
    <p-card styleClass="hero-card p-4 mb-3">
      <div class="d-flex flex-wrap align-items-start justify-content-between gap-2">
        <div>
          <div class="text-uppercase small text-muted mb-1">{{ 'dashboardPage.panel' | translate }}</div>
          <h2 class="hero-title fw-bold mb-1">{{ 'dashboard' | translate }}</h2>
          <div class="text-muted">{{ 'dashboardPage.welcome' | translate }} <strong>{{ auth.currentUser()?.fullName || '-' }}</strong></div>
        </div>
        <button pButton type="button" size="small" [outlined]="true" severity="secondary" (click)="refresh()">{{ 'refresh' | translate }}</button>
      </div>
    </p-card>

    <div class="row g-3" *ngIf="summary">
      <div class="col-12 col-md-6 col-xl-3">
        <div class="kpi-tile p-3 h-100">
          <div class="text-muted small">{{ 'dashboardPage.kpi.subscribers' | translate }}</div>
          <div class="fs-4 fw-bold">{{ summary.totalSubscribers }}</div>
        </div>
      </div>
      <div class="col-12 col-md-6 col-xl-3">
        <div class="kpi-tile p-3 h-100">
          <div class="text-muted small">{{ 'dashboardPage.kpi.templates' | translate }}</div>
          <div class="fs-4 fw-bold">{{ summary.totalTemplates }}</div>
        </div>
      </div>
      <div class="col-12 col-md-6 col-xl-3">
        <div class="kpi-tile p-3 h-100">
          <div class="text-muted small">{{ 'dashboardPage.kpi.sendItems' | translate }}</div>
          <div class="fs-4 fw-bold">{{ summary.totalSendItems }}</div>
        </div>
      </div>
      <div class="col-12 col-md-6 col-xl-3">
        <div class="kpi-tile p-3 h-100">
          <div class="text-muted small">{{ 'dashboardPage.kpi.successRate' | translate }}</div>
          <div class="fs-4 fw-bold">%{{ successRate }}</div>
        </div>
      </div>
    </div>

    <div class="row g-3 mt-1">
      <div class="col-12 col-xl-4">
        <p-card styleClass="p-4 h-100">
          <h3 class="h6 mb-3">{{ 'dashboardPage.batchSummaryTitle' | translate }}</h3>
          <div class="mb-2"><span class="dot dot-pending"></span>{{ 'dashboardPage.batch.pending' | translate }}: <strong>{{ batchSummary?.pending ?? 0 }}</strong></div>
          <div class="mb-2"><span class="dot dot-running"></span>{{ 'dashboardPage.batch.running' | translate }}: <strong>{{ batchSummary?.running ?? 0 }}</strong></div>
          <div class="mb-2"><span class="dot dot-complete"></span>{{ 'dashboardPage.batch.completed' | translate }}: <strong>{{ batchSummary?.completed ?? 0 }}</strong></div>
          <div><span class="dot dot-error"></span>{{ 'dashboardPage.batch.completedWithErrors' | translate }}: <strong>{{ batchSummary?.completedWithErrors ?? 0 }}</strong></div>
        </p-card>
      </div>

      <div class="col-12 col-xl-8">
        <p-card styleClass="p-4 h-100">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h3 class="h6 mb-0">{{ 'dashboardPage.recentActivities' | translate }}</h3>
            <a pButton size="small" [outlined]="true" routerLink="/admin/reporting">{{ 'dashboardPage.detailReport' | translate }}</a>
          </div>

          <div *ngIf="recentItems.length === 0" class="text-muted small">{{ 'dashboardPage.noRecent' | translate }}</div>
          <div *ngFor="let item of recentItems" class="activity-row">
            <div class="d-flex justify-content-between align-items-start gap-2">
              <div>
                <div class="fw-semibold">{{ item.subscriberEmail }}</div>
                <div class="small text-muted">{{ item.templateName }}</div>
              </div>
              <div class="text-end small">
                <p-tag
                  [value]="('dashboardPage.status.' + item.status) | translate"
                  [severity]="item.status === 'Success' ? 'success' : item.status === 'Failed' ? 'danger' : item.status === 'Processing' ? 'info' : 'warn'">
                </p-tag>
                <div class="text-muted">{{ item.sendTimeUtc | date:'short' }}</div>
              </div>
            </div>
          </div>
        </p-card>
      </div>
    </div>

    <p-card styleClass="p-4 mt-3">
      <h3 class="h6 mb-3">{{ 'dashboardPage.quickAccess' | translate }}</h3>
      <div class="d-flex flex-wrap gap-2">
        <a pButton [outlined]="true" styleClass="menu-link" routerLink="/admin/profile">{{ 'dashboardPage.links.profile' | translate }}</a>
        <a pButton [outlined]="true" styleClass="menu-link" routerLink="/admin/subscribers">{{ 'subscribers' | translate }}</a>
        <a pButton [outlined]="true" styleClass="menu-link" routerLink="/admin/templates">{{ 'templates' | translate }}</a>
        <a pButton [outlined]="true" styleClass="menu-link" routerLink="/admin/send">{{ 'dashboardPage.links.send' | translate }}</a>
        <a pButton [outlined]="true" styleClass="menu-link" routerLink="/admin/reporting">{{ 'dashboardPage.links.reporting' | translate }}</a>
        <a pButton [outlined]="true" styleClass="menu-link" routerLink="/admin/settings">{{ 'dashboardPage.links.settings' | translate }}</a>
        <a pButton severity="danger" [outlined]="true" styleClass="menu-link" routerLink="/admin/users">{{ 'dashboardPage.links.usersAdmin' | translate }}</a>
      </div>
    </p-card>
  `
})
export class DashboardPageComponent {
  summary?: SummaryDto;
  batchSummary?: BatchSummaryDto;
  recentItems: ReportItemDto[] = [];

  constructor(public auth: AuthService, private api: ApiService) {
    this.refresh();
  }

  get successRate(): number {
    if (!this.summary || this.summary.totalSendItems === 0) return 0;
    return Math.round((this.summary.totalSuccess / this.summary.totalSendItems) * 100);
  }

  refresh(): void {
    this.api.getSummary().subscribe((res) => (this.summary = res));
    this.api.getBatchSummary().subscribe((res) => (this.batchSummary = res));
    this.api.getReportItems({}).subscribe((res) => (this.recentItems = res.slice(0, 6)));
  }

  statusText(status: string): string {
    if (status === 'Success') return 'Ba\u015far\u0131l\u0131';
    if (status === 'Failed') return 'Ba\u015far\u0131s\u0131z';
    if (status === 'Processing') return '\u0130\u015fleniyor';
    return 'Beklemede';
  }

  statusClass(status: string): string {
    if (status === 'Success') return 'text-success fw-semibold';
    if (status === 'Failed') return 'text-danger fw-semibold';
    if (status === 'Processing') return 'text-primary fw-semibold';
    return 'text-warning fw-semibold';
  }
}
