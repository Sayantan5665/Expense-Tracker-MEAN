import { Component, computed, effect, inject, ResourceRef, Signal, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { AlertService, ApiService, EventService } from '@services';
import { NgxPaginationModule } from 'ngx-pagination';
import { CurrencyPipe, DatePipe, DOCUMENT, NgStyle } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { MiddleEllipsisDirective } from '@directives';
import { IUser } from '@types';
import { hexToRgba } from '@utils';
import { MatDialog } from '@angular/material/dialog';
import { AddCategoryDialog } from 'src/app/modals/add-category/add-category.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-expenses',
  imports: [ReactiveFormsModule, FormsModule, MatFormFieldModule, MatDatepickerModule,
    MatSelectModule, MatInputModule, MatButton, MatNativeDateModule, NgxPaginationModule,
    NgStyle, MatIcon, DatePipe, CurrencyPipe, MiddleEllipsisDirective, RouterLink],
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.scss',
  providers: [provideNativeDateAdapter()],
})
export class ExpensesComponent {
  /* Dependency Injection */
  private readonly api = inject(ApiService);
  private readonly alert = inject(AlertService);
  private readonly event = inject(EventService);
  private readonly dialog = inject(MatDialog);
  private readonly document = inject(DOCUMENT);

  /* Variables */
  protected hexToRgba = hexToRgba;
  protected user: Signal<IUser | null> = computed(() => this.event.userDetails());
  protected filterOption = signal({
    limit: 10,
    page: 1,
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date(),
    categoryId: "",
    type: "",
    pagination: true,
  });
  protected form: FormGroup = new FormGroup({
    amount: new FormControl('', [Validators.required, Validators.pattern(/^[0-9]+(\.[0-9]{1,2})?$/)]),
    description: new FormControl('', Validators.required),
    categoryId: new FormControl('', Validators.required),
    type: new FormControl('cash-in', Validators.required),
    date: new FormControl(new Date(), Validators.required),
  });
  protected documentArray = signal<Array<{ file: File, url: string, name: string }>>([]);
  protected searchCategoryText = signal<string>('');

  /* Api calls */
  protected expenses: ResourceRef<any> = rxResource({
    request: () => ({ filterOption: this.filterOption() }),
    loader: (e) => {
      const filter = e.request.filterOption;
      let url = `api/expense/fetch-by-filter-with-report?startDate=${filter.startDate}&endDate=${filter.endDate}&limit=${filter?.limit || 10}&page=${filter?.page || 1}&pagination=${!!filter?.pagination}`;
      (filter.categoryId && filter.categoryId.length) && (url += '&categoryId=' + filter.categoryId);
      (filter.type && filter.type.length) && (url += '&type=' + filter.type);
      return this.api.get(url);
    },
  });
  protected categories: ResourceRef<any> = rxResource({
    loader: () => {
      return this.api.get('api/category/fetch/all');
    },
  });
  protected ownCategories: ResourceRef<any> = rxResource({
    request: () => ({ search: this.searchCategoryText() }),
    loader: (e) => {
      const search = e.request.search || '';
      return this.api.get(`api/category/fetch/all?yourOwn=true&search=${search}`);
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

    /** For Your Own Categories List */
    effect(() => {
      const error = this.ownCategories.error();
      if (error) {
        console.log("error: ", error);
        this.alert.toast('Error fetching your categories', 'error');
      }
    });
  }

  protected documentUploadHandeler(event: any, documentInput: HTMLInputElement) {
    const files = event.target.files;
    const tempDocArr: Array<{ file: File, url: string, name: string }> = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!this.checkUploadedFileType(file)) {
        this.documentArray.set([]);
        documentInput.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = (e: any) => {
        tempDocArr.push({ file, url: e.target.result as string, name: file.name });
      };
      reader.readAsDataURL(file);
    }
    this.documentArray.set(tempDocArr);
  }

  private checkUploadedFileType(file: File) {
    console.log("file: ", file);
    const allowedFiles = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'image/gif',
      'image/svg+xml',
      'image/webp',
      'image/apng',
      'application/pdf',
      'application/msword',
      'application/vnd.ms-excel',
      'application/wps-office.xlsx',
      'text/csv',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/wps-office.docx',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    if (allowedFiles.includes(file.type)) {
      // Check if the file size is within the limit (25 MB)
      const maxFileSize = 25 * 1024 * 1024; // 25 MB in bytes
      if (file.size > maxFileSize) {
        this.alert.toast('File size exceeds the maximum limit of 25 MB.', 'error');
        return false;
      } else return true;
    }
    else {
      this.alert.toast('Invalid file type. Only images, PDFs, Words, Excels, and CSV are allowed.', 'error');
      return false;
    }
  }

