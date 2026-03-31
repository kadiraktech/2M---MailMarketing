import { Component, OnDestroy } from '@angular/core';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';
import {
  ApiService,
  LiveDashboardDto,
  LiveDashboardHealthStatusDto
} from '../../../core/api.service';
import { AuthService } from '../../../core/auth.service';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { Subscription, interval } from 'rxjs';

@Component({
  standalone: true,
  imports: [RouterLink, NgIf, NgFor, DatePipe, TranslateModule, CardModule, ButtonModule, TagModule],
  styles: [`
    .hero-card {
      border: 1px solid #d5e2f0;
      background:
        radial-gradient(circle at top right, rgba(51, 119, 204, 0.12), transparent 34%),
        linear-gradient(145deg, #ffffff, #f4f8fc);
      box-shadow: 0 14px 34px rgba(28, 61, 94, 0.09);
    }
    .hero-title {
      font-size: 2rem;
      line-height: 1.1;
      letter-spacing: -0.03em;
    }
    .hero-meta {
      color: #5b6b7c;
      font-size: .95rem;
    }
    .section-title {
      font-size: .82rem;
      font-weight: 700;
      letter-spacing: .08em;
      text-transform: uppercase;
      color: #60758b;
      margin-bottom: .85rem;
    }
    .metric-card {
      height: 100%;
      border: 1px solid #d8e3ee;
      border-radius: 16px;
      background: #fff;
      box-shadow: 0 10px 22px rgba(31, 60, 91, 0.05);
    }
    .metric-label {
      color: #66788a;
      font-size: .9rem;
      margin-bottom: .35rem;
    }
    .metric-value {
      font-size: 2rem;
      font-weight: 700;
      line-height: 1;
      color: #11253c;
    }
    .metric-subtle {
      color: #7b8c9c;
      font-size: .82rem;
      margin-top: .5rem;
    }
    .panel-card {
      border: 1px solid #d8e3ee;
      border-radius: 18px;
      background: linear-gradient(180deg, #ffffff, #fbfdff);
      box-shadow: 0 12px 26px rgba(31, 60, 91, 0.05);
    }
    .health-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: .85rem;
    }
    .health-card {
      border: 1px solid #e0e8f0;
      border-radius: 14px;
      padding: .9rem;
      background: #fff;
    }
    .health-name {
      font-weight: 600;
      color: #24384d;
    }
    .health-message {
      color: #6a7c8f;
      font-size: .82rem;
      min-height: 2.4em;
      margin-top: .45rem;
    }
    .health-time {
      color: #8595a6;
      font-size: .78rem;
      margin-top: .45rem;
    }
    .activity-list {
      display: grid;
      gap: .75rem;
    }
    .activity-row {
      border: 1px solid #e1e8f0;
      border-radius: 14px;
      padding: .9rem 1rem;
      background: #fff;
    }
    .activity-title {
      font-weight: 600;
      color: #1d3148;
    }
    .activity-meta {
      color: #6e8093;
      font-size: .84rem;
      margin-top: .2rem;
    }
    .activity-message {
      color: #66788a;
      font-size: .84rem;
      margin-top: .55rem;
    }
    .empty-state,
    .error-state {
      border: 1px dashed #cfdbe8;
      border-radius: 16px;
      padding: 1.2rem;
      background: #f9fbfd;
      color: #5f7183;
    }
    .error-state {
      border-color: #e7c6c6;
      background: #fff8f8;
      color: #8d4343;
    }
    .menu-link {
      min-width: 140px;
      text-align: center;
      font-weight: 500;
    }
    @media (max-width: 991px) {
      .health-grid {
        grid-template-columns: 1fr;
      }
    }
  `],
  template: `
    <p-card styleClass="hero-card p-4 mb-3">
      <div class="d-flex flex-wrap align-items-start justify-content-between gap-3">
        <div>
          <div class="text-uppercase small text-muted mb-1">{{ 'dashboardPage.panel' | translate }}</div>
          <h2 class="hero-title fw-bold mb-2">{{ 'dashboardPage.liveTitle' | translate }}</h2>
          <div class="hero-meta">
            {{ 'dashboardPage.welcome' | translate }} <strong>{{ auth.currentUser()?.fullName || '-' }}</strong>
          </div>
          <div class="hero-meta mt-1" *ngIf="dashboard">
            {{ 'dashboardPage.lastUpdated' | translate }} {{ dashboard.generatedAtUtc | date:'short' }}
          </div>
        </div>
        <div class="d-flex align-items-center gap-2">
          <p-tag
            *ngIf="dashboard"
            [value]="('dashboardPage.health.status.' + dashboard.health.worker.status) | translate"
            [severity]="healthSeverity(dashboard.health.worker.status)">
          </p-tag>
          <button pButton type="button" size="small" [outlined]="true" severity="secondary" [disabled]="refreshing" (click)="refresh()">
            {{ 'refresh' | translate }}
          </button>
        </div>
      </div>
    </p-card>

    <div class="row g-3 mb-3" *ngIf="loading && !dashboard">
      <div class="col-12">
        <div class="empty-state">{{ 'dashboardPage.loading' | translate }}</div>
      </div>
    </div>

    <div class="row g-3 mb-3" *ngIf="errorMessage && !dashboard">
      <div class="col-12">
        <div class="error-state">{{ errorMessage | translate }}</div>
      </div>
    </div>

    <ng-container *ngIf="dashboard as vm">
      <div class="row g-3">
        <div class="col-12 col-xl-6">
          <p-card styleClass="panel-card p-4 h-100">
            <div class="section-title">{{ 'dashboardPage.sections.queue' | translate }}</div>
            <div class="row g-3">
              <div class="col-12 col-md-4">
                <div class="metric-card p-3">
                  <div class="metric-label">{{ 'dashboardPage.queue.totalQueuedJobs' | translate }}</div>
                  <div class="metric-value">{{ vm.queue.totalQueuedJobs }}</div>
                  <div class="metric-subtle">{{ 'dashboardPage.queue.totalQueuedJobsHint' | translate }}</div>
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="metric-card p-3">
                  <div class="metric-label">{{ 'dashboardPage.queue.processingJobs' | translate }}</div>
                  <div class="metric-value">{{ vm.queue.processingJobs }}</div>
                  <div class="metric-subtle">{{ 'dashboardPage.queue.processingJobsHint' | translate }}</div>
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="metric-card p-3">
                  <div class="metric-label">{{ 'dashboardPage.queue.retryPendingJobs' | translate }}</div>
                  <div class="metric-value">{{ vm.queue.retryPendingJobs }}</div>
                  <div class="metric-subtle">{{ 'dashboardPage.queue.retryPendingJobsHint' | translate }}</div>
                </div>
              </div>
            </div>
          </p-card>
        </div>

        <div class="col-12 col-xl-6">
          <p-card styleClass="panel-card p-4 h-100">
            <div class="section-title">{{ 'dashboardPage.sections.sending' | translate }}</div>
            <div class="row g-3">
              <div class="col-12 col-md-4">
                <div class="metric-card p-3">
                  <div class="metric-label">{{ 'dashboardPage.sending.activeSendOperations' | translate }}</div>
                  <div class="metric-value">{{ vm.sending.activeSendOperations }}</div>
                  <div class="metric-subtle">{{ 'dashboardPage.sending.activeSendOperationsHint' | translate }}</div>
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="metric-card p-3">
                  <div class="metric-label">{{ 'dashboardPage.sending.successfulSendCount' | translate }}</div>
                  <div class="metric-value">{{ vm.sending.successfulSendCount }}</div>
                  <div class="metric-subtle">{{ 'dashboardPage.sending.successfulSendCountHint' | translate }}</div>
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="metric-card p-3">
                  <div class="metric-label">{{ 'dashboardPage.sending.failedSendCount' | translate }}</div>
                  <div class="metric-value">{{ vm.sending.failedSendCount }}</div>
                  <div class="metric-subtle">{{ 'dashboardPage.sending.failedSendCountHint' | translate }}</div>
                </div>
              </div>
            </div>
          </p-card>
        </div>
      </div>

      <div class="row g-3 mt-1">
        <div class="col-12 col-xl-4">
          <p-card styleClass="panel-card p-4 h-100">
            <div class="d-flex justify-content-between align-items-center gap-2 mb-3">
              <div class="section-title mb-0">{{ 'dashboardPage.sections.health' | translate }}</div>
              <p-tag
                [value]="('dashboardPage.health.status.' + vm.health.api.status) | translate"
                [severity]="healthSeverity(vm.health.api.status)">
              </p-tag>
            </div>

            <div class="health-grid">
              <div class="health-card" *ngFor="let item of healthCards(vm)">
                <div class="d-flex justify-content-between align-items-start gap-2">
                  <div class="health-name">{{ item.labelKey | translate }}</div>
                  <p-tag
                    [value]="('dashboardPage.health.status.' + item.data.status) | translate"
                    [severity]="healthSeverity(item.data.status)">
                  </p-tag>
                </div>
                <div class="health-message">{{ item.data.message || ('dashboardPage.health.noMessage' | translate) }}</div>
                <div class="health-time" *ngIf="item.lastTime">
                  {{ item.lastTimeLabelKey | translate }} {{ item.lastTime | date:'short' }}
                </div>
              </div>
            </div>
          </p-card>
        </div>

        <div class="col-12 col-xl-8">
          <p-card styleClass="panel-card p-4 h-100">
            <div class="d-flex justify-content-between align-items-center gap-2 mb-3">
              <div class="section-title mb-0">{{ 'dashboardPage.sections.recentActivity' | translate }}</div>
              <a pButton size="small" [outlined]="true" routerLink="/admin/reporting">{{ 'dashboardPage.detailReport' | translate }}</a>
            </div>

            <div *ngIf="vm.recentActivity.length === 0" class="empty-state">
              {{ 'dashboardPage.noRecentActivity' | translate }}
            </div>

            <div *ngIf="vm.recentActivity.length > 0" class="activity-list">
              <div *ngFor="let item of vm.recentActivity" class="activity-row">
                <div class="d-flex justify-content-between align-items-start gap-2 flex-wrap">
                  <div>
                    <div class="activity-title">{{ item.subscriberEmail || '-' }}</div>
                    <div class="activity-meta">
                      {{ item.templateName || '-' }}
                      <span *ngIf="item.batchId">&bull; {{ 'dashboardPage.activity.batch' | translate }} #{{ item.batchId }}</span>
                      <span *ngIf="item.retryCount > 0">&bull; {{ 'dashboardPage.activity.retryCount' | translate }}: {{ item.retryCount }}</span>
                    </div>
                  </div>
                  <div class="text-end">
                    <p-tag
                      [value]="('dashboardPage.status.' + item.status) | translate"
                      [severity]="statusSeverity(item.status)">
                    </p-tag>
                    <div class="activity-meta mt-2">{{ item.eventTimeUtc | date:'short' }}</div>
                  </div>
                </div>
                <div class="activity-message" *ngIf="item.message">{{ item.message }}</div>
              </div>
            </div>
          </p-card>
        </div>
      </div>

      <div class="row g-3 mt-1" *ngIf="errorMessage">
        <div class="col-12">
          <div class="error-state">{{ errorMessage | translate }}</div>
        </div>
      </div>
    </ng-container>

    <p-card styleClass="panel-card p-4 mt-3">
      <div class="section-title">{{ 'dashboardPage.quickAccess' | translate }}</div>
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
export class DashboardPageComponent implements OnDestroy {
  dashboard?: LiveDashboardDto;
  loading = true;
  refreshing = false;
  errorMessage = '';

  private readonly pollSubscription: Subscription;
  private requestSubscription?: Subscription;

  constructor(public auth: AuthService, private api: ApiService) {
    this.refresh();
    this.pollSubscription = interval(10000).subscribe(() => this.refresh());
  }

  ngOnDestroy(): void {
    this.pollSubscription.unsubscribe();
    this.requestSubscription?.unsubscribe();
  }

  refresh(): void {
    if (this.refreshing) {
      return;
    }

    this.loading = !this.dashboard;
    this.refreshing = true;
    this.requestSubscription = this.api.getLiveDashboard().subscribe({
      next: (res) => {
        this.dashboard = res;
        this.loading = false;
        this.refreshing = false;
        this.errorMessage = '';
      },
      error: () => {
        this.loading = false;
        this.refreshing = false;
        this.errorMessage = 'dashboardPage.refreshError';
      }
    });
  }

  statusSeverity(status: string): 'success' | 'danger' | 'info' | 'warn' | 'secondary' {
    if (status === 'Success') return 'success';
    if (status === 'Failed') return 'danger';
    if (status === 'Processing') return 'info';
    if (status === 'Pending') return 'warn';
    return 'secondary';
  }

  healthSeverity(status: string): 'success' | 'danger' | 'info' | 'warn' | 'secondary' {
    if (status === 'Healthy') return 'success';
    if (status === 'Unhealthy') return 'danger';
    if (status === 'Unknown') return 'warn';
    if (status === 'NotConfigured' || status === 'Unused') return 'secondary';
    return 'info';
  }

  healthCards(vm: LiveDashboardDto): Array<{
    labelKey: string;
    lastTime?: string;
    lastTimeLabelKey: string;
    data: LiveDashboardHealthStatusDto & { lastHeartbeatUtc?: string; lastActivityUtc?: string };
  }> {
    return [
      {
        labelKey: 'dashboardPage.health.api',
        data: vm.health.api,
        lastTimeLabelKey: 'dashboardPage.health.lastChecked'
      },
      {
        labelKey: 'dashboardPage.health.database',
        data: vm.health.database,
        lastTimeLabelKey: 'dashboardPage.health.lastChecked'
      },
      {
        labelKey: 'dashboardPage.health.rabbitMq',
        data: vm.health.rabbitMq,
        lastTimeLabelKey: 'dashboardPage.health.lastChecked'
      },
      {
        labelKey: 'dashboardPage.health.worker',
        data: vm.health.worker,
        lastTime: vm.health.worker.lastActivityUtc || vm.health.worker.lastHeartbeatUtc,
        lastTimeLabelKey: vm.health.worker.lastActivityUtc
          ? 'dashboardPage.health.lastActivity'
          : 'dashboardPage.health.lastHeartbeat'
      }
    ];
  }
}
