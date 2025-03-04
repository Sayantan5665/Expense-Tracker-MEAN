import { Component, effect, inject, ResourceRef, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { AlertService, ApiService } from '@services';
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

  protected filterOption = signal({
    limit: 10,
    page: 1,
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date(),
    categoryId: "",
    type: "",
    pagination: true,
  });
  protected expenseForm: FormGroup = new FormGroup({
    documents: new FormControl(),
    amount: new FormControl(0, [Validators.required, Validators.pattern(/^[0-9]+(\.[0-9]{1,2})?$/)]),
    description: new FormControl('', Validators.required),
    categoryId: new FormControl('', Validators.required),
    type: new FormControl('cash-in', Validators.required),
    date: new FormControl(new Date(), Validators.required),
  });
  protected documentArray!:Array<{file:File, url:string, name:string}>;

  protected expenses:ResourceRef<any> = rxResource({
    request: () => ({ filterOption: this.filterOption() }),
    loader: (e) => {
      const filter = e.request.filterOption;
      let url = `api/expense/fetch-by-filter-with-report?startDate=${filter.startDate}&endDate=${filter.endDate}&limit=${filter?.limit || 10}&page=${filter?.page || 1}&pagination=${!!filter?.pagination}`;
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
    /** For Expenses List */
    effect(() => {
      const error = this.expenses.error();
      if (error) {
        console.log("error: ", error);
        this.alert.toast('Error fetching expenses', 'error');
      }
    });

    /** For Categories List */
    effect(() => {
      const error = this.categories.error();
      if (error) {
        console.log("error: ", error);
        this.alert.toast('Error fetching categories', 'error');
      }
    });
  }


  protected pageChangeEvent(e: number): void {
    console.log("e: ", e);
    this.filterOption.update((value) => {
      return { ...value, page: e };
    });
  }

}
