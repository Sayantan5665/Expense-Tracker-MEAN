import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { AlertService, ApiService } from '@services';
import { Subscription } from 'rxjs';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButton } from '@angular/material/button';
import { CurrencyPipe, DatePipe, NgStyle } from '@angular/common';

@Component({
  selector: 'app-statement-view-export',
  imports: [MatIcon, MatDialogModule, ReactiveFormsModule, MatFormFieldModule, MatChipsModule,
    MatDatepickerModule, MatNativeDateModule, DatePipe, MatButton, CurrencyPipe, NgStyle],
  templateUrl: './statement-view-export.component.html',
  styleUrl: './statement-view-export.component.scss',
  providers: [provideNativeDateAdapter()]
})
export class StatementViewExportDialog {
  /* Dependency Injection */
  public readonly dialogRef = inject(MatDialogRef<StatementViewExportDialog>);
  protected DIALOG_DATA: any = inject(MAT_DIALOG_DATA);
  private readonly api = inject(ApiService);
  private readonly alert = inject(AlertService);
  private readonly destroyRef = inject(DestroyRef);

  /* Variables */
  readonly byDuration: string[] = ['Last Week', 'Last Month', 'Custom Date Range'];
  protected step = signal<1 | 2>(1);
  protected filterForm: FormGroup = new FormGroup({
    limit: new FormControl(0),
    page: new FormControl(1),
    startDate: new FormControl(""),
    endDate: new FormControl(""),
    type: new FormControl(""),
    pagination: new FormControl(false),
  });
  private filterSubscriber!: Subscription;
  protected expenses = signal<Array<any>>([]);

  constructor() {
    console.log("data: ", this.DIALOG_DATA);

    this.filterSubscriber = this.filterForm.valueChanges.subscribe({
      next: (value: any) => {
        console.log("value: ", value);
        this.getExpenses(value);
      }, error: (err: any) => {
        console.log("err: ", err);
      }
    });

    setTimeout(() => {
      this.filterForm.controls['limit'].patchValue(5);
    }, 3000);


    this.destroyRef.onDestroy(() => {
      this.filterSubscriber.unsubscribe();
    });
  }

  private getExpenses(filter: any) {
    let url: string = `api/expense/fetch-by-filter-with-report?limit=${filter?.limit || 10}&page=${filter?.page || 1}&pagination=${!!filter?.pagination}`;
    ((filter.startDate && filter.startDate.length) && (filter.endDate && filter.endDate.length)) && (url += `&startDate=${filter.startDate}&endDate=${filter.endDate}`);
    (filter.type && filter.type.length) && (url += '&type=' + filter.type);

    this.api.get(url).subscribe({
      next: (res: any) => {
        console.log("res?.data?.docs: ", res?.data?.docs);
        this.expenses.set(res?.data?.docs || []);
      },
      error: (error: any) => {
        console.log("error: ", error);
      }
    });
  }

  public exportStatement(): void { }
}
