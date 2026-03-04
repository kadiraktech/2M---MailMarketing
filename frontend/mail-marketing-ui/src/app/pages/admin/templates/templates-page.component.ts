import { Component } from '@angular/core';
import { DatePipe, NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import { ApiService, TemplateDto } from '../../../core/api.service';
import { ToastService } from '../../../core/toast.service';
import { ConfirmService } from '../../../core/confirm.service';
import { getApiErrorMessage } from '../../../core/api-error.util';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';

@Component({
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    QuillModule,
    DatePipe,
    CardModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule
  ],
  styles: [`
    .template-editor {
      position: relative;
      z-index: 1;
    }
    .save-btn {
      position: relative;
      z-index: 2;
    }
    .templates-layout {
      display: grid;
      grid-template-columns: minmax(320px, 460px) 1fr;
      gap: 1rem;
    }
    .filter-grid {
      display: grid;
      grid-template-columns: minmax(160px, 1fr) 140px 120px;
      gap: .5rem;
      margin-bottom: 1rem;
      align-items: end;
    }
    @media (max-width: 1200px) {
      .templates-layout {
        grid-template-columns: 1fr;
      }
      .filter-grid {
        grid-template-columns: 1fr 1fr;
      }
      .filter-grid .search-col {
        grid-column: span 2;
      }
      .filter-grid .button-col {
        grid-column: span 2;
      }
    }
  `],
  template: `
    <div class="templates-layout">
      <p-card header="Yeni Şablon">
        <form [formGroup]="form" (ngSubmit)="onSave()" class="d-grid gap-2 mt-2">
          <input pInputText placeholder="Şablon Adı" formControlName="name" />
          <small class="text-danger" *ngIf="submitted && form.controls.name.invalid">Şablon adı zorunludur.</small>

          <input pInputText placeholder="Konu" formControlName="subject" />
          <small class="text-danger" *ngIf="submitted && form.controls.subject.invalid">Konu zorunludur.</small>

          <quill-editor
            class="template-editor"
            formControlName="htmlContent"
            theme="snow"
            (onContentChanged)="onEditorChanged($event)">
          </quill-editor>
          <small class="text-danger" *ngIf="contentInvalid">İçerik boş olamaz.</small>
          <button pButton type="submit" class="save-btn" label="Kaydet" [disabled]="saving"></button>
        </form>
      </p-card>

      <p-card>
        <ng-template pTemplate="header">
          <div class="d-flex justify-content-between align-items-center">
            <h2 class="h5 mb-0">Şablon Listesi</h2>
            <span class="badge bg-info text-dark">{{ templates.length }} kayıt</span>
          </div>
        </ng-template>

        <form [formGroup]="filterForm" (ngSubmit)="load()" class="filter-grid">
          <div class="search-col">
            <input pInputText class="w-100" placeholder="Ad/Konu ara" formControlName="search" />
          </div>
          <div>
            <select class="form-select" formControlName="isActive">
              <option value="">Tümü</option>
              <option [ngValue]="true">Aktif</option>
              <option [ngValue]="false">Pasif</option>
            </select>
          </div>
          <div class="button-col">
            <button pButton type="submit" [outlined]="true" label="Filtrele"></button>
          </div>
        </form>

        <p-table
          [value]="templates"
          [paginator]="true"
          [rows]="10"
          [rowsPerPageOptions]="[10, 20, 50]"
          [responsiveLayout]="'scroll'"
          [stripedRows]="true"
          size="small"
          dataKey="id"
          *ngIf="templates.length; else noTemplates">

          <ng-template pTemplate="header">
            <tr>
              <th>Başlık</th>
              <th>Oluşturan</th>
              <th>Tarih</th>
              <th>Durum</th>
              <th class="text-end">İşlem</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-t>
            <tr>
              <td>
                <div class="fw-semibold">{{ t.name }}</div>
                <div class="small text-muted">{{ t.subject }}</div>
              </td>
              <td>{{ t.createdByUserName }}</td>
              <td>{{ t.createdAtUtc | date: 'short' }}</td>
              <td>
                <p-tag [value]="t.isActive ? 'Aktif' : 'Pasif'" [severity]="t.isActive ? 'success' : 'secondary'"></p-tag>
              </td>
              <td class="text-end d-flex justify-content-end gap-2">
                <button
                  pButton
                  type="button"
                  size="small"
                  [outlined]="true"
                  severity="warn"
                  [label]="t.isActive ? 'Pasif Yap' : 'Aktif Yap'"
                  (click)="toggleActive(t)">
                </button>
                <button
                  pButton
                  type="button"
                  size="small"
                  [outlined]="true"
                  severity="danger"
                  label="Sil"
                  (click)="remove(t)">
                </button>
              </td>
            </tr>
          </ng-template>
        </p-table>

        <ng-template #noTemplates>
          <div class="alert alert-light border mb-0">Henüz şablon yok.</div>
        </ng-template>
      </p-card>
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

