import { Component } from '@angular/core';
import { DatePipe, NgIf } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ApiService, UserDto } from '../../../core/api.service';
import { ToastService } from '../../../core/toast.service';
import { getApiErrorMessage } from '../../../core/api-error.util';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';

@Component({
  standalone: true,
  imports: [NgIf, DatePipe, TranslateModule, CardModule, TableModule, ButtonModule, TagModule],
  template: `
    <p-card [header]="'usersPage.title' | translate">
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
            <th>{{ 'usersPage.table.fullName' | translate }}</th>
            <th>{{ 'usersPage.table.email' | translate }}</th>
            <th>{{ 'usersPage.table.role' | translate }}</th>
            <th>{{ 'usersPage.table.status' | translate }}</th>
            <th>{{ 'usersPage.table.createdAt' | translate }}</th>
            <th class="text-end">{{ 'usersPage.table.action' | translate }}</th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-user>
          <tr>
            <td>{{ user.fullName }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.role }}</td>
            <td>
              <p-tag
                [value]="user.isActive ? ('usersPage.active' | translate) : ('usersPage.passive' | translate)"
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
                [label]="user.isActive ? ('usersPage.makePassive' | translate) : ('usersPage.makeActive' | translate)"
                (click)="toggleActive(user)">
              </button>
            </td>
          </tr>
        </ng-template>
      </p-table>

      <ng-template #emptyState>
        <div class="alert alert-light border mb-0">{{ 'usersPage.empty' | translate }}</div>
      </ng-template>
    </p-card>
  `
})
export class UsersPageComponent {
  users: UserDto[] = [];

  constructor(private api: ApiService, private toast: ToastService, private translate: TranslateService) {
    this.load();
  }

  load() {
    this.api.getUsers().subscribe((res) => (this.users = res));
  }

  toggleActive(user: UserDto) {
    this.api.setUserActive(user.id, !user.isActive).subscribe({
      next: () => {
        this.toast.show(this.translate.instant('usersPage.toast.statusUpdated'), 'success');
        this.load();
      },
      error: (err) => this.toast.show(getApiErrorMessage(err), 'danger')
    });
  }
}
