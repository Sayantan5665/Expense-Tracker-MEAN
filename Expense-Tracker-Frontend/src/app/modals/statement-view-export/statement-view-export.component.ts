import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { AlertService, ApiService } from '@services';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule, MatDateRangePicker } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButton } from '@angular/material/button';
import { CurrencyPipe, DatePipe, DOCUMENT, NgStyle } from '@angular/common';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-statement-view-export',
  imports: [MatIcon, MatDialogModule, ReactiveFormsModule, MatFormFieldModule, MatChipsModule,
    MatDatepickerModule, MatNativeDateModule, DatePipe, MatButton, CurrencyPipe, NgStyle, MatProgressSpinner],
  templateUrl: './statement-view-export.component.html',
  styleUrl: './statement-view-export.component.scss',
  providers: [provideNativeDateAdapter(), DatePipe]
})
export class StatementViewExportDialog {
  /* Dependency Injection */
  public readonly dialogRef = inject(MatDialogRef<StatementViewExportDialog>);
  protected DIALOG_DATA: any = inject(MAT_DIALOG_DATA);
  private readonly api = inject(ApiService);
  private readonly alert = inject(AlertService);
  private readonly datePipe = inject(DatePipe);
  private readonly document = inject(DOCUMENT);

  /* Variables */
  protected step = signal<1 | 2>(1);
  protected filterForm: FormGroup = new FormGroup({
    limit: new FormControl(0),
    _limit: new FormControl(''), // to not show 0
    page: new FormControl(1),
    startDate: new FormControl(''),
    endDate: new FormControl(''),
    type: new FormControl<'' | 'cash-in' | 'cash-out'>(""),
    pagination: new FormControl(false),
    byDuration: new FormControl<'last-week' | 'last-month' | 'custom-date-range' | ''>(''),
  });
  protected expenses = signal<Array<any>>([]);
  protected sendingMailLoader = signal<boolean>(false);

  constructor() { }

  protected getExpenses(filter: any) {
    let url: string = `api/expense/fetch-by-filter-with-report?page=${filter?.page || 1}&pagination=${!!filter?.pagination}`;
    ((filter?.startDate && filter.startDate.toString()?.length) && (filter?.endDate && filter.endDate?.toString()?.length)) ? (url += `&startDate=${filter.startDate}&endDate=${filter.endDate}&limit=0`) : (url += `&limit=${filter?.limit || 10}`);
    (filter?.type && filter.type.length) && (url += '&type=' + filter.type);

    this.api.get(url).subscribe({
      next: (res: any) => {
        this.expenses.set(res?.data?.docs || []);
      },
      error: (error: any) => {
        console.log("error: ", error);
        this.alert.toast('Failed to fetch statement', 'error');
      }
    });
  }

  formValueChange(controlName: '_limit' | 'byDuration') {
    setTimeout(() => {
      const value = this.filterForm.controls[controlName].value;

      switch (controlName) {
        case '_limit':
          if (value && value.toString().length) { // _limit>0  then
            this.filterForm.controls['startDate'].patchValue('');
            this.filterForm.controls['endDate'].patchValue('');
            this.filterForm.controls['byDuration'].patchValue('');
            this.filterForm.controls['pagination'].patchValue(true);
            this.filterForm.controls['limit'].patchValue(value);
          } else {
            this.filterForm.controls['pagination'].patchValue(false);
            this.filterForm.controls['limit'].patchValue(0);
          }
          break;
        case 'byDuration':
          if (value && value.length) {
            this.filterForm.controls['limit'].patchValue(0);
            this.filterForm.controls['_limit'].patchValue('');

            if (value == 'last-week' || value == 'last-month') {
              if (value == 'last-week') {
                // Get today's date and set time to 23:59:59
                const currentDate = new Date();
                currentDate.setHours(23, 59, 59, 999); // Set time to 23:59:59.999

                // Get the date 7 days ago and set time to 00:00:00
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(currentDate.getDate() - 6);
                sevenDaysAgo.setHours(0, 0, 0, 0); // Set time to 00:00:00.000

                // Patch the values into the form controls
                this.filterForm.controls['startDate'].patchValue(sevenDaysAgo);
                this.filterForm.controls['endDate'].patchValue(currentDate);
              } else {
                // Get today's date and set time to 23:59:59
                const currentDate = new Date();
                currentDate.setHours(23, 59, 59, 999); // Set time to 23:59:59.999

                // Get the date 30 days ago and set time to 00:00:00
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(currentDate.getDate() - 29);
                thirtyDaysAgo.setHours(0, 0, 0, 0); // Set time to 00:00:00.000

                // Patch the values into the form controls
                this.filterForm.controls['startDate'].patchValue(thirtyDaysAgo);
                this.filterForm.controls['endDate'].patchValue(currentDate);
              }
            }
          } else {
            this.filterForm.controls['startDate'].patchValue('');
            this.filterForm.controls['endDate'].patchValue('');
          }
          break;
        default:
          break;
      }
    }, 50);
  }

