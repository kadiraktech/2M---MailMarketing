import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';

type DemoRow = {
  id: number;
  name: string;
  status: string;
};

@Component({
  standalone: true,
  selector: 'app-admin-ui-demo-page',
  imports: [CommonModule, CardModule, ButtonModule, TableModule],
  template: `
    <p-card header="PrimeNG + Sakai UI Demo" subheader="Incremental migration playground">
      <p class="mb-3">
        This page is intentionally small and isolated to verify PrimeNG integration without changing existing CoreUI pages.
      </p>

      <div class="d-flex gap-2 mb-3 flex-wrap">
        <button pButton type="button" label="Primary Action" icon="pi pi-check"></button>
        <button pButton type="button" label="Secondary" icon="pi pi-refresh" severity="secondary"></button>
      </div>

      <p-table [value]="rows" [tableStyle]="{ 'min-width': '32rem' }" size="small" stripedRows>
        <ng-template pTemplate="header">
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Status</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-row>
          <tr>
            <td>{{ row.id }}</td>
            <td>{{ row.name }}</td>
            <td>{{ row.status }}</td>
          </tr>
        </ng-template>
      </p-table>
    </p-card>
  `
})
export class AdminUiDemoPageComponent {
  readonly rows: DemoRow[] = [
    { id: 1, name: 'Template Review', status: 'Ready' },
    { id: 2, name: 'Subscriber Sync', status: 'Running' },
    { id: 3, name: 'Batch Dispatch', status: 'Pending' }
  ];
}
