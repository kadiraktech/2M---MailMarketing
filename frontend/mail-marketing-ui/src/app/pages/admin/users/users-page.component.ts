import { Component } from '@angular/core';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { ApiService, UserDto } from '../../../core/api.service';
import { ToastService } from '../../../core/toast.service';
import { getApiErrorMessage } from '../../../core/api-error.util';

@Component({
  standalone: true,
  imports: [NgIf, NgFor, DatePipe],
  template: `
    <div class="card p-4">
      <h2>Kullanıcılar (Admin)</h2>

      <div class="table-responsive mt-3" *ngIf="users.length; else emptyState">
        <table class="table table-striped table-hover align-middle">
          <thead>
            <tr>
              <th>Ad Soyad</th>
              <th>E-posta</th>
              <th>Rol</th>
              <th>Durum</th>
              <th>Kayıt Tarihi</th>
              <th class="text-end">İşlem</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of users">
              <td>{{ user.fullName }}</td>
              <td>{{ user.email }}</td>
              <td>{{ user.role }}</td>
              <td>
                <span class="badge" [class.bg-success]="user.isActive" [class.bg-secondary]="!user.isActive">
                  {{ user.isActive ? 'Aktif' : 'Pasif' }}
                </span>
              </td>
              <td>{{ user.createdAtUtc | date: 'short' }}</td>
              <td class="text-end">
                <button class="btn btn-sm btn-outline-warning" (click)="toggleActive(user)">
                  {{ user.isActive ? 'Pasif Yap' : 'Aktif Yap' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <ng-template #emptyState>
        <div class="alert alert-light border mb-0">Kullanıcı kaydı bulunamadı.</div>
      </ng-template>
    </div>
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

