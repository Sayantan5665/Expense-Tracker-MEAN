import { NgStyle } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AlertService, ApiService } from '@services';
import { IRegister } from '@types';
import { PasswordMatchValidator } from '@utils';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, NgStyle, MatProgressSpinner],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private readonly api = inject(ApiService);
  private readonly alert = inject(AlertService);
  private readonly router = inject(Router);

  protected form: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    // last_name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,4}$/)]),
    password: new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z0-9!@#$%^&*())]{6,}/)]),
    confirmPassword: new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z0-9!@#$%^&*())]{6,}/)]),
  },
    [PasswordMatchValidator('password', 'confirmPassword')]
  );
  protected profile_pic = signal<{ file: File | undefined, url: string }>({ file: undefined, url: '' });
  protected tooglePassword = signal<'text' | 'password'>('password');
  protected toogleConfirmPassword = signal<'text' | 'password'>('password');
  protected loading = signal<boolean>(false);

  protected handleImageUpload(file: any) {
    const img: File = file.target.files[0];
    if (img && this.checkType(img)) {
      this.profile_pic.set({ file: img, url: URL.createObjectURL(img) })
    }
  }

  private checkType(file: File) {
    return file.type.split('/')[0] === 'image' ? true : false;
  }

  protected submit(form: FormGroup): void {
    if (form.valid) {
      const data: IRegister = form.value;
      this.register(data);
    } else {
      form.markAllAsTouched();

      /**Scroll to the first invalid field */
      let _form = document.getElementById('register-form');
      if (_form) {
        let firstInvalidControl = _form.getElementsByClassName('ng-invalid')[0];
        firstInvalidControl?.scrollIntoView({ behavior: "smooth" });
      }
    }
  }

  private register(data: any) {
    this.loading.set(true);
    const _profile_pic = this.profile_pic();
    data.email = data.email.toLowerCase();

    const formData = new FormData();
    _profile_pic.file && formData.append('image', _profile_pic.file);
    Object.keys(data).forEach((key) => {
      formData.append(key, data[key]);
    })

    // for (let [key, value] of formData.entries()) {
    //   console.log(key, ": ", value, ";");
    // }

    this.api.post('api/user/register', formData).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.alert.toast("Registration successful! Please login.", 'success');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading.set(false);
        console.error("err: ", err);
        this.alert.toast(err.message || "Something went wrong!", 'error');
      }
    });
  }
}
