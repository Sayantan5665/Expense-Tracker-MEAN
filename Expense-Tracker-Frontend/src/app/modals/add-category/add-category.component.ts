import { DOCUMENT } from '@angular/common';
import { Component, computed, effect, inject, ResourceRef, Signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { AlertService, ApiService, EventService } from '@services';
import { IUser } from '@types';

@Component({
  selector: 'app-add-category',
  imports: [MatIcon, MatDialogModule, ReactiveFormsModule],
  templateUrl: './add-category.component.html',
  styleUrl: './add-category.component.scss'
})
export class AddCategoryDialog {
  readonly dialogRef = inject(MatDialogRef<AddCategoryDialog>);
  protected DIALOG_DATA: { isEditing: boolean, categoryData?: any } = inject(MAT_DIALOG_DATA);
  private readonly api = inject(ApiService);
  private readonly alert = inject(AlertService);
  private readonly event = inject(EventService);
  private readonly document = inject(DOCUMENT);

  protected user: Signal<IUser | null> = computed(() => this.event.userDetails());
  protected form: FormGroup = new FormGroup({
    name: new FormControl('', Validators.required),
    colorId: new FormControl('', [Validators.required]),
    isDefault: new FormControl({ value: false, disabled: true }),
    description: new FormControl('', [Validators.required]),
  });

  protected colorsList: ResourceRef<any> = rxResource({
    loader: () => {
      return this.api.get('api/color/fetch/all');
    },
  });

  constructor() {
    effect(() => {
      const _user = this.user();
      if (_user && _user.role?.toLowerCase() === 'admin') {
        this.form.controls['isDefault'].enable();
      } else {
        this.form.controls['isDefault'].disable();
      }
    });

    effect(() => {
      const error = this.colorsList.error();
      if (error) {
        console.log("error: ", error);
      }
    });

    if (this.DIALOG_DATA.isEditing && this.DIALOG_DATA.categoryData) {
      const category = this.DIALOG_DATA.categoryData;
      const data = {
        name: category?.name || '',
        colorId: category?.color?._id || '',
        isDefault: category?.isDefault,
        description: category?.description || ''
      }
      this.form.patchValue(data);
    }
  }

  protected submit(form: FormGroup): void {
    if (form.valid) {
      console.log("form.value: ", form.value);
      if (this.DIALOG_DATA.isEditing && this.DIALOG_DATA.categoryData) {
        this.editCategory(form.value);
      } else {
        this.addCategory(form.value);
      }
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

  private addCategory(data: any): void {
    this.api.post('api/category/create', data).subscribe({
      next: () => {
        this.alert.toast('Category added successfully', 'success');
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.alert.toast(error.error.message || 'Something went wrong', 'error');
      },
    })
  }

  private editCategory(data: any): void {
    this.api.put(`api/category/edit/${this.DIALOG_DATA?.categoryData?._id}`, data).subscribe({
      next: () => {
        this.alert.toast('Category updated successfully', 'success');
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.alert.toast(error.error.message || 'Something went wrong', 'error');
      },
    })
  }
}
