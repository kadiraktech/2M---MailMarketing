import { Component } from '@angular/core';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService, BatchSummaryDto, ReportItemDto, SummaryDto } from '../../../core/api.service';
import { AuthService } from '../../../core/auth.service';

@Component({
  standalone: true,
  imports: [RouterLink, NgIf, NgFor, DatePipe],
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
    <div class="card hero-card p-4 mb-3">
      <div class="d-flex flex-wrap align-items-start justify-content-between gap-2">
        <div>
          <div class="text-uppercase small text-muted mb-1">Y&ouml;netim Paneli</div>
          <h2 class="hero-title fw-bold mb-1">Dashboard</h2>
          <div class="text-muted">Ho&#351; geldiniz, <strong>{{ auth.currentUser()?.fullName || '-' }}</strong></div>
        </div>
        <button type="button" class="btn btn-outline-secondary btn-sm" (click)="refresh()">Yenile</button>
      </div>
    </div>

    <div class="row g-3" *ngIf="summary">
      <div class="col-12 col-md-6 col-xl-3">
        <div class="kpi-tile p-3 h-100">
          <div class="text-muted small">Abone Say&#305;s&#305;</div>
          <div class="fs-4 fw-bold">{{ summary.totalSubscribers }}</div>
        </div>
      </div>
      <div class="col-12 col-md-6 col-xl-3">
        <div class="kpi-tile p-3 h-100">
          <div class="text-muted small">&#350;ablon Say&#305;s&#305;</div>
          <div class="fs-4 fw-bold">{{ summary.totalTemplates }}</div>
        </div>
      </div>
      <div class="col-12 col-md-6 col-xl-3">
        <div class="kpi-tile p-3 h-100">
          <div class="text-muted small">G&ouml;nderim Kay&#305;tlar&#305;</div>
          <div class="fs-4 fw-bold">{{ summary.totalSendItems }}</div>
        </div>
      </div>
      <div class="col-12 col-md-6 col-xl-3">
        <div class="kpi-tile p-3 h-100">
          <div class="text-muted small">Ba&#351;ar&#305; Oran&#305;</div>
          <div class="fs-4 fw-bold">%{{ successRate }}</div>
        </div>
      </div>
    </div>

    <div class="row g-3 mt-1">
      <div class="col-12 col-xl-4">
        <div class="card p-4 h-100">
          <h3 class="h6 mb-3">Batch Durum &Ouml;zeti</h3>
          <div class="mb-2"><span class="dot dot-pending"></span>Bekleyen: <strong>{{ batchSummary?.pending ?? 0 }}</strong></div>
          <div class="mb-2"><span class="dot dot-running"></span>&Ccedil;al&#305;&#351;an: <strong>{{ batchSummary?.running ?? 0 }}</strong></div>
          <div class="mb-2"><span class="dot dot-complete"></span>Tamamlanan: <strong>{{ batchSummary?.completed ?? 0 }}</strong></div>
          <div><span class="dot dot-error"></span>Hatal&#305; Tamamlanan: <strong>{{ batchSummary?.completedWithErrors ?? 0 }}</strong></div>
        </div>
      </div>

      <div class="col-12 col-xl-8">
        <div class="card p-4 h-100">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h3 class="h6 mb-0">Son G&ouml;nderim Aktiviteleri</h3>
            <a class="btn btn-sm btn-outline-primary" routerLink="/admin/reporting">Detay Rapor</a>
          </div>

          <div *ngIf="recentItems.length === 0" class="text-muted small">Hen&uuml;z g&ouml;nderim kayd&#305; yok.</div>
          <div *ngFor="let item of recentItems" class="activity-row">
            <div class="d-flex justify-content-between align-items-start gap-2">
              <div>
                <div class="fw-semibold">{{ item.subscriberEmail }}</div>
                <div class="small text-muted">{{ item.templateName }}</div>
              </div>
              <div class="text-end small">
                <div [class]="statusClass(item.status)">{{ statusText(item.status) }}</div>
                <div class="text-muted">{{ item.sendTimeUtc | date:'short' }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card p-4 mt-3">
      <h3 class="h6 mb-3">H&#305;zl&#305; Eri&#351;im</h3>
      <div class="d-flex flex-wrap gap-2">
        <a class="btn btn-outline-primary menu-link" routerLink="/admin/profile">Profil</a>
        <a class="btn btn-outline-primary menu-link" routerLink="/admin/subscribers">Aboneler</a>
        <a class="btn btn-outline-primary menu-link" routerLink="/admin/templates">&#350;ablonlar</a>
        <a class="btn btn-outline-primary menu-link" routerLink="/admin/send">G&ouml;nderim</a>
        <a class="btn btn-outline-primary menu-link" routerLink="/admin/reporting">Raporlama</a>
        <a class="btn btn-outline-primary menu-link" routerLink="/admin/settings">Ayarlar</a>
        <a class="btn btn-outline-danger menu-link" routerLink="/admin/users">Kullan&#305;c&#305;lar (Admin)</a>
      </div>
    </div>
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
