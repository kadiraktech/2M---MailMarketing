import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface SubscriberDto {
  id: number;
  email: string;
  fullName?: string;
  isActive: boolean;
  createdAtUtc: string;
}

export interface TemplateDto {
  id: number;
  name: string;
  subject: string;
  htmlContent: string;
  createdByUserId: number;
  createdByUserName: string;
  isActive: boolean;
  createdAtUtc: string;
}

export interface SummaryDto {
  totalSubscribers: number;
  totalTemplates: number;
  totalBatches: number;
  totalSendItems: number;
  totalSuccess: number;
  totalFailed: number;
}

export interface BatchSummaryDto {
  pending: number;
  running: number;
  completed: number;
  completedWithErrors: number;
}

export interface ReportItemDto {
  id: number;
  subscriberEmail: string;
  sendTimeUtc: string;
  status: string;
  message?: string;
  templateId: number;
  templateName: string;
}

export interface LiveDashboardHealthStatusDto {
  status: string;
  message?: string;
}

export interface LiveDashboardWorkerHealthDto extends LiveDashboardHealthStatusDto {
  lastHeartbeatUtc?: string;
  lastActivityUtc?: string;
}

export interface LiveDashboardRecentActivityDto {
  sendItemId: number;
  batchId: number;
  templateId: number;
  templateName: string;
  subscriberEmail: string;
  status: string;
  eventTimeUtc: string;
  retryCount: number;
  message?: string;
}

export interface LiveDashboardDto {
  generatedAtUtc: string;
  queue: {
    totalQueuedJobs: number;
    processingJobs: number;
    retryPendingJobs: number;
  };
  sending: {
    activeSendOperations: number;
    successfulSendCount: number;
    failedSendCount: number;
  };
  recentActivity: LiveDashboardRecentActivityDto[];
  health: {
    api: LiveDashboardHealthStatusDto;
    database: LiveDashboardHealthStatusDto;
    rabbitMq: LiveDashboardHealthStatusDto;
    worker: LiveDashboardWorkerHealthDto;
  };
}

export enum CampaignGoal {
  ProductLaunch = 0,
  DiscountOffer = 1,
  ReEngagement = 2,
  Newsletter = 3,
  SpecialAnnouncement = 4
}

export interface CampaignRecommendationContextDto {
  availableTemplateCount?: number | null;
  totalSubscriberCount?: number | null;
  activeSubscriberCount?: number | null;
  inactiveSubscriberCount?: number | null;
  recentSuccessfulSendCount?: number | null;
  recentFailedSendCount?: number | null;
}

export interface CampaignRecommendationRequestDto {
  goal: CampaignGoal;
  context?: CampaignRecommendationContextDto;
}

export interface SubjectRecommendationDto {
  subject: string;
  reason: string;
}

export interface AudienceRecommendationDto {
  segment: string;
  reason: string;
}

export interface SendTimeRecommendationDto {
  window: string;
  reason: string;
}

export interface InsightRecommendationDto {
  insight: string;
  reason: string;
  signalCategory?: RecommendationSignalCategory | null;
}

export enum RecommendationSignalCategory {
  Opportunity = 0,
  Caution = 1,
  DeliveryStrategy = 2,
  AudienceFit = 3,
  MessagingQuality = 4
}

export interface CampaignRecommendationResponseDto {
  goal: CampaignGoal;
  generatedAtUtc: string;
  provider: string;
  providerType: string;
  providerDisplayName?: string;
  generationMode?: string;
  explanationStyle?: string;
  recommendationVersion?: string;
  summary: string;
  subjectSuggestions: SubjectRecommendationDto[];
  audienceSuggestions: AudienceRecommendationDto[];
  sendTimeSuggestions: SendTimeRecommendationDto[];
  insights: InsightRecommendationDto[];
}

export interface ProfileDto {
  id: number;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
  createdAtUtc: string;
}

export interface UserDto {
  id: number;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAtUtc: string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly base = environment.apiBaseUrl;
  constructor(private http: HttpClient) {}

  subscribe(payload: unknown) {
    return this.http.post<{ id: number; message: string }>(`${this.base}/subscribe`, payload);
  }

