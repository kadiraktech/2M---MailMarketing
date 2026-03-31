import { Component } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  ApiService,
  CampaignGoal,
  CampaignRecommendationResponseDto,
  RecommendationSignalCategory,
  SubscriberDto,
  TemplateDto
} from '../../../core/api.service';
import { ToastService } from '../../../core/toast.service';
import { ConfirmService } from '../../../core/confirm.service';
import { getApiErrorMessage } from '../../../core/api-error.util';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';

@Component({
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    NgFor,
    TranslateModule,
    CardModule,
    DropdownModule,
    CheckboxModule,
    TableModule,
    ButtonModule,
    ProgressSpinnerModule,
    TagModule
  ],
  styles: [`
    .page-stack {
      display: grid;
      gap: 1rem;
    }
    .recommendation-hero {
      border: 1px solid #d9e5f2;
      background:
        radial-gradient(circle at top right, rgba(42, 112, 196, 0.12), transparent 32%),
        linear-gradient(145deg, #ffffff, #f4f8fc);
      box-shadow: 0 12px 30px rgba(29, 64, 99, 0.08);
    }
    .recommendation-grid {
      display: grid;
      grid-template-columns: minmax(0, 1.05fr) minmax(0, .95fr);
      gap: 1rem;
      align-items: start;
    }
    .recommendation-form {
      display: grid;
      gap: 1rem;
    }
    .context-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: .75rem;
    }
    .context-field {
      display: grid;
      gap: .35rem;
    }
    .context-input {
      border: 1px solid #d4deea;
      border-radius: 10px;
      padding: .65rem .8rem;
      width: 100%;
      background: #fff;
    }
    .context-input:focus {
      outline: none;
      border-color: #4a86c5;
      box-shadow: 0 0 0 3px rgba(74, 134, 197, 0.14);
    }
    .recommendation-state {
      border: 1px dashed #cfdae6;
      border-radius: 14px;
      padding: .95rem 1rem;
      background: #f8fbfd;
      color: #617384;
      font-size: .92rem;
    }
    .recommendation-error {
      border-color: #ebcaca;
      background: #fff8f8;
      color: #944848;
    }
    .recommendation-success {
      border-color: #cfe6d3;
      background: #f7fcf7;
      color: #2e6d3d;
    }
    .recommendation-brief {
      border: 1px solid #d9e5f2;
      border-radius: 18px;
      padding: 1rem;
      background:
        linear-gradient(180deg, #ffffff, #f8fbff);
      box-shadow: 0 10px 22px rgba(29, 64, 99, 0.05);
    }
    .brief-eyebrow {
      font-size: .78rem;
      font-weight: 700;
      letter-spacing: .08em;
      text-transform: uppercase;
      color: #677b90;
      margin-bottom: .55rem;
    }
    .brief-goal {
      font-size: 1.05rem;
      font-weight: 700;
      color: #1d3448;
    }
    .brief-summary {
      color: #4f6276;
      margin-top: .75rem;
      margin-bottom: 0;
      line-height: 1.55;
    }
    .metadata-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: .75rem;
      margin-top: 1rem;
    }
    .metadata-card {
      border: 1px solid #e1e8f0;
      border-radius: 12px;
      padding: .8rem .9rem;
      background: #fff;
    }
    .metadata-label {
      font-size: .74rem;
      text-transform: uppercase;
      letter-spacing: .07em;
      color: #78899a;
      margin-bottom: .25rem;
    }
    .metadata-value {
      color: #22384c;
      font-weight: 600;
      word-break: break-word;
    }
    .group-grid {
      display: grid;
      gap: 1rem;
      margin-top: 1rem;
    }
    .group-card {
      border: 1px solid #dde7f2;
      border-radius: 16px;
      padding: 1rem;
      background: #fff;
    }
    .group-title {
      font-size: .82rem;
      font-weight: 700;
      letter-spacing: .08em;
      text-transform: uppercase;
      color: #64778b;
      margin-bottom: .85rem;
    }
    .recommendation-list {
      display: grid;
      gap: .75rem;
    }
    .recommendation-item {
      border: 1px solid #e3eaf2;
      border-radius: 12px;
      padding: .9rem .95rem;
      background: #fcfdff;
    }
    .recommendation-item-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: .75rem;
      margin-bottom: .45rem;
      flex-wrap: wrap;
    }
    .recommendation-title {
      font-weight: 600;
      color: #213548;
      margin-bottom: 0;
      line-height: 1.45;
    }
    .recommendation-reason {
      color: #697c8e;
      font-size: .9rem;
      margin: 0;
      line-height: 1.55;
    }
    .subscribers-box {
      border: 1px solid var(--surface-border, #d6dde6);
      border-radius: 10px;
      padding: .5rem;
    }
    .send-form {
      display: grid;
      gap: 1rem;
      margin-top: .5rem;
    }
    .submit-row {
      display: flex;
      gap: .5rem;
      align-items: center;
      flex-wrap: wrap;
    }
    .spinner-inline {
      width: 22px;
      height: 22px;
    }
    @media (max-width: 991px) {
      .recommendation-grid {
        grid-template-columns: 1fr;
      }
      .context-grid,
      .metadata-grid {
        grid-template-columns: 1fr;
      }
    }
  `],
  template: `
    <div class="page-stack">
      <p-card styleClass="recommendation-hero p-4">
        <div class="d-flex flex-wrap justify-content-between align-items-start gap-3">
          <div>
            <div class="text-uppercase small text-muted mb-1">{{ 'sendPage.recommendations.eyebrow' | translate }}</div>
            <h2 class="h4 mb-2">{{ 'sendPage.recommendations.title' | translate }}</h2>
            <p class="text-muted mb-0">{{ 'sendPage.recommendations.description' | translate }}</p>
          </div>
          <p-tag severity="info" [value]="'sendPage.recommendations.reviewOnly' | translate"></p-tag>
        </div>
      </p-card>

      <div class="recommendation-grid">
        <p-card styleClass="p-4 h-100">
          <form [formGroup]="recommendationForm" (ngSubmit)="requestRecommendations()" class="recommendation-form">
            <div>
              <label class="form-label">{{ 'sendPage.recommendations.goalLabel' | translate }}</label>
              <select class="form-select" formControlName="goal">
                <option [ngValue]="null">{{ 'sendPage.recommendations.goalPlaceholder' | translate }}</option>
                <option *ngFor="let goal of goalOptions" [ngValue]="goal.value">{{ goal.labelKey | translate }}</option>
              </select>
            </div>

            <div>
              <div class="d-flex justify-content-between align-items-center gap-2 mb-2">
                <label class="form-label mb-0">{{ 'sendPage.recommendations.contextTitle' | translate }}</label>
                <small class="text-muted">{{ 'sendPage.recommendations.contextHint' | translate }}</small>
              </div>

              <div class="context-grid">
                <div class="context-field">
                  <label>{{ 'sendPage.recommendations.context.availableTemplateCount' | translate }}</label>
                  <input class="context-input" type="number" min="0" formControlName="availableTemplateCount" />
                </div>
                <div class="context-field">
                  <label>{{ 'sendPage.recommendations.context.totalSubscriberCount' | translate }}</label>
                  <input class="context-input" type="number" min="0" formControlName="totalSubscriberCount" />
                </div>
                <div class="context-field">
                  <label>{{ 'sendPage.recommendations.context.activeSubscriberCount' | translate }}</label>
                  <input class="context-input" type="number" min="0" formControlName="activeSubscriberCount" />
                </div>
                <div class="context-field">
                  <label>{{ 'sendPage.recommendations.context.inactiveSubscriberCount' | translate }}</label>
                  <input class="context-input" type="number" min="0" formControlName="inactiveSubscriberCount" />
                </div>
                <div class="context-field">
                  <label>{{ 'sendPage.recommendations.context.recentSuccessfulSendCount' | translate }}</label>
                  <input class="context-input" type="number" min="0" formControlName="recentSuccessfulSendCount" />
                </div>
                <div class="context-field">
                  <label>{{ 'sendPage.recommendations.context.recentFailedSendCount' | translate }}</label>
                  <input class="context-input" type="number" min="0" formControlName="recentFailedSendCount" />
                </div>
              </div>
            </div>

            <div class="submit-row">
              <button
                pButton
                type="submit"
                [label]="'sendPage.recommendations.request' | translate"
                [disabled]="recommendationForm.invalid || recommendationLoading">
              </button>
              <button
                pButton
                type="button"
                severity="secondary"
                [outlined]="true"
                [label]="'sendPage.recommendations.resetContext' | translate"
                [disabled]="recommendationLoading"
                (click)="resetRecommendationContext()">
              </button>
              <p-progressSpinner *ngIf="recommendationLoading" styleClass="spinner-inline" strokeWidth="6" fill="transparent"></p-progressSpinner>
            </div>
          </form>
        </p-card>

        <p-card styleClass="p-4 h-100">
          <div *ngIf="!recommendations && !recommendationLoading && !recommendationError" class="recommendation-state">
            {{ 'sendPage.recommendations.empty' | translate }}
          </div>

          <div *ngIf="recommendationLoading" class="recommendation-state">
            {{ 'sendPage.recommendations.loading' | translate }}
          </div>

          <div *ngIf="recommendationError" class="recommendation-state recommendation-error">
            {{ recommendationError }}
          </div>

          <ng-container *ngIf="recommendations">
            <div class="recommendation-brief">
              <div class="d-flex flex-wrap justify-content-between align-items-start gap-2">
                <div>
                  <div class="brief-eyebrow">{{ 'sendPage.recommendations.summaryTitle' | translate }}</div>
                  <div class="brief-goal">{{ goalLabel(recommendations.goal) }}</div>
                </div>
                <div class="d-flex gap-2 flex-wrap justify-content-end">
                  <p-tag *ngIf="recommendations.providerType" severity="secondary" [value]="recommendations.providerType"></p-tag>
                  <p-tag *ngIf="recommendationsAccepted" severity="success" [value]="'sendPage.recommendations.accepted' | translate"></p-tag>
                </div>
              </div>
              <p class="brief-summary">{{ recommendations.summary }}</p>

              <div class="metadata-grid">
                <div class="metadata-card" *ngIf="recommendations.providerDisplayName || recommendations.provider">
                  <div class="metadata-label">{{ 'sendPage.recommendations.metadata.providerDisplayName' | translate }}</div>
                  <div class="metadata-value">{{ recommendations.providerDisplayName || recommendations.provider }}</div>
                </div>
                <div class="metadata-card" *ngIf="recommendations.generationMode">
                  <div class="metadata-label">{{ 'sendPage.recommendations.metadata.generationMode' | translate }}</div>
                  <div class="metadata-value">{{ recommendations.generationMode }}</div>
                </div>
                <div class="metadata-card" *ngIf="recommendations.explanationStyle">
                  <div class="metadata-label">{{ 'sendPage.recommendations.metadata.explanationStyle' | translate }}</div>
                  <div class="metadata-value">{{ recommendations.explanationStyle }}</div>
                </div>
                <div class="metadata-card" *ngIf="recommendations.recommendationVersion">
                  <div class="metadata-label">{{ 'sendPage.recommendations.metadata.recommendationVersion' | translate }}</div>
                  <div class="metadata-value">{{ recommendations.recommendationVersion }}</div>
                </div>
              </div>
            </div>

            <div class="group-grid">
              <div class="group-card">
                <div class="group-title">{{ 'sendPage.recommendations.subjectTitle' | translate }}</div>
                <div class="recommendation-list">
                  <div class="recommendation-item" *ngFor="let item of recommendations.subjectSuggestions">
                    <div class="recommendation-item-header">
                      <div class="recommendation-title">{{ item.subject }}</div>
                    </div>
                    <p class="recommendation-reason">{{ item.reason }}</p>
                  </div>
                </div>
              </div>

              <div class="group-card">
                <div class="group-title">{{ 'sendPage.recommendations.audienceTitle' | translate }}</div>
                <div class="recommendation-list">
                  <div class="recommendation-item" *ngFor="let item of recommendations.audienceSuggestions">
                    <div class="recommendation-item-header">
                      <div class="recommendation-title">{{ item.segment }}</div>
                    </div>
                    <p class="recommendation-reason">{{ item.reason }}</p>
                  </div>
                </div>
              </div>

              <div class="group-card">
                <div class="group-title">{{ 'sendPage.recommendations.sendTimeTitle' | translate }}</div>
                <div class="recommendation-list">
                  <div class="recommendation-item" *ngFor="let item of recommendations.sendTimeSuggestions">
                    <div class="recommendation-item-header">
                      <div class="recommendation-title">{{ item.window }}</div>
                    </div>
                    <p class="recommendation-reason">{{ item.reason }}</p>
                  </div>
                </div>
              </div>

              <div class="group-card">
                <div class="group-title">{{ 'sendPage.recommendations.insightTitle' | translate }}</div>
                <div class="recommendation-list">
                  <div class="recommendation-item" *ngFor="let item of recommendations.insights">
                    <div class="recommendation-item-header">
                      <div class="recommendation-title">{{ item.insight }}</div>
                      <p-tag
                        *ngIf="item.signalCategory !== null && item.signalCategory !== undefined"
                        [severity]="signalSeverity(item.signalCategory)"
                        [value]="signalCategoryLabel(item.signalCategory)">
                      </p-tag>
                    </div>
                    <p class="recommendation-reason">{{ item.reason }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="recommendation-state mt-3" *ngIf="!recommendationsAccepted">
              <div class="fw-semibold mb-1">{{ 'sendPage.recommendations.confirmationTitle' | translate }}</div>
              <div>{{ 'sendPage.recommendations.confirmationText' | translate }}</div>
              <div class="submit-row mt-3">
                <button
                  pButton
                  type="button"
                  severity="success"
                  [label]="'sendPage.recommendations.acceptButton' | translate"
                  [disabled]="recommendationLoading"
                  (click)="acceptRecommendations()">
                </button>
              </div>
            </div>

            <div class="recommendation-state recommendation-success mt-3" *ngIf="recommendationsAccepted">
              <div class="fw-semibold mb-1">{{ 'sendPage.recommendations.acceptedTitle' | translate }}</div>
              <div>{{ 'sendPage.recommendations.acceptedText' | translate }}</div>
            </div>
          </ng-container>
        </p-card>
      </div>

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
    </div>
  `
})
export class SendPageComponent {
  readonly goalOptions = [
    { value: CampaignGoal.ProductLaunch, labelKey: 'sendPage.recommendations.goals.ProductLaunch' },
    { value: CampaignGoal.DiscountOffer, labelKey: 'sendPage.recommendations.goals.DiscountOffer' },
    { value: CampaignGoal.ReEngagement, labelKey: 'sendPage.recommendations.goals.ReEngagement' },
    { value: CampaignGoal.Newsletter, labelKey: 'sendPage.recommendations.goals.Newsletter' },
    { value: CampaignGoal.SpecialAnnouncement, labelKey: 'sendPage.recommendations.goals.SpecialAnnouncement' }
  ] as const;

