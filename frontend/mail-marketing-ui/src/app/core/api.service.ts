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

