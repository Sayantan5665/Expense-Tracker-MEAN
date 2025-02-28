import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { AlertService, ApiService, EventService } from '@services';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-expenses',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatDatepickerModule, MatSelectModule, MatInputModule, FormsModule, MatNativeDateModule, NgxPaginationModule],
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
    startDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
    endDate: new Date(),
    categoryId: null,
    type: null,
    pagination: true,
  });

  protected expenses = rxResource({
    request: () => ({ filterOption: this.filterOption() }),
    loader: (e) => {
      const filter = e.request.filterOption;
      return this.api.get(`api/expense/fetch-by-filter-with-report?startDate=${filter.startDate}&endDate=${filter.endDate}`);
    },
  });

  constructor() {
    this.initForms();
  }

  initForms(): void {
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

  pageChangeEvent(event:any) {
    console.log("pageChangeEvent: ", event);
  }
}
