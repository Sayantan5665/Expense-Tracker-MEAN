import { Component, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatSelectModule} from '@angular/material/select';
import { provideNativeDateAdapter } from '@angular/material/core';

@Component({
  selector: 'app-expenses',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatDatepickerModule, MatSelectModule],
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.scss',
  providers: [provideNativeDateAdapter()],
})
export class ExpensesComponent {
  @ViewChild('expenseModal') expenseModal!: TemplateRef<any>;
  @ViewChild('deleteConfirmModal') deleteConfirmModal!: TemplateRef<any>;

  expenseForm!: FormGroup;
  dateRangeForm!: FormGroup;
  isEditMode = false;
  expenseIdToDelete: string | null = null;

  // These will eventually be replaced with dynamic data
  months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
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

  onCategoryChange(categoryId: string): void {
    console.log('Category changed to:', categoryId);
    // You'll implement filtering logic here later
  }

  onSortChange(sortOption: string): void {
    console.log('Sort option changed to:', sortOption);
    // You'll implement sorting logic here later
  }

  resetFilters(): void {
    console.log('Filters reset');
    // Reset all filters to default values
  }

  openAddExpenseModal(): void {
    this.isEditMode = false;
    this.expenseForm.reset({
      date: new Date(),
      paymentMethod: 'cash'
    });
    this.dialog.open(this.expenseModal, {
      width: '600px'
    });
  }

  editExpense(expense: any): void {
    this.isEditMode = true;
    // In a real implementation, you'd populate the form with expense data
    this.expenseForm.patchValue({
      amount: expense.amount || 0,
      date: expense.date || new Date(),
      categoryId: expense.categoryId || null,
      description: expense.description || '',
      paymentMethod: expense.paymentMethod || 'cash'
    });
    this.dialog.open(this.expenseModal, {
      width: '600px'
    });
  }

  saveExpense(): void {
    if (this.expenseForm.invalid) {
      return;
    }

    const expenseData = this.expenseForm.value;
    console.log('Saving expense:', expenseData);

    // Here you would make an API call to save the expense
    // If successful, close the modal and refresh the list
    this.dialog.closeAll();
  }

  confirmDeleteExpense(expenseId: string): void {
    this.expenseIdToDelete = expenseId;
    this.dialog.open(this.deleteConfirmModal, {
      width: '400px'
    });
  }

  deleteExpense(): void {
    console.log('Deleting expense:', this.expenseIdToDelete);
    // Here you would make an API call to delete the expense
    // If successful, close the modal and refresh the list
    this.dialog.closeAll();
    this.expenseIdToDelete = null;
  }

  cancelDelete(): void {
    this.dialog.closeAll();
    this.expenseIdToDelete = null;
  }

  goToPage(page: number): void {
    console.log('Navigating to page:', page);
    // Implement pagination logic here
  }
}