  protected removeUploadedFiles(index: number, documentInput: HTMLInputElement): void {
    // Get the current files from the input element
    const currentFiles = documentInput.files;

    // Create a new DataTransfer object to hold the new files
    const dataTransfer = new DataTransfer();

    if (currentFiles && currentFiles.length) {
      // Loop through the current files and add them to the DataTransfer object, except the one at the specified index
      for (let i = 0; i < currentFiles.length; i++) {
        if (i !== index) {
          dataTransfer.items.add(currentFiles[i]);
        }
      }

      // Update the files property of the input element with the new FileList
      documentInput.files = dataTransfer.files;
    } else {
      // Reset the input element to its original state
      documentInput.value = '';
    }

    // Update the documentArray
    const tempDocArr = [...this.documentArray()];
    tempDocArr.splice(index, 1);
    this.documentArray.set(tempDocArr);
  }

  protected submit(form: FormGroup, documentInput: HTMLInputElement): void {
    if (form.valid) {
      const values = form.value;
      const documents = this.documentArray();

      if (documents.length > 5) {
        this.alert.toast('Maximum 5 documents can be uploaded', 'warning');
        return;
      }

      const formData = new FormData();
      Object.keys(values).forEach((key) => {
        formData.append(key, values[key]);
      });
      documents.forEach((doc) => {
        formData.append('documents', doc.file);
      });

      this.addExpense(formData, documentInput);
    } else {
      form.markAllAsTouched();

      /**Scroll to the first invalid field */
      let _form = this.document.getElementById('add-expense-form');
      if (_form) {
        let firstInvalidControl = _form.getElementsByClassName('ng-invalid')[0];
        firstInvalidControl?.scrollIntoView({ behavior: "smooth" });
      }
    }
  }

  private addExpense(data: FormData, documentInput: HTMLInputElement) {
    // for (let [key, value] of data.entries()) {
    //   console.log(key, ": ", value, ";");
    // }
    this.api.post('api/expense/add', data).subscribe({
      next: (res) => {
        this.alert.toast('Expense added successfully', 'success');
        this.form.reset();
        this.form.patchValue({ amount: '', description: '', categoryId: '', type: 'cash-in', date: new Date(), });
        documentInput.value = '';
        this.documentArray.set([]);
        this.filterOption.set({ // reset filter so that the expense list is updated and displayed the recent expenses
          limit: 10,
          page: 1,
          startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          endDate: new Date(),
          categoryId: "",
          type: "",
          pagination: true,
        });
      },
      error: (err) => {
        console.log("err: ", err);
        this.alert.toast('Error adding expense', 'error');
      },
    });
  }

  protected limitChange(): void {
    this.filterOption.update((values) => ({ ...values, page: 1 }));
  }

  protected pageChangeEvent(e: number): void {
    this.filterOption.update((value) => {
      return { ...value, page: e };
    });
  }

  protected addCategory(isEditing: boolean, categoryData?: any): void {
    if (!categoryData) isEditing = false;
    const dialogRef = this.dialog.open(AddCategoryDialog, {
      panelClass: 'add-category-panel',
      data: {
        isEditing,
        categoryData,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.ownCategories.reload();
        this.categories.reload();
        if (isEditing) {
          this.expenses.reload();
        }
      }
    });
  }

  protected deleteExpense(expenseId: string): void {
    this.api.delete(`api/expense/delete/${expenseId}`).subscribe({
      next: () => {
        this.alert.toast('Expense deleted successfully', 'success');
        this.filterOption.update((value) => ({ ...value, page: 1 })); // reset page to 1 so that the expense list is updated and displayed the recent expenses
      },
      error: (err) => {
        console.log("err: ", err);
        this.alert.toast('Error deleting expense', 'error');
      },
    });
  }
}
