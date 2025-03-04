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
  protected filterOption = signal({
    limit: 10,
    page: 1,
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date(),
    categoryId: "",
    type: "",
    pagination: true,
  });

  protected expenses:ResourceRef<any> = rxResource({
    request: () => ({ filterOption: this.filterOption() }),
    loader: (e) => {
      const filter = e.request.filterOption;
      let url = `api/expense/fetch-by-filter-with-report?startDate=${filter.startDate}&endDate=${filter.endDate}&limit=${filter?.limit || 10}&page=${filter?.page || 1}`;
      (filter.categoryId && filter.categoryId.length) && (url += '&categoryId=' + filter.categoryId);
      (filter.type && filter.type.length) && (url += '&type=' + filter.type);
      return this.api.get(url);
    },
  });
  protected categories:ResourceRef<any> = rxResource({
    loader: () => {
      return this.api.get('api/category/fetch/all');
    },
  });

  constructor() {
    this.initForms();

    /** For Expenses List */
    effect(() => {
      const error = this.expenses.error();
      if (error) {
        console.log("error: ", error);
        this.alert.toast('Error fetching expenses', 'error');
      }
      // const data = this.expenses.value();
      // if (data) {
      //   console.log("expenses: ", data);
      // }
    });

    /** For Categories List */
    effect(() => {
      const error = this.categories.error();
      if (error) {
        console.log("error: ", error);
        this.alert.toast('Error fetching categories', 'error');
      }
      const data = this.categories.value();
      if (data) {
        console.log("categories: ", data);
      }
    });

    effect(() => {
      const filter = this.filterOption();
      console.log("filter: ", filter);
    })
  }


  private initForms(): void {
    this.expenseForm = this.fb.group({
      amount: [null, [Validators.required, Validators.min(1)]],
      date: [new Date(), Validators.required],
      categoryId: [null, Validators.required],
      description: ['', Validators.required],
      paymentMethod: ['cash', Validators.required]
    });
  }

  protected pageChangeEvent(e: number): void {
    console.log("e: ", e);
    this.filterOption.update((value) => {
      return { ...value, page: e };
    });
  }

}
