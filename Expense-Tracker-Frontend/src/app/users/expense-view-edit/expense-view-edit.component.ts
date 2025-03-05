import { DOCUMENT } from '@angular/common';
import { Component, inject, ResourceRef, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AlertService, ApiService, EventService } from '@services';

@Component({
  selector: 'app-expense-view-edit',
  imports: [ReactiveFormsModule],
  templateUrl: './expense-view-edit.component.html',
  styleUrl: './expense-view-edit.component.scss'
})
export class ExpenseViewEditComponent {
  /* Injected Variables */
  private readonly api = inject(ApiService);
  private readonly alert = inject(AlertService);
  private readonly event = inject(EventService);
  private readonly document = inject(DOCUMENT);
  private readonly activatedRoute = inject(ActivatedRoute);

  /* Variables */
  protected expenseId = signal<string>('');
  protected form: FormGroup = new FormGroup({
    amount: new FormControl('', [Validators.required, Validators.pattern(/^[0-9]+(\.[0-9]{1,2})?$/)]),
    description: new FormControl('', Validators.required),
    categoryId: new FormControl('', Validators.required),
    type: new FormControl('cash-in', Validators.required),
    date: new FormControl(new Date(), Validators.required),
  });

  constructor() {
    this.activatedRoute.paramMap.subscribe(params => {
      this.expenseId.set(params.get('id') || '');
      this.getCategoryDetails();
    });
  }

  getCategoryDetails() {
    const id = this.expenseId();
    this.api.get(`api/expense/fetch-by-id/${id}`).subscribe({
      next: (response: any) => {
        const expense = response.data;
        console.log("expense: ", expense);
        this.form.patchValue({
          categoryId: expense._id,
          description: expense.description,
          type: expense.type,
        });
      },
      error: (error) => {
        console.log("error: ", error);
        this.alert.toast(error.error.message || 'Somthing went wrong', 'error');
      },
    });
  }
}