  templates: TemplateDto[] = [];
  subscribers: SubscriberDto[] = [];
  totalSubscriberCount = 0;
  inactiveSubscriberCount = 0;
  selectedSubscriberIds = new Set<number>();
  loading = false;
  recommendationLoading = false;
  recommendationError = '';
  recommendations?: CampaignRecommendationResponseDto;
  recommendationsAccepted = false;

  readonly form = this.fb.group({
    templateId: [null as number | null, [Validators.required]],
    useAllActiveSubscribers: [true]
  });

  readonly recommendationForm = this.fb.group({
    goal: [null as CampaignGoal | null, [Validators.required]],
    availableTemplateCount: [null as number | null],
    totalSubscriberCount: [null as number | null],
    activeSubscriberCount: [null as number | null],
    inactiveSubscriberCount: [null as number | null],
    recentSuccessfulSendCount: [null as number | null],
    recentFailedSendCount: [null as number | null]
  });

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private toast: ToastService,
    private confirm: ConfirmService,
    private translate: TranslateService
  ) {
    this.api.getActiveTemplates().subscribe((res) => {
      this.templates = res;
      this.seedRecommendationContext();
    });

    this.api.getSubscribers().subscribe((res) => {
      this.totalSubscriberCount = res.length;
      this.inactiveSubscriberCount = res.filter((x) => !x.isActive).length;
      this.subscribers = res.filter((x) => x.isActive);
      this.seedRecommendationContext();
    });
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

  requestRecommendations() {
    if (this.recommendationForm.invalid || this.recommendationLoading) return;

    this.recommendationLoading = true;
    this.recommendationError = '';
    this.recommendationsAccepted = false;

    const raw = this.recommendationForm.getRawValue();
    const context = this.buildRecommendationContext(raw);
    if (raw.goal === null) {
      this.recommendationLoading = false;
      return;
    }

    this.api.getCampaignRecommendations({
      goal: raw.goal,
      context
    }).subscribe({
      next: (res) => {
        this.recommendationLoading = false;
        this.recommendations = res;
      },
      error: (err) => {
        this.recommendationLoading = false;
        this.recommendationError = getApiErrorMessage(err);
      }
    });
  }

  resetRecommendationContext() {
    this.recommendationForm.patchValue({
      availableTemplateCount: this.templates.length || null,
      totalSubscriberCount: this.totalSubscriberCount || null,
      activeSubscriberCount: this.subscribers.length || null,
      inactiveSubscriberCount: this.inactiveSubscriberCount,
      recentSuccessfulSendCount: null,
      recentFailedSendCount: null
    });
  }

  acceptRecommendations() {
    if (!this.recommendations) return;
    if (!this.confirm.confirm(this.translate.instant('sendPage.recommendations.confirmAccept'))) return;

    this.recommendationsAccepted = true;
    this.toast.show(this.translate.instant('sendPage.recommendations.toast.accepted'), 'success');
  }

  goalLabel(goal: CampaignGoal): string {
    const goalOption = this.goalOptions.find((item) => item.value === goal);
    return goalOption ? this.translate.instant(goalOption.labelKey) : String(goal);
  }

  signalCategoryLabel(category: RecommendationSignalCategory): string {
    return this.translate.instant(`sendPage.recommendations.signals.${RecommendationSignalCategory[category]}`);
  }

  signalSeverity(category: RecommendationSignalCategory): 'success' | 'danger' | 'info' | 'warn' | 'secondary' {
    if (category === RecommendationSignalCategory.Opportunity) return 'success';
    if (category === RecommendationSignalCategory.Caution) return 'danger';
    if (category === RecommendationSignalCategory.DeliveryStrategy) return 'info';
    if (category === RecommendationSignalCategory.AudienceFit) return 'warn';
    return 'secondary';
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

  private buildRecommendationContext(raw: ReturnType<typeof this.recommendationForm.getRawValue>) {
    const context = {
      ...(raw.availableTemplateCount !== null ? { availableTemplateCount: raw.availableTemplateCount } : {}),
      ...(raw.totalSubscriberCount !== null ? { totalSubscriberCount: raw.totalSubscriberCount } : {}),
      ...(raw.activeSubscriberCount !== null ? { activeSubscriberCount: raw.activeSubscriberCount } : {}),
      ...(raw.inactiveSubscriberCount !== null ? { inactiveSubscriberCount: raw.inactiveSubscriberCount } : {}),
      ...(raw.recentSuccessfulSendCount !== null ? { recentSuccessfulSendCount: raw.recentSuccessfulSendCount } : {}),
      ...(raw.recentFailedSendCount !== null ? { recentFailedSendCount: raw.recentFailedSendCount } : {})
    };

    return Object.keys(context).length > 0 ? context : undefined;
  }

  private seedRecommendationContext() {
    const current = this.recommendationForm.getRawValue();
    this.recommendationForm.patchValue({
      availableTemplateCount: current.availableTemplateCount ?? (this.templates.length || null),
      totalSubscriberCount: current.totalSubscriberCount ?? (this.totalSubscriberCount || null),
      activeSubscriberCount: current.activeSubscriberCount ?? (this.subscribers.length || null),
      inactiveSubscriberCount: current.inactiveSubscriberCount ?? this.inactiveSubscriberCount
    });
  }
}
