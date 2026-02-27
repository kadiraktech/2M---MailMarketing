import { Component } from '@angular/core';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import { ApiService, TemplateDto } from '../../../core/api.service';
import { ToastService } from '../../../core/toast.service';
import { ConfirmService } from '../../../core/confirm.service';
import { getApiErrorMessage } from '../../../core/api-error.util';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor, QuillModule, DatePipe],
  styles: [`
    .template-editor {
      position: relative;
      z-index: 1;
    }
    .save-btn {
      position: relative;
      z-index: 2;
    }
  `],
  template: `
    <div class="row g-3">
      <div class="col-12 col-xl-5">
        <div class="card p-4 h-100">
          <h2 class="h5">Yeni Şablon</h2>
          <form [formGroup]="form" (ngSubmit)="onSave()" class="d-grid gap-2 mt-2">
            <input class="form-control" placeholder="Şablon Adı" formControlName="name" />
            <small class="text-danger" *ngIf="submitted && form.controls.name.invalid">Şablon adı zorunludur.</small>

            <input class="form-control" placeholder="Konu" formControlName="subject" />
            <small class="text-danger" *ngIf="submitted && form.controls.subject.invalid">Konu zorunludur.</small>

            <quill-editor
              class="template-editor"
              formControlName="htmlContent"
              theme="snow"
              (onContentChanged)="onEditorChanged($event)">
            </quill-editor>
            <small class="text-danger" *ngIf="contentInvalid">İçerik boş olamaz.</small>
            <button type="submit" class="btn btn-primary save-btn" [disabled]="saving">Kaydet</button>
          </form>
        </div>
      </div>

      <div class="col-12 col-xl-7">
        <div class="card p-4 h-100">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h2 class="h5 mb-0">Şablon Listesi</h2>
            <span class="badge bg-info text-dark">{{ templates.length }} kayıt</span>
          </div>

          <form [formGroup]="filterForm" (ngSubmit)="load()" class="row g-2 mb-3">
            <div class="col-12 col-md-6">
              <input class="form-control" placeholder="Ad/Konu ara" formControlName="search" />
            </div>
            <div class="col-6 col-md-4">
              <select class="form-select" formControlName="isActive">
                <option value="">Tümü</option>
                <option [ngValue]="true">Aktif</option>
                <option [ngValue]="false">Pasif</option>
              </select>
            </div>
            <div class="col-6 col-md-2 d-grid">
              <button type="submit" class="btn btn-outline-primary">Filtrele</button>
            </div>
          </form>

          <div class="table-responsive" *ngIf="templates.length; else noTemplates">
            <table class="table table-hover align-middle">
              <thead>
                <tr>
                  <th>Başlık</th>
                  <th>Oluşturan</th>
                  <th>Tarih</th>
                  <th>Durum</th>
                  <th class="text-end">İşlem</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let t of templates">
                  <td>
                    <div class="fw-semibold">{{ t.name }}</div>
                    <div class="small text-muted">{{ t.subject }}</div>
                  </td>
                  <td>{{ t.createdByUserName }}</td>
                  <td>{{ t.createdAtUtc | date: 'short' }}</td>
                  <td>
                    <span class="badge" [class.bg-success]="t.isActive" [class.bg-secondary]="!t.isActive">
                      {{ t.isActive ? 'Aktif' : 'Pasif' }}
                    </span>
                  </td>
                  <td class="text-end d-flex justify-content-end gap-2">
                    <button type="button" class="btn btn-sm btn-outline-warning" (click)="toggleActive(t)">
                      {{ t.isActive ? 'Pasif Yap' : 'Aktif Yap' }}
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-danger" (click)="remove(t)">Sil</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <ng-template #noTemplates>
            <div class="alert alert-light border mb-0">Henüz şablon yok.</div>
          </ng-template>
        </div>
      </div>
    </div>
  `
})
export class TemplatesPageComponent {
  templates: TemplateDto[] = [];
  submitted = false;
  saving = false;
  private editorHtml = '';
  private editorText = '';

  readonly form = this.fb.group({
    name: ['', Validators.required],
    subject: ['', Validators.required],
    htmlContent: ['', Validators.required]
  });

  readonly filterForm = this.fb.group({
    search: [''],
    isActive: ['' as boolean | '']
  });

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private toast: ToastService,
    private confirm: ConfirmService
  ) {
    this.load();
  }

  get contentInvalid(): boolean {
    if (!this.submitted) return false;
    return this.isEditorEmpty();
  }

  load() {
    const filters = this.filterForm.getRawValue();
    const activeFilter = filters.isActive === null ? '' : filters.isActive;
    this.api.getTemplates({
      search: filters.search ?? '',
      isActive: activeFilter
    }).subscribe((res) => (this.templates = res));
  }

  onEditorChanged(event: { html?: string | null; text?: string | null }): void {
    this.editorHtml = event?.html ?? '';
    this.editorText = event?.text ?? '';
  }

  onSave() {
    this.submitted = true;

    if (this.form.invalid || this.isEditorEmpty()) {
      return;
    }
    if (!this.confirm.confirm('Şablon kaydedilsin mi?')) return;

    this.saving = true;
    const raw = this.form.getRawValue();
    this.api.createTemplate({
      name: raw.name,
      subject: raw.subject,
      htmlContent: this.getHtmlForApi(raw.htmlContent)
    }).subscribe({
      next: () => {
        this.saving = false;
        this.toast.show('Şablon kaydedildi.', 'success');
        this.form.reset({ name: '', subject: '', htmlContent: '' });
        this.editorHtml = '';
        this.editorText = '';
        this.submitted = false;
        this.load();
      },
      error: (err) => {
        this.saving = false;
        this.toast.show(getApiErrorMessage(err), 'danger');
      }
    });
  }

  private isEditorEmpty(): boolean {
    return this.editorText.trim().length === 0;
  }

  private getHtmlForApi(controlValue: unknown): string {
    if (typeof controlValue === 'string' && controlValue.trim().length > 0) {
      return controlValue;
    }

    if (this.editorHtml && this.editorHtml.trim().length > 0) {
      return this.editorHtml;
    }

    return '';
  }

  toggleActive(template: TemplateDto) {
    this.api.setTemplateActive(template.id, !template.isActive).subscribe({
      next: () => {
        this.toast.show('Şablon durumu güncellendi.', 'success');
        this.load();
      },
      error: (err) => this.toast.show(getApiErrorMessage(err), 'danger')
    });
  }

  remove(template: TemplateDto) {
    if (!this.confirm.confirm(`${template.name} şablonu silinsin mi?`)) return;

    this.api.deleteTemplate(template.id).subscribe({
      next: () => {
        this.toast.show('Şablon silindi.', 'success');
        this.load();
      },
      error: (err) => this.toast.show(getApiErrorMessage(err), 'danger')
    });
  }
}

