import { Component } from '@angular/core';
import { DatePipe, NgIf } from '@angular/common';
import { ApiService, UserDto } from '../../../core/api.service';
import { ToastService } from '../../../core/toast.service';
import { getApiErrorMessage } from '../../../core/api-error.util';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';

@Component({
  standalone: true,
  imports: [NgIf, DatePipe, CardModule, TableModule, ButtonModule, TagModule],
  template: `
    <p-card header="Kullanıcılar (Admin)">
      <p-table
        [value]="users"
        [paginator]="true"
        [rows]="10"
        [rowsPerPageOptions]="[10, 20, 50]"
        [responsiveLayout]="'scroll'"
        [stripedRows]="true"
        size="small"
        dataKey="id"
        *ngIf="users.length; else emptyState">

        <ng-template pTemplate="header">
          <tr>
            <th>Ad Soyad</th>
            <th>E-posta</th>
            <th>Rol</th>
            <th>Durum</th>
            <th>Kayıt Tarihi</th>
            <th class="text-end">İşlem</th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-user>
          <tr>
            <td>{{ user.fullName }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.role }}</td>
            <td>
              <p-tag
                [value]="user.isActive ? 'Aktif' : 'Pasif'"
                [severity]="user.isActive ? 'success' : 'secondary'">
              </p-tag>
            </td>
            <td>{{ user.createdAtUtc | date: 'short' }}</td>
            <td class="text-end">
              <button
                pButton
                type="button"
                size="small"
                [outlined]="true"
                severity="warn"
                [label]="user.isActive ? 'Pasif Yap' : 'Aktif Yap'"
                (click)="toggleActive(user)">
              </button>
            </td>
          </tr>
        </ng-template>
      </p-table>

      <ng-template #emptyState>
        <div class="alert alert-light border mb-0">Kullanıcı kaydı bulunamadı.</div>
      </ng-template>
    </p-card>
  `
})
export class UsersPageComponent {
  users: UserDto[] = [];

  constructor(private api: ApiService, private toast: ToastService) {
    this.load();
  }

  load() {
    this.api.getUsers().subscribe((res) => (this.users = res));
  }

  toggleActive(user: UserDto) {
    this.api.setUserActive(user.id, !user.isActive).subscribe({
      next: () => {
        this.toast.show('Kullanıcı durumu güncellendi.', 'success');
        this.load();
      },
      error: (err) => this.toast.show(getApiErrorMessage(err), 'danger')
    });
  }
}

