import { Component } from '@angular/core';
import { DatePipe, NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
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
    TranslateModule,
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
      <p-card [header]="'templatesPage.newTemplate' | translate">
        <form [formGroup]="form" (ngSubmit)="onSave()" class="d-grid gap-2 mt-2">
          <input pInputText [placeholder]="'templatesPage.templateName' | translate" formControlName="name" />
          <small class="text-danger" *ngIf="submitted && form.controls.name.invalid">{{ 'templatesPage.templateNameRequired' | translate }}</small>

          <input pInputText [placeholder]="'templatesPage.subject' | translate" formControlName="subject" />
          <small class="text-danger" *ngIf="submitted && form.controls.subject.invalid">{{ 'templatesPage.subjectRequired' | translate }}</small>

          <quill-editor
            class="template-editor"
            formControlName="htmlContent"
            theme="snow"
            (onContentChanged)="onEditorChanged($event)">
          </quill-editor>
          <small class="text-danger" *ngIf="contentInvalid">{{ 'templatesPage.contentRequired' | translate }}</small>
          <button pButton type="submit" class="save-btn" [label]="'templatesPage.save' | translate" [disabled]="saving"></button>
        </form>
      </p-card>

      <p-card>
        <ng-template pTemplate="header">
          <div class="d-flex justify-content-between align-items-center">
            <h2 class="h5 mb-0">{{ 'templatesPage.listTitle' | translate }}</h2>
            <span class="badge bg-info text-dark">{{ templates.length }} {{ 'templatesPage.recordCount' | translate }}</span>
          </div>
        </ng-template>

        <form [formGroup]="filterForm" (ngSubmit)="load()" class="filter-grid">
          <div class="search-col">
            <input pInputText class="w-100" [placeholder]="'templatesPage.search' | translate" formControlName="search" />
          </div>
          <div>
            <select class="form-select" formControlName="isActive">
              <option value="">{{ 'templatesPage.filter.all' | translate }}</option>
              <option [ngValue]="true">{{ 'templatesPage.filter.active' | translate }}</option>
              <option [ngValue]="false">{{ 'templatesPage.filter.passive' | translate }}</option>
            </select>
          </div>
          <div class="button-col">
            <button pButton type="submit" [outlined]="true" [label]="'templatesPage.filterButton' | translate"></button>
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
              <th>{{ 'templatesPage.table.title' | translate }}</th>
              <th>{{ 'templatesPage.table.createdBy' | translate }}</th>
              <th>{{ 'templatesPage.table.date' | translate }}</th>
              <th>{{ 'templatesPage.table.status' | translate }}</th>
              <th class="text-end">{{ 'templatesPage.table.action' | translate }}</th>
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
                <p-tag [value]="t.isActive ? ('templatesPage.filter.active' | translate) : ('templatesPage.filter.passive' | translate)" [severity]="t.isActive ? 'success' : 'secondary'"></p-tag>
              </td>
              <td class="text-end d-flex justify-content-end gap-2">
                <button
                  pButton
                  type="button"
                  size="small"
                  [outlined]="true"
                  severity="warn"
                  [label]="t.isActive ? ('templatesPage.makePassive' | translate) : ('templatesPage.makeActive' | translate)"
                  (click)="toggleActive(t)">
                </button>
                <button
                  pButton
                  type="button"
                  size="small"
                  [outlined]="true"
                  severity="danger"
                  [label]="'templatesPage.delete' | translate"
                  (click)="remove(t)">
                </button>
              </td>
            </tr>
          </ng-template>
        </p-table>

        <ng-template #noTemplates>
          <div class="alert alert-light border mb-0">{{ 'templatesPage.noTemplates' | translate }}</div>
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
    private confirm: ConfirmService,
    private translate: TranslateService
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
    if (!this.confirm.confirm(this.translate.instant('templatesPage.confirmSave'))) return;

    this.saving = true;
    const raw = this.form.getRawValue();
    this.api.createTemplate({
      name: raw.name,
      subject: raw.subject,
      htmlContent: this.getHtmlForApi(raw.htmlContent)
    }).subscribe({
      next: () => {
        this.saving = false;
        this.toast.show(this.translate.instant('templatesPage.toast.saved'), 'success');
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
        this.toast.show(this.translate.instant('templatesPage.toast.statusUpdated'), 'success');
        this.load();
      },
      error: (err) => this.toast.show(getApiErrorMessage(err), 'danger')
    });
  }

  remove(template: TemplateDto) {
    if (!this.confirm.confirm(this.translate.instant('templatesPage.confirmDelete', { name: template.name }))) return;

    this.api.deleteTemplate(template.id).subscribe({
      next: () => {
        this.toast.show(this.translate.instant('templatesPage.toast.deleted'), 'success');
        this.load();
      },
      error: (err) => this.toast.show(getApiErrorMessage(err), 'danger')
    });
  }
}
