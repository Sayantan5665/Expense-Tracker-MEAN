import { Component, effect, inject, ResourceRef, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { AlertService, ApiService } from '@services';

@Component({
  selector: 'app-statement-view-export',
  imports: [MatIcon, MatDialogModule],
  templateUrl: './statement-view-export.component.html',
  styleUrl: './statement-view-export.component.scss'
})
export class StatementViewExportDialog {
  /* Dependency Injection */
  public readonly dialogRef = inject(MatDialogRef<StatementViewExportDialog>);
  protected DIALOG_DATA: any = inject(MAT_DIALOG_DATA);
  private readonly api = inject(ApiService);
  private readonly alert = inject(AlertService);

  /* Variables */
  protected step = signal<1 | 2>(1);
  protected filterOption = signal({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date()
  });

  /* Api Calls */
  protected expenses: ResourceRef<any> = rxResource({
    request: () => ({ filterOption: this.filterOption() }),
    loader: (e) => {
      const filter = e.request.filterOption;
      return this.api.get(`api/expense/fetch-by-filter-with-report?startDate=${filter.startDate}&endDate=${filter.endDate}`);
    },
  });

  constructor() {
    console.log("data: ", this.DIALOG_DATA);

    effect(() => {
      const error:any = this.expenses.error();
      if (error) {
        this.alert.toast(error?.message || "Failed to fetch expenses", 'error');
      }
      console.log("expenses: ", this.expenses.value());
    });
  }

  public exportStatement(): void { }
}
