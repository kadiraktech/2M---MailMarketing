import { Component } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService, SubscriberDto, TemplateDto } from '../../../core/api.service';
import { ToastService } from '../../../core/toast.service';
import { ConfirmService } from '../../../core/confirm.service';
import { getApiErrorMessage } from '../../../core/api-error.util';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, NgFor, NgIf],
  template: `
    <div class="card p-4">
      <h2>Toplu Gönderim</h2>

      <form [formGroup]="form" (ngSubmit)="submit()" class="d-grid gap-3 mt-2">
        <div>
          <label class="form-label">Aktif Şablon</label>
          <select class="form-select" formControlName="templateId">
            <option [ngValue]="null">Şablon seçiniz</option>
            <option *ngFor="let t of templates" [ngValue]="t.id">{{ t.name }} - {{ t.subject }}</option>
          </select>
        </div>

        <div class="form-check">
          <input class="form-check-input" type="checkbox" formControlName="useAllActiveSubscribers" id="allSubs" />
          <label class="form-check-label" for="allSubs">Tüm aktif abonelere gönder</label>
        </div>

        <div *ngIf="!form.controls.useAllActiveSubscribers.value">
          <label class="form-label">Abone Seçimi</label>
          <div class="border rounded p-2" style="max-height: 260px; overflow: auto;">
            <div class="form-check" *ngFor="let s of subscribers">
              <input class="form-check-input" type="checkbox" [id]="'sub_' + s.id" [checked]="selectedSubscriberIds.has(s.id)" (change)="toggleSubscriber(s.id, $event)" />
              <label class="form-check-label" [for]="'sub_' + s.id">{{ s.email }}</label>
            </div>
          </div>
          <small class="text-danger" *ngIf="selectedSubscriberIds.size === 0">En az bir abone seçiniz.</small>
        </div>

        <button class="btn btn-primary" [disabled]="!canSubmit || loading">Gönderimi Başlat</button>
      </form>
    </div>
  `
})
export class SendPageComponent {
  templates: TemplateDto[] = [];
  subscribers: SubscriberDto[] = [];
  selectedSubscriberIds = new Set<number>();
  loading = false;

  readonly form = this.fb.group({
    templateId: [null as number | null, [Validators.required]],
    useAllActiveSubscribers: [true]
  });

  constructor(private fb: FormBuilder, private api: ApiService, private toast: ToastService, private confirm: ConfirmService) {
    this.api.getActiveTemplates().subscribe((res) => (this.templates = res));
    this.api.getSubscribers().subscribe((res) => (this.subscribers = res.filter((x) => x.isActive)));
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

  submit() {
    if (!this.canSubmit || this.loading) return;
    if (!this.confirm.confirm('Gönderim kaydı oluşturulsun mu?')) return;

    this.loading = true;
    const useAll = !!this.form.controls.useAllActiveSubscribers.value;

    this.api.createBatch({
      templateId: this.form.controls.templateId.value,
      useAllActiveSubscribers: useAll,
      subscriberIds: useAll ? [] : Array.from(this.selectedSubscriberIds)
    }).subscribe({
      next: () => {
        this.loading = false;
        this.toast.show('Gönderim kaydı oluşturuldu. E-postalar arka planda işlenecek.', 'success');
      },
      error: (err) => {
        this.loading = false;
        this.toast.show(getApiErrorMessage(err), 'danger');
      }
    });
  }
}

