import { DOCUMENT, NgStyle } from '@angular/common';
import { Component, effect, inject, ResourceRef, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { ActivatedRoute } from '@angular/router';
import { MiddleEllipsisDirective } from '@directives';
import { AlertService, ApiService } from '@services';
import { DocViewerDialog } from 'src/app/modals/doc-viewer/doc-viewer.component';

@Component({
  selector: 'app-expense-view-edit',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatDatepickerModule, MatInput, NgStyle, MiddleEllipsisDirective],
  templateUrl: './expense-view-edit.component.html',
  styleUrl: './expense-view-edit.component.scss',
  providers: [provideNativeDateAdapter()],
})
export class ExpenseViewEditComponent {
  /* Dependency Injection */
  private readonly api = inject(ApiService);
  private readonly alert = inject(AlertService);
  private readonly document = inject(DOCUMENT);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);

  /* Api calls */
  protected categories: ResourceRef<any> = rxResource({
    loader: () => {
      return this.api.get('api/category/fetch/all');
    },
  });

  /* Variables */
  protected editing = signal<boolean>(false);
  protected expenseId = signal<string>('');
  protected expense = signal<any>({});
  protected form: FormGroup = new FormGroup({
    amount: new FormControl('', [Validators.required, Validators.pattern(/^[0-9]+(\.[0-9]{1,2})?$/)]),
    description: new FormControl('', Validators.required),
    categoryId: new FormControl('', Validators.required),
    type: new FormControl('', Validators.required),
    date: new FormControl('', Validators.required),
  });
  protected documentArray = signal<Array<{ file: File, url: string, name: string }>>([]);

  constructor() {
    this.activatedRoute.paramMap.subscribe(params => {
      this.expenseId.set(params.get('id') || '');
      this.getCategoryDetails();
    });

    effect(() => {
      const editing = this.editing();
      if (editing) {
        this.form.enable();
      } else {
        this.form.disable();
      }
    });
  }

  private getCategoryDetails() {
    const id = this.expenseId();
    this.api.get(`api/expense/fetch-by-id/${id}`).subscribe({
      next: (response: any) => {
        const expense = response.data;
        this.expense.set(response.data);
        this.form.patchValue({
          categoryId: expense?.category?._id,
          description: expense?.description || '',
          type: expense?.type || '',
          amount: expense?.amount || '',
          date: expense?.date ? new Date(expense?.date) : '',
        });
        this.documentArray.set(expense?.documents?.map((doc: any) => ({ file: null, url: doc.path, name: doc.originalName })));
      },
      error: (error) => {
        console.log("error: ", error);
        this.alert.toast(error.error.message || 'Somthing went wrong', 'error');
      },
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
    for (let [key, value] of data.entries()) {
      console.log(key, ": ", value, ";");
    }

    const id = this.expenseId();
    this.api.put(`api/expense/edit/${id}`, data).subscribe({
      next: (res) => {
        this.alert.toast('Expense added successfully', 'success');
        this.form.reset();
        documentInput.value = '';
        this.documentArray.set([]);
        this.getCategoryDetails(); // to patch updated data
        this.editing.set(false);
      },
      error: (err) => {
        console.log("err: ", err);
        this.alert.toast('Error adding expense', 'error');
      },
    });
  }

  protected viewDocuments(doc:any) {
    this.dialog.open(DocViewerDialog, {
      data: {
        url: doc.url,
        name: doc.name,
      },
      panelClass: 'doc-viewer-dialog',
    })
  }
}
