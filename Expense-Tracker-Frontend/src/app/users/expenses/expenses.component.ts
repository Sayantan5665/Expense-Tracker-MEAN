import { Component, effect, inject, ResourceRef, signal, viewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule, MatDateRangePicker } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { AlertService, ApiService, EventService } from '@services';
import { NgxPaginationModule } from 'ngx-pagination';
import { CurrencyPipe, DatePipe, NgStyle } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-expenses',
  imports: [ReactiveFormsModule, FormsModule, MatFormFieldModule, MatDatepickerModule, MatSelectModule,
    MatInputModule, MatButton, MatNativeDateModule, NgxPaginationModule, NgStyle, MatIcon, DatePipe, CurrencyPipe],
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.scss',
  providers: [provideNativeDateAdapter()],
})
export class ExpensesComponent {
  private readonly api = inject(ApiService);
  private readonly alert = inject(AlertService);
  private readonly event = inject(EventService);
  private readonly fb = inject(FormBuilder);

  protected expenseForm!: FormGroup;
  protected dateRangeForm!: FormGroup;
  protected filterOption = signal({
    limit: 10,
    page: 1,
    sortOrder: 'desc',
    sortField: 'createdAt',
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date(),
    categoryId: null,
    type: null,
    pagination: true,
  });

  protected expenses:ResourceRef<any> = rxResource({
    request: () => ({ filterOption: this.filterOption() }),
    loader: (e) => {
      const filter = e.request.filterOption;
      return this.api.get(`api/expense/fetch-by-filter-with-report?startDate=${filter.startDate}&endDate=${filter.endDate}`);
    },
  });

  constructor() {
    this.initForms();

    effect(() => {
      const error = this.expenses.error();
      if (error) {
        console.log("error: ", error);
        this.alert.toast('Error fetching expenses', 'error');
      }
      const data = this.expenses.value();
      if (data) {
        console.log("expenses: ", data);
      }
    });

  }


  private initForms(): void {
    this.expenseForm = this.fb.group({
      amount: [null, [Validators.required, Validators.min(1)]],
      date: [new Date(), Validators.required],
      categoryId: [null, Validators.required],
      description: ['', Validators.required],
      paymentMethod: ['cash', Validators.required]
    });

    this.dateRangeForm = this.fb.group({
      start: [null],
      end: [null]
    });
  }

  protected pageChangeEvent(event: any) {
    console.log("pageChangeEvent: ", event);
  }

}