  protected rangePickerClickedFromInput(rangePicker: MatDateRangePicker<any>) {
    const byDurationValue = this.filterForm.controls['byDuration'].value;
    if (byDurationValue == 'custom-date-range') {
      rangePicker.open();
    }
  }

  protected getHeading(): string {
    const limit = this.filterForm.controls['limit'].value;
    const duration = this.filterForm.controls['byDuration'].value;
    const type = this.filterForm.controls['type'].value;
    let msg: string = '';

    if (limit > 0) msg = 'Last ' + limit + (limit > 1 ? ' transactions' : ' transaction');
    else if (duration.length) {
      switch (duration) {
        case 'last-week':
          msg = 'Last 7 day\'s transactions';
          break;
        case 'last-month':
          msg = 'Last 30 day\'s transactions';
          break;
        case 'custom-date-range':
          msg = 'Transactions between ' + this.datePipe.transform(this.filterForm.controls['startDate'].value, 'dd/MM/yyyy') + ' and ' + this.datePipe.transform(this.filterForm.controls['endDate'].value, 'dd/MM/yyyy');
          break;
        default:
          break;
      }
    }

    if (type.length) {
      if (type == 'cash-out') msg += ' - ( Cash Out )';
      else msg += ' - ( Cash In )';
    }
    return msg;
  }

  protected exportOrEmailStatement(sendMail: boolean = false): void {
    const _expenses = this.expenses();
    if (!_expenses.length) {
      this.alert.toast('No transactions found', 'warning');
      return;
    }

    const filter = { ...this.filterForm.value };
    let url: string = `api/expense/export-statement?sendMail=${sendMail}&page=${filter?.page || 1}&pagination=${!!filter?.pagination}`;
    ((filter?.startDate && filter.startDate.toString()?.length) && (filter?.endDate && filter.endDate?.toString()?.length)) ? (url += `&startDate=${filter.startDate}&endDate=${filter.endDate}&limit=0`) : (url += `&limit=${filter?.limit || 10}`);
    (filter?.type && filter.type.length) && (url += '&type=' + filter.type);

    if (sendMail) {
      this.sendingMailLoader.set(true)
      this.api.get(url).subscribe({
        next: (res: any) => {
          if (res.status == 200) {
            console.log("res: ", res);
            this.alert.toast(res.message, 'success');
            this.sendingMailLoader.set(false);
          } else {
            console.log("error: ", res);
            this.alert.toast(res.message, 'error');
            this.sendingMailLoader.set(false);
          }
        },
        error: (error: any) => {
          console.log("error: ", error);
          this.alert.toast('Failed to send e-statement on mail', 'error');
          this.sendingMailLoader.set(false);
        }
      });
    } else {
      this.api.downloadPdf(url).subscribe({
        next: (res: Blob) => {
          const blob = new Blob([res], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          const a = this.document.createElement('a');
          a.href = url;
          a.download = `statement-${new Date().toISOString()}.pdf`;
          a.click();
          URL.revokeObjectURL(url);
        },
        error: (error: any) => {
          console.log("error: ", error);
          this.alert.toast('Failed to export statement', 'error');
        }
      })
    }
  }
}