  getSubscribers(filters?: { email?: string; createdFromUtc?: string; createdToUtc?: string }) {
    let params = new HttpParams();
    if (filters?.email) params = params.set('email', filters.email);
    if (filters?.createdFromUtc) params = params.set('createdFromUtc', filters.createdFromUtc);
    if (filters?.createdToUtc) params = params.set('createdToUtc', filters.createdToUtc);
    return this.http.get<SubscriberDto[]>(`${this.base}/admin/subscribers`, { params });
  }

  createSubscriber(payload: unknown) {
    return this.http.post<{ id: number }>(`${this.base}/admin/subscribers`, payload);
  }

  deleteSubscriber(id: number) {
    return this.http.delete<{ message: string }>(`${this.base}/admin/subscribers/${id}`);
  }

  getTemplates(filters?: { search?: string; isActive?: boolean | '' }) {
    let params = new HttpParams();
    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.isActive !== '' && filters?.isActive !== undefined) params = params.set('isActive', String(filters.isActive));
    return this.http.get<TemplateDto[]>(`${this.base}/admin/templates`, { params });
  }

  getActiveTemplates() {
    return this.http.get<TemplateDto[]>(`${this.base}/admin/templates/active`);
  }

  createTemplate(payload: unknown) {
    return this.http.post<{ id: number }>(`${this.base}/admin/templates`, payload);
  }

  setTemplateActive(id: number, isActive: boolean) {
    return this.http.patch<{ message: string }>(`${this.base}/admin/templates/${id}/active`, { isActive });
  }

  deleteTemplate(id: number) {
    return this.http.delete<{ message: string }>(`${this.base}/admin/templates/${id}`);
  }

  createBatch(payload: unknown) {
    return this.http.post<{ batchId: number }>(`${this.base}/admin/send/batch`, payload);
  }

  getSummary() {
    return this.http.get<SummaryDto>(`${this.base}/admin/reporting/summary`);
  }

  getBatchSummary() {
    return this.http.get<BatchSummaryDto>(`${this.base}/admin/reporting/batch-summary`);
  }

  getReportItems(filters?: { templateId?: number | ''; fromUtc?: string; toUtc?: string; status?: string; email?: string }) {
    let params = new HttpParams();
    if (filters?.templateId !== '' && filters?.templateId !== undefined) params = params.set('templateId', String(filters.templateId));
    if (filters?.fromUtc) params = params.set('fromUtc', filters.fromUtc);
    if (filters?.toUtc) params = params.set('toUtc', filters.toUtc);
    if (filters?.status) params = params.set('status', filters.status);
    if (filters?.email) params = params.set('email', filters.email);
    return this.http.get<ReportItemDto[]>(`${this.base}/admin/reporting/items`, { params });
  }

  getLiveDashboard() {
    return this.http.get<LiveDashboardDto>(`${this.base}/admin/reporting/live-dashboard`);
  }

  getCampaignRecommendations(payload: CampaignRecommendationRequestDto) {
    return this.http.post<CampaignRecommendationResponseDto>(`${this.base}/admin/campaign-recommendations`, payload);
  }

  getProfile() {
    return this.http.get<ProfileDto>(`${this.base}/admin/profile`);
  }

  updateProfile(payload: unknown) {
    return this.http.put<{ message: string }>(`${this.base}/admin/profile`, payload);
  }

  getSmtp() {
    return this.http.get<{ host: string; port: number; username: string; fromEmail: string; useSsl: boolean } | null>(`${this.base}/admin/settings/smtp`);
  }

  saveSmtp(payload: unknown) {
    return this.http.post<{ id: number }>(`${this.base}/admin/settings/smtp`, payload);
  }

  testSmtp(payload: { toEmail?: string }) {
    return this.http.post<{ message: string }>(`${this.base}/admin/settings/smtp/test`, payload);
  }

  getUsers() {
    return this.http.get<UserDto[]>(`${this.base}/admin/users`);
  }

  setUserActive(id: number, isActive: boolean) {
    return this.http.patch<{ message: string }>(`${this.base}/admin/users/${id}/active`, { isActive });
  }
}

