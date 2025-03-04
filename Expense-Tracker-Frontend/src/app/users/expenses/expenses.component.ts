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
import { MiddleEllipsisDirective } from '@directives';

@Component({
  selector: 'app-expenses',
  imports: [ReactiveFormsModule, FormsModule, MatFormFieldModule, MatDatepickerModule,
    MatSelectModule, MatInputModule, MatButton, MatNativeDateModule, NgxPaginationModule,
    NgStyle, MatIcon, DatePipe, CurrencyPipe, MiddleEllipsisDirective],
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
  protected form: FormGroup = new FormGroup({
    amount: new FormControl('', [Validators.required, Validators.pattern(/^[0-9]+(\.[0-9]{1,2})?$/)]),
    description: new FormControl('', Validators.required),
    categoryId: new FormControl('', Validators.required),
    type: new FormControl('cash-in', Validators.required),
    date: new FormControl(new Date(), Validators.required),
  });
  protected documentArray = signal<Array<{ file: File, url: string, name: string }>>([]);

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
    console.log("tempDocArr: ", tempDocArr);
  }
  private checkUploadedFileType(file: File) {
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
    if (allowedFiles.includes(file.type)) return true;
    else {
      this.alert.toast('Invalid file type. Only images, PDFs, Words, Excels, and CSV are allowed.', 'error');
      return false;
    }
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
      let _form = document.getElementById('add-expense-form');
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
        console.log("res: ", res);
        this.alert.toast('Expense added successfully', 'success');
        this.form.reset();
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

}
